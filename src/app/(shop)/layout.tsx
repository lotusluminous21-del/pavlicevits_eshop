import { SiteHeader } from "@/components/layout/header/site-header";
import { SiteFooter } from "@/components/layout/footer/site-footer";
import { ChatAssistant } from "@/components/ai/chat-assistant";
import { SmoothScroll } from "@/components/smooth-scroll";

export default function ShopLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <SmoothScroll>
            <div className="flex flex-col min-h-screen">
                <SiteHeader />
                <main className="flex-1">
                    {children}
                </main>
                <SiteFooter />
                <ChatAssistant />
            </div>
        </SmoothScroll>
    );
}
