"use client";

import { CheckCircle2, ChevronRight, Eye, ArrowRight } from "lucide-react";
import { WizardLayout } from "./wizard-layout";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import {
    WizardSidebarItem,
    SharedWizardSidebarTitle,
    WizardProduct
} from "./shared-wizard-components";
import { TooltipProvider } from "@/components/ui/tooltip";

interface CompleteStepProps {
    products: any[];
}

export function CompleteStep({ products }: CompleteStepProps) {
    const router = useRouter();

    const sidebarTitle = <SharedWizardSidebarTitle count={products.length} />;

    const sidebarList = (
        <TooltipProvider>
            <div className="flex flex-col gap-1 px-2">
                {products.map((p, idx) => (
                    <WizardSidebarItem
                        key={p.sku}
                        product={p as unknown as WizardProduct}
                        isActive={false}
                        onClick={() => { }}
                        statusIndicator={
                            <><CheckCircle2 className="w-2.5 h-2.5 text-green-500" /> Published</>
                        }
                    />
                ))}
            </div>
        </TooltipProvider>
    );

    const mainContent = (
        <div className="flex-1 flex flex-col items-center justify-center p-12 text-center h-full animate-in fade-in zoom-in duration-500">
            <div className="w-32 h-32 bg-green-50 rounded-full flex items-center justify-center mb-8 ring-8 ring-green-50/50 shadow-xl shadow-green-100">
                <CheckCircle2 className="w-16 h-16 text-green-500" />
            </div>

            <h2 className="text-3xl font-bold text-gray-900 mb-4 tracking-tight">Sent to Staging!</h2>
            <p className="text-gray-500 max-w-md mb-12 text-lg leading-relaxed">
                You have successfully moved <span className="font-bold text-gray-900">{products.length} products</span> to the Staging Area.
                <br />They are ready for your final visual review.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl w-full">
                <Card className="hover:shadow-lg transition-all border-gray-200 group cursor-pointer hover:border-indigo-200" onClick={() => router.push("/admin")}>
                    <CardContent className="p-8 flex flex-col items-center text-center">
                        <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center mb-4 text-gray-400 group-hover:text-indigo-600 group-hover:bg-indigo-50 transition-colors">
                            <ArrowRight className="w-6 h-6" />
                        </div>
                        <h3 className="font-bold text-gray-900 mb-2">Continue Importing</h3>
                        <p className="text-sm text-gray-500">Go back to the Import Hub to process more products.</p>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-all border-amber-100 bg-amber-50/30 group cursor-pointer hover:border-amber-300" onClick={() => router.push("/admin/products")}>
                    <CardContent className="p-8 flex flex-col items-center text-center">
                        <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center mb-4 text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition-colors shadow-sm">
                            <Eye className="w-6 h-6" />
                        </div>
                        <h3 className="font-bold text-amber-900 mb-2">Open Staging Area</h3>
                        <p className="text-sm text-amber-600/80">Perform final visual review and deploy to Shopify.</p>
                    </CardContent>
                </Card>
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
