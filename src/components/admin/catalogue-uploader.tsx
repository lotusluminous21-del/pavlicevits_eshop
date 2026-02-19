"use client";

import { useState } from 'react';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { app } from '@/lib/firebase';
import { UploadCloud, FileType, CheckCircle2, AlertCircle } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

export function CatalogueUploader() {
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [dragActive, setDragActive] = useState(false);

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleUpload(e.dataTransfer.files[0]);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            handleUpload(e.target.files[0]);
        }
    };

    const handleUpload = async (file: File) => {
        setUploading(true);
        setProgress(0);

        try {
            const db = getFirestore(app);
            const storage = getStorage(app);

            // 1. Create Job
            const jobRef = await addDoc(collection(db, 'ingestion_jobs'), {
                file_name: file.name,
                status: 'uploading',
                progress: 0,
                created_at: serverTimestamp(),
                updated_at: serverTimestamp(),
                type: 'manual_upload'
            });

            // 2. Upload
            const fileName = `catalogues/${Date.now()}_${file.name}`;
            const storageRef = ref(storage, fileName);

            const uploadTask = uploadBytesResumable(storageRef, file, {
                customMetadata: { jobId: jobRef.id }
            });

            uploadTask.on(
                'state_changed',
                (snapshot) => {
                    const p = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    setProgress(p);
                },
                (error) => {
                    console.error("Upload failed:", error);
                    setUploading(false);
                },
                () => {
                    getDownloadURL(uploadTask.snapshot.ref).then(() => {
                        setUploading(false);
                    });
                }
            );

        } catch (error) {
            console.error("Error starting upload:", error);
            setUploading(false);
        }
    };

    return (
        <Card className={cn(
            "relative overflow-hidden transition-all duration-200 border-2 border-dashed",
            dragActive ? "border-indigo-500 bg-indigo-50/50" : "border-gray-200 hover:border-gray-300 hover:bg-gray-50/50"
        )}>
            <CardContent className="p-8 flex flex-col items-center justify-center text-center">
                <input
                    type="file"
                    onChange={handleFileChange}
                    accept=".pdf,.csv,.json,.txt"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    disabled={uploading}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                />

                <div className={cn(
                    "w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-all",
                    dragActive ? "bg-indigo-100 text-indigo-600 scale-110" : "bg-gray-100 text-gray-500"
                )}>
                    <UploadCloud className="w-8 h-8" />
                </div>

                <h3 className="text-lg font-bold text-gray-900 mb-1">Upload Catalogue</h3>
                <p className="text-sm text-gray-500 max-w-[200px] mb-4">
                    Drag and drop your file here, or click to browse.
                </p>

                <div className="flex gap-2 text-xs text-gray-400 font-medium uppercase tracking-wider">
                    <span className="bg-gray-100 px-2 py-1 rounded">PDF</span>
                    <span className="bg-gray-100 px-2 py-1 rounded">CSV</span>
                    <span className="bg-gray-100 px-2 py-1 rounded">JSON</span>
                </div>

                {uploading && (
                    <div className="absolute inset-0 bg-white/90 backdrop-blur-sm z-20 flex flex-col items-center justify-center p-8 transition-all animate-in fade-in">
                        <div className="w-full max-w-xs space-y-4">
                            <div className="flex justify-between text-xs font-bold uppercase text-gray-500">
                                <span>Uploading...</span>
                                <span>{Math.round(progress)}%</span>
                            </div>
                            <Progress value={progress} className="h-2" />
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
