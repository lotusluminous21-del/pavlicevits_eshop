import { HeroBackground } from "@/components/home/hero-background";

export default function DesignPage() {
    return (
        <div className="relative min-h-screen w-full font-sans">
            <HeroBackground />

            <div className="relative z-10 container mx-auto py-10 px-4 space-y-12">
                <header className="mb-10 text-center glass p-8 rounded-2xl">
                    <h1 className="text-4xl font-heading font-bold mb-4 tracking-tight">Design System</h1>
                    <p className="text-muted-foreground max-w-2xl mx-auto">
                        A comprehensive overview of the application's UI components, typography, and color palette, designed with a premium glassmorphic aesthetic.
                    </p>
                </header>

                {/* Typography */}
                <section className="glass p-8 rounded-2xl space-y-6">
                    <h2 className="text-2xl font-bold border-b border-border/10 pb-2">Typography</h2>
                    <div className="space-y-4">
                        <div>
                            <h1 className="text-4xl font-extrabold scroll-m-20 tracking-tight lg:text-5xl">Heading 1</h1>
                            <p className="text-muted-foreground">Inter 5xl - Bold</p>
                        </div>
                        <div>
                            <h2 className="text-3xl font-semibold tracking-tight first:mt-0">Heading 2</h2>
                            <p className="text-muted-foreground">Inter 3xl - Semibold</p>
                        </div>
                        <div>
                            <h3 className="text-2xl font-semibold tracking-tight">Heading 3</h3>
                            <p className="text-muted-foreground">Inter 2xl - Semibold</p>
                        </div>
                        <div>
                            <h4 className="text-xl font-semibold tracking-tight">Heading 4</h4>
                            <p className="text-muted-foreground">Inter xl - Semibold</p>
                        </div>
                        <div>
                            <p className="leading-7 [&:not(:first-child)]:mt-6">
                                This is a standard paragraph. The king, seeing how much happier his subjects were, realized the error of his ways and repealed the joke tax.
                            </p>
                            <p className="text-muted-foreground">Body - Regular</p>
                        </div>
                    </div>
                </section>

                {/* Colors */}
                <section className="glass p-8 rounded-2xl space-y-6">
                    <h2 className="text-2xl font-bold border-b border-border/10 pb-2">Colors</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="space-y-2">
                            <div className="h-20 w-full rounded-lg bg-background border border-border"></div>
                            <p className="font-mono text-xs">Background</p>
                        </div>
                        <div className="space-y-2">
                            <div className="h-20 w-full rounded-lg bg-foreground"></div>
                            <p className="font-mono text-xs">Foreground</p>
                        </div>
                        <div className="space-y-2">
                            <div className="h-20 w-full rounded-lg bg-card border border-border"></div>
                            <p className="font-mono text-xs">Card</p>
                        </div>
                        <div className="space-y-2">
                            <div className="h-20 w-full rounded-lg bg-popover border border-border"></div>
                            <p className="font-mono text-xs">Popover</p>
                        </div>
                        <div className="space-y-2">
                            <div className="h-20 w-full rounded-lg bg-primary"></div>
                            <p className="font-mono text-xs">Primary</p>
                        </div>
                        <div className="space-y-2">
                            <div className="h-20 w-full rounded-lg bg-secondary"></div>
                            <p className="font-mono text-xs">Secondary</p>
                        </div>
                        <div className="space-y-2">
                            <div className="h-20 w-full rounded-lg bg-accent"></div>
                            <p className="font-mono text-xs">Accent</p>
                        </div>
                        <div className="space-y-2">
                            <div className="h-20 w-full rounded-lg bg-muted"></div>
                            <p className="font-mono text-xs">Muted</p>
                        </div>
                        <div className="space-y-2">
                            <div className="h-20 w-full rounded-lg bg-destructive"></div>
                            <p className="font-mono text-xs">Destructive</p>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    )
}
