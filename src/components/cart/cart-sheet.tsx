"use client"

import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
    SheetFooter,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ShoppingCart, Trash2, Plus, Minus, Loader2 } from "lucide-react"
import { useCart } from "@/hooks/useCart"
import Image from "next/image"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

export function CartSheet({ children }: { children: React.ReactNode }) {
    const { cart, isOpen, openCart, closeCart, removeItem, updateItemQuantity, isLoading } = useCart()
    const [isClient, setIsClient] = useState(false)

    useEffect(() => {
        setIsClient(true)
    }, [])

    const itemCount = cart?.lines?.edges?.reduce((acc, { node }) => acc + node.quantity, 0) || 0
    const subtotal = cart?.cost?.subtotalAmount

    if (!isClient) return <>{children}</>

    return (
        <Sheet open={isOpen} onOpenChange={(open) => open ? openCart() : closeCart()}>
            <SheetTrigger asChild>
                {children}
            </SheetTrigger>
            <SheetContent className="w-full sm:max-w-md flex flex-col h-full">
                <SheetHeader className="space-y-2.5 pr-6">
                    <SheetTitle className="flex items-center gap-2">
                        <ShoppingCart className="h-5 w-5" />
                        Καλάθι ({itemCount})
                    </SheetTitle>
                    <Separator />
                </SheetHeader>

                {!cart || cart.lines.edges.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center space-y-4 text-muted-foreground">
                        <ShoppingCart className="h-12 w-12 opacity-20" />
                        <p>Το καλάθι σας είναι άδειο</p>
                        <Button variant="link" onClick={closeCart} className="text-primary">
                            Συνεχίστε τις αγορές
                        </Button>
                    </div>
                ) : (
                    <>
                        <ScrollArea className="flex-1 -mx-6 px-6">
                            <ul className="space-y-4 py-4">
                                {cart.lines.edges.map(({ node: line }) => (
                                    <li key={line.id} className="flex gap-4">
                                        <div className="relative aspect-square w-20 h-20 overflow-hidden rounded-lg bg-muted border shrink-0">
                                            {line.merchandise.image && (
                                                <Image
                                                    src={line.merchandise.image.url}
                                                    alt={line.merchandise.image.altText || "Product Image"}
                                                    fill
                                                    className="object-cover"
                                                />
                                            )}
                                        </div>
                                        <div className="flex-1 flex flex-col justify-between">
                                            <div className="space-y-1">
                                                <h4 className="font-medium text-sm leading-tight line-clamp-2">
                                                    {line.merchandise.product.title}
                                                </h4>
                                                <p className="text-xs text-muted-foreground">
                                                    {line.merchandise.title !== "Default Title" ? line.merchandise.title : ""}
                                                </p>
                                            </div>

                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <div className="flex items-center rounded-md border text-xs h-7">
                                                        <button
                                                            className="px-2 hover:bg-muted transition-colors h-full flex items-center disabled:opacity-50"
                                                            onClick={() => updateItemQuantity(line.id, line.quantity - 1)}
                                                            disabled={isLoading || line.quantity <= 1}
                                                        >
                                                            <Minus className="h-3 w-3" />
                                                        </button>
                                                        <span className="w-6 text-center">{line.quantity}</span>
                                                        <button
                                                            className="px-2 hover:bg-muted transition-colors h-full flex items-center disabled:opacity-50"
                                                            onClick={() => updateItemQuantity(line.id, line.quantity + 1)}
                                                            disabled={isLoading}
                                                        >
                                                            <Plus className="h-3 w-3" />
                                                        </button>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-3">
                                                    <span className="font-medium text-sm">
                                                        {parseFloat(line.cost.totalAmount.amount).toLocaleString('el-GR', {
                                                            style: 'currency',
                                                            currency: line.cost.totalAmount.currencyCode
                                                        })}
                                                    </span>
                                                    <button
                                                        onClick={() => removeItem(line.id)}
                                                        className="text-muted-foreground hover:text-destructive transition-colors"
                                                        disabled={isLoading}
                                                    >
                                                        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </ScrollArea>

                        <div className="space-y-4 pt-4">
                            <Separator />
                            <div className="space-y-1.5">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Υποσύνολο</span>
                                    <span className="font-medium">
                                        {subtotal ? parseFloat(subtotal.amount).toLocaleString('el-GR', {
                                            style: 'currency',
                                            currency: subtotal.currencyCode
                                        }) : '0,00 €'}
                                    </span>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Τα μεταφορικά και οι φόροι υπολογίζονται στο ταμείο.
                                </p>
                            </div>

                            <SheetFooter>
                                <Button className="w-full h-11 text-base" asChild disabled={isLoading}>
                                    <a href={cart.checkoutUrl}>
                                        Ολοκλήρωση Παραγγελίας
                                    </a>
                                </Button>
                            </SheetFooter>
                        </div>
                    </>
                )}
            </SheetContent>
        </Sheet>
    )
}
