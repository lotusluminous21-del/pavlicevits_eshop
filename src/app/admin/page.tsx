"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function AdminDashboardRedirect() {
    const router = useRouter();

    useEffect(() => {
        router.push("/admin/products");
    }, [router]);

    return (
        <div className="h-[60vh] flex flex-col items-center justify-center gap-4 text-gray-400">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            <span className="font-bold uppercase tracking-widest text-xs">Redirecting to Product Lab...</span>
        </div>
    );
}
