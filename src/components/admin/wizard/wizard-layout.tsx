"use client";

import { ReactNode } from "react";
import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from "@/components/ui/resizable";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface WizardLayoutProps {
    sidebarList: ReactNode;
    mainContent: ReactNode;
    footerActions?: ReactNode;
    sidebarTitle?: ReactNode;
    headerContent?: ReactNode;
}

export function WizardLayout({
    sidebarList,
    mainContent,
    footerActions,
    sidebarTitle,
    headerContent
}: WizardLayoutProps) {
    return (
        <div className="flex bg-white h-full w-full overflow-hidden">
            <ResizablePanelGroup orientation="horizontal" className="h-[calc(100vh-3.5rem)] bg-white overflow-hidden border-t border-zinc-200">
                {/* Sidebar Panel */}
                <ResizablePanel defaultSize={20} minSize={15} maxSize={25} className="bg-zinc-50/30 flex flex-col border-r border-zinc-200">
                    {sidebarTitle && (
                        <div className="p-4 border-b border-zinc-200 bg-white/50 backdrop-blur-sm z-10 shrink-0">
                            {sidebarTitle}
                        </div>
                    )}
                    <ScrollArea className="flex-1">
                        <div className="flex flex-col p-2 gap-0.5">
                            {sidebarList}
                        </div>
                    </ScrollArea>
                </ResizablePanel>

                <ResizableHandle withHandle className="bg-zinc-200 w-px hover:w-1 hover:bg-zinc-300 transition-all" />

                {/* Main Content Panel */}
                <ResizablePanel defaultSize={80} minSize={60} className="bg-white flex flex-col relative">
                    {/* Header for content area (optional) */}
                    {headerContent && (
                        <div className="border-b border-zinc-200 bg-white/80 backdrop-blur-sm z-20 shrink-0 sticky top-0">
                            {headerContent}
                        </div>
                    )}

                    {/* Scrollable Content Area */}
                    <div className="flex-1 overflow-y-auto relative p-0 bg-white">
                        {mainContent}
                    </div>

                    {/* Fixed Footer for Actions */}
                    {footerActions && (
                        <div className="border-t border-zinc-200 bg-zinc-50/80 backdrop-blur-xl z-30 flex items-center justify-between shrink-0 p-4 h-16">
                            {footerActions}
                        </div>
                    )}
                </ResizablePanel>
            </ResizablePanelGroup>
        </div>
    );
}
