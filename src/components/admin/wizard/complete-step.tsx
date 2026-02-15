"use client";

import { CheckCircle2, ChevronRight, Package, ArrowRight } from "lucide-react";
import { WizardLayout } from "./wizard-layout";
import { useRouter } from "next/navigation";

interface CompleteStepProps {
    products: any[];
}

export function CompleteStep({ products }: CompleteStepProps) {
    const router = useRouter();

    const sidebarTitle = (
        <div className="space-y-4">
            <h3 className="font-bold text-gray-900 flex items-center gap-2 text-sm">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                Completed Items
            </h3>
        </div>
    );

    const sidebarList = (
        <div className="flex flex-col">
            {products.map((p, idx) => (
                <div
                    key={p.sku}
                    className="w-full p-3 text-left border-b border-gray-50 flex items-center justify-between group bg-white/50"
                >
                    <div className="truncate pr-2">
                        <div className="text-sm font-bold truncate text-gray-700">
                            {p.ai_data?.title_el || p.name}
                        </div>
                        <div className="text-[10px] text-green-600 mt-0.5 uppercase tracking-wider flex items-center gap-1">
                            <CheckCircle2 className="w-2 h-2" /> Published
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );

    const mainContent = (
        <div className="flex-1 flex flex-col items-center justify-center p-12 text-center h-full">
            <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mb-6 ring-8 ring-green-50/50">
                <CheckCircle2 className="w-12 h-12 text-green-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">All Products Enriched!</h2>
            <p className="text-gray-500 max-w-md mb-8 text-lg">
                You have successfully processed {products.length} products. They are now ready for final review or export.
            </p>

            <div className="grid grid-cols-2 gap-4 max-w-lg w-full">
                <button
                    onClick={() => router.push("/admin/products")}
                    className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-900 px-6 py-4 rounded-xl font-bold text-sm shadow-sm transition-all flex flex-col items-center gap-2 group"
                >
                    <Package className="w-6 h-6 text-gray-400 group-hover:text-indigo-600 transition-colors" />
                    Back to Products
                </button>
                <button
                    onClick={() => window.open("/shop", "_blank")}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-4 rounded-xl font-bold text-sm shadow-xl shadow-indigo-100 transition-all flex flex-col items-center gap-2 transform hover:scale-105"
                >
                    <ArrowRight className="w-6 h-6" />
                    View Live Store
                </button>
            </div>
        </div>
    );

    return (
        <WizardLayout
            sidebarList={sidebarList}
            mainContent={mainContent}
            sidebarTitle={sidebarTitle}
        />
    );
}
