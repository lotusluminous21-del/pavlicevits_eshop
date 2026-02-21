import { create } from 'zustand';

// Simple IndexedDB wrapper for fluid state
const DB_NAME = 'FluidSimDB';
const STORE_NAME = 'fluid_state';
const DB_VERSION = 1;

async function openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        request.onupgradeneeded = (event) => {
            const db = (event.target as IDBOpenDBRequest).result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME);
            }
        };
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

async function idbSet(key: string, val: any) {
    const db = await openDB();
    return new Promise<void>((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        tx.objectStore(STORE_NAME).put(val, key);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
    });
}

async function idbGet(key: string) {
    const db = await openDB();
    return new Promise<any>((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const req = tx.objectStore(STORE_NAME).get(key);
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
    });
}

interface FluidState {
    width: number;
    height: number;
    frame: number;
    pixels: Float32Array | null;
    isReady: boolean;
    saveState: (width: number, height: number, frame: number, pixels: Float32Array) => void;
    loadFromStorage: () => Promise<void>;
    clearState: () => void;
}

export const useFluidStore = create<FluidState>((set) => ({
    width: 0,
    height: 0,
    frame: 0,
    pixels: null,
    isReady: false,
    saveState: (width, height, frame, pixels) => {
        set({ width, height, frame, pixels, isReady: true });
        // Save to IndexedDB asynchronously
        idbSet('last_state', { width, height, frame, pixels }).catch(e => console.error("IDB Save error", e));
    },
    loadFromStorage: async () => {
        try {
            const data = await idbGet('last_state');
            if (data && data.pixels) {
                set({
                    width: data.width,
                    height: data.height,
                    frame: data.frame,
                    pixels: data.pixels,
                    isReady: true
                });
            } else {
                set({ isReady: true }); // Mark ready even if empty
            }
        } catch (e) {
            console.error("IDB Load error", e);
            set({ isReady: true });
        }
    },
    clearState: () => set({ width: 0, height: 0, frame: 0, pixels: null, isReady: false }),
}));
