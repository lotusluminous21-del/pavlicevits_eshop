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
            <ResizablePanelGroup orientation="horizontal">
                {/* Sidebar Panel */}
                <ResizablePanel defaultSize={25} minSize={15} className="bg-gray-50/50 flex flex-col border-r border-gray-100">
                    {sidebarTitle && (
                        <div className="p-4 border-b border-gray-100 bg-white shadow-sm z-10 shrink-0">
                            {sidebarTitle}
                        </div>
                    )}
                    <ScrollArea className="flex-1">
                        <div className="flex flex-col">
                            {sidebarList}
                        </div>
                    </ScrollArea>
                </ResizablePanel>

                <ResizableHandle withHandle />

                {/* Main Content Panel */}
                <ResizablePanel defaultSize={75} minSize={5} className="bg-white flex flex-col relative">
                    {/* Header for content area (optional) */}
                    {headerContent && (
                        <div className="border-b border-gray-100 bg-white z-20 shrink-0 sticky top-0">
                            {headerContent}
                        </div>
                    )}

                    {/* Scrollable Content Area */}
                    <div className="flex-1 overflow-y-auto relative p-0">
                        {mainContent}
                    </div>

                    {/* Fixed Footer for Actions */}
                    {footerActions && (
                        <div className="border-t border-gray-100 bg-white z-30 flex items-center justify-between shrink-0 p-4">
                            {footerActions}
                        </div>
                    )}
                </ResizablePanel>
            </ResizablePanelGroup>
        </div>
    );
}
