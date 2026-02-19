"use client";

import { useEffect, useState } from 'react';
import { getFirestore, collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { app } from '@/lib/firebase';
import { Loader2, CheckCircle2, AlertCircle, FileText, Activity } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
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
        const q = query(
            collection(db, 'ingestion_jobs'),
            orderBy('created_at', 'desc'),
            limit(5)
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

    if (jobs.length === 0) return (
        <Card className="h-full border-gray-200 shadow-sm bg-gray-50/30">
            <CardContent className="flex flex-col items-center justify-center h-full min-h-[150px] text-gray-400">
                <Activity className="w-8 h-8 mb-2 opacity-20" />
                <span className="text-sm font-medium">No recent activity</span>
            </CardContent>
        </Card>
    );

    return (
        <Card className="border-gray-200 shadow-sm h-full flex flex-col">
            <CardHeader className="pb-3 border-b border-gray-50">
                <CardTitle className="text-sm font-bold text-gray-900 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-indigo-600" />
                    Pipeline Activity
                </CardTitle>
            </CardHeader>
            <ScrollArea className="flex-1">
                <div className="divide-y divide-gray-100">
                    {jobs.map((job) => (
                        <div
                            key={job.id}
                            className="p-4 hover:bg-gray-50/50 transition-colors animate-in fade-in slide-in-from-left-2"
                        >
                            <div className="flex items-start gap-4">
                                <div className={cn(
                                    "p-2 rounded-lg shrink-0",
                                    job.status === 'completed' ? "bg-green-100 text-green-600" :
                                        job.status === 'failed' ? "bg-red-100 text-red-600" :
                                            "bg-indigo-100 text-indigo-600"
                                )}>
                                    {job.status === 'processing' || job.status === 'uploading' ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : job.status === 'completed' ? (
                                        <CheckCircle2 className="w-4 h-4" />
                                    ) : (
                                        <AlertCircle className="w-4 h-4" />
                                    )}
                                </div>

                                <div className="flex-1 min-w-0 space-y-2">
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm font-semibold text-gray-900 truncate">
                                            {job.file_name}
                                        </p>
                                        <Badge variant={
                                            job.status === 'completed' ? 'secondary' :
                                                job.status === 'failed' ? 'destructive' : 'outline'
                                        } className="text-[10px] uppercase h-5 font-bold">
                                            {job.status}
                                        </Badge>
                                    </div>

                                    {(job.status === 'processing' || job.status === 'uploading') && (
                                        <Progress value={job.progress} className="h-1.5" />
                                    )}

                                    <p className="text-xs text-gray-500 font-medium">
                                        {job.message || (job.status === 'completed' ? `Processed ${job.stats?.total || 0} items successfully` : 'Initializing...')}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </ScrollArea>
        </Card>
    );
}
