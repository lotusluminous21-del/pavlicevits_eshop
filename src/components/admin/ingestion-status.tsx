'use client';

import { useEffect, useState } from 'react';
import { getFirestore, collection, query, orderBy, limit, onSnapshot, where } from 'firebase/firestore';
import { app } from '@/lib/firebase';
import { Loader2, CheckCircle2, AlertCircle, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

interface IngestionJob {
    id: string;
    file_name: string;
    status: 'uploading' | 'processing' | 'completed' | 'failed';
    progress: number;
    message?: string;
    created_at: any;
    stats?: {
        total: number;
        processed: number;
    };
}

export function IngestionStatus() {
    const [jobs, setJobs] = useState<IngestionJob[]>([]);

    useEffect(() => {
        const db = getFirestore(app);
        // Subscribe to recent jobs (last 3)
        const q = query(
            collection(db, 'ingestion_jobs'),
            orderBy('created_at', 'desc'),
            limit(3)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const items: IngestionJob[] = [];
            snapshot.forEach((doc) => {
                items.push({ id: doc.id, ...doc.data() } as IngestionJob);
            });
            setJobs(items);
        });

        return () => unsubscribe();
    }, []);

    if (jobs.length === 0) return null;

    return (
        <div className="space-y-4 mb-8">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Recent Activity</h3>
            <div className="grid gap-3">
                {jobs.map((job) => (
                    <div
                        key={job.id}
                        className={cn(
                            "p-4 rounded-xl border flex items-center gap-4 transition-all animate-in fade-in slide-in-from-top-2",
                            job.status === 'completed' ? "bg-green-50 border-green-100" :
                                job.status === 'failed' ? "bg-red-50 border-red-100" :
                                    "bg-white border-gray-100 shadow-sm"
                        )}
                    >
                        <div className={cn(
                            "p-2 rounded-lg",
                            job.status === 'completed' ? "bg-green-100 text-green-600" :
                                job.status === 'failed' ? "bg-red-100 text-red-600" :
                                    "bg-blue-100 text-blue-600"
                        )}>
                            {job.status === 'processing' || job.status === 'uploading' ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : job.status === 'completed' ? (
                                <CheckCircle2 className="w-5 h-5" />
                            ) : (
                                <AlertCircle className="w-5 h-5" />
                            )}
                        </div>

                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                                <p className="text-sm font-medium text-gray-900 truncate flex items-center gap-2">
                                    <FileText className="w-3.5 h-3.5 text-gray-400" />
                                    {job.file_name}
                                </p>
                                <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded-md bg-gray-100 text-gray-500">
                                    {job.status}
                                </span>
                            </div>

                            {(job.status === 'processing' || job.status === 'uploading') && (
                                <div className="w-full bg-gray-100 rounded-full h-1.5 mb-1.5 overflow-hidden">
                                    <div
                                        className="bg-blue-600 h-full transition-all duration-500 ease-out"
                                        style={{ width: `${job.progress}%` }}
                                    ></div>
                                </div>
                            )}

                            <p className="text-xs text-gray-500 truncate">
                                {job.message || (job.status === 'completed' ? `Successfully processed ${job.stats?.total || 0} items` : 'Waiting...')}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
