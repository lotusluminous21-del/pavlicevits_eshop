"use client"

import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"

export function FilterSidebar() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="font-heading text-lg font-semibold text-foreground">Φίλτρα</h3>
                <Button variant="ghost" size="sm" className="h-auto p-0 text-muted-foreground hover:text-foreground">
                    Καθαρισμός
                </Button>
            </div>

            <Accordion type="multiple" defaultValue={["category", "price", "availability"]} className="w-full">
                <AccordionItem value="category">
                    <AccordionTrigger className="text-sm font-medium">Κατηγορία</AccordionTrigger>
                    <AccordionContent>
                        <div className="space-y-3 pt-2">
                            {["Βαφές", "Αστάρια", "Βερνίκια", "Σκληρυντές", "Διαλυτικά"].map((category) => (
                                <div key={category} className="flex items-center space-x-2">
                                    <Checkbox id={`cat-${category}`} />
                                    <Label htmlFor={`cat-${category}`} className="text-sm font-normal cursor-pointer">
                                        {category}
                                    </Label>
                                </div>
                            ))}
                        </div>
                    </AccordionContent>
                </AccordionItem>

                <AccordionItem value="price">
                    <AccordionTrigger className="text-sm font-medium">Τιμή</AccordionTrigger>
                    <AccordionContent>
                        <div className="pt-4 px-1 pb-2">
                            <Slider defaultValue={[0, 100]} max={200} step={1} className="my-4" />
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                                <span>0€</span>
                                <span>200€+</span>
                            </div>
                        </div>
                    </AccordionContent>
                </AccordionItem>

                <AccordionItem value="availability">
                    <AccordionTrigger className="text-sm font-medium">Διαθεσιμότητα</AccordionTrigger>
                    <AccordionContent>
                        <div className="space-y-3 pt-2">
                            <div className="flex items-center space-x-2">
                                <Checkbox id="in-stock" />
                                <Label htmlFor="in-stock" className="text-sm font-normal cursor-pointer">
                                    Άμεσα Διαθέσιμο
                                </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox id="pre-order" />
                                <Label htmlFor="pre-order" className="text-sm font-normal cursor-pointer">
                                    Προπαραγγελία
                                </Label>
                            </div>
                        </div>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </div>
    )
}
