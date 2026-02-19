"use client"

import { Product } from "@/lib/shopify/types"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
    Droplets,
    Layers,
    Timer,
    MapPin,
    CheckCircle2,
    Paintbrush,
    Maximize2
} from "lucide-react"

interface ProductSpecsProps {
    product: Product
}

export function ProductTechnicalSpecs({ product }: ProductSpecsProps) {
    const metafields = product.metafields || []

    // Helper to find metafield by key
    const getMetaValue = (key: string) => {
        return metafields.find(m => m?.key === key)?.value
    }

    // Helper to parse JSON list metafields
    const getMetaList = (key: string): string[] => {
        const val = getMetaValue(key)
        if (!val) return []
        try {
            const parsed = JSON.parse(val)
            return Array.isArray(parsed) ? parsed : [parsed]
        } catch {
            return [val]
        }
    }

    const finish = getMetaValue("finish")
    const coverage = getMetaValue("coverage")
    const dryingTime = getMetaValue("drying_time")
    const environment = getMetaValue("environment")
    const surfaces = getMetaList("surfaces")
    const application = getMetaList("application")
    const features = getMetaList("features")

    // If no technical data is present, don't render
    const hasData = finish || coverage || dryingTime || environment || surfaces.length > 0 || application.length > 0 || features.length > 0
    if (!hasData) return null

    return (
        <div className="space-y-6 pt-6 border-t">
            <h3 className="text-lg font-semibold flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                Τεχνικά Χαρακτηριστικά
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {finish && (
                    <Card className="bg-white/40 border-white/20">
                        <CardContent className="p-4 flex items-center gap-3">
                            <Layers className="h-5 w-5 text-muted-foreground" />
                            <div>
                                <p className="text-xs text-muted-foreground">Φινίρισμα</p>
                                <p className="text-sm font-medium">{finish}</p>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {coverage && (
                    <Card className="bg-white/40 border-white/20">
                        <CardContent className="p-4 flex items-center gap-3">
                            <Maximize2 className="h-5 w-5 text-muted-foreground" />
                            <div>
                                <p className="text-xs text-muted-foreground">Απόδοση</p>
                                <p className="text-sm font-medium">{coverage}</p>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {dryingTime && (
                    <Card className="bg-white/40 border-white/20">
                        <CardContent className="p-4 flex items-center gap-3">
                            <Timer className="h-5 w-5 text-muted-foreground" />
                            <div>
                                <p className="text-xs text-muted-foreground">Στέγνωμα</p>
                                <p className="text-sm font-medium">{dryingTime}</p>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {environment && (
                    <Card className="bg-white/40 border-white/20">
                        <CardContent className="p-4 flex items-center gap-3">
                            <MapPin className="h-5 w-5 text-muted-foreground" />
                            <div>
                                <p className="text-xs text-muted-foreground">Χρήση</p>
                                <p className="text-sm font-medium">{environment}</p>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>

            {surfaces.length > 0 && (
                <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground">Κατάλληλο για:</p>
                    <div className="flex flex-wrap gap-2">
                        {surfaces.map(surface => (
                            <Badge key={surface} variant="secondary" className="px-3 py-1 bg-secondary/30">
                                {surface}
                            </Badge>
                        ))}
                    </div>
                </div>
            )}

            {application.length > 0 && (
                <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground">Εφαρμογή με:</p>
                    <div className="flex flex-wrap gap-2 text-sm">
                        {application.map(method => (
                            <div key={method} className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/40 border border-white/20">
                                <Paintbrush className="h-3.5 w-3.5" />
                                {method}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {features.length > 0 && (
                <div className="pt-2">
                    <ul className="space-y-2">
                        {features.map(feature => (
                            <li key={feature} className="flex items-start gap-2 text-sm text-muted-foreground">
                                <div className="mt-1 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                                {feature}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    )
}
