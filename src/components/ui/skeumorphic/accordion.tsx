"use client"

import * as React from "react"
import * as AccordionPrimitive from "@radix-ui/react-accordion"
import { ChevronDown } from "lucide-react"

import { cn } from "@/lib/utils"

const Accordion = AccordionPrimitive.Root

const AccordionItem = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Item
    ref={ref}
    className={cn(
      "group/item rounded-[24px] bg-[#ffffff] transition-all duration-300 border-none",
      "shadow-sm",
      "data-[state=open]:p-[4px]",
      "data-[state=closed]:p-0",
      className
    )}
    {...props}
  >
    <div className={cn(
      "transition-all duration-300 h-full",
      "group-data-[state=open]/item:rounded-[20px] group-data-[state=open]/item:shadow-sm",
      "group-data-[state=closed]/item:rounded-[24px]"
    )}>
      {children}
    </div>
  </AccordionPrimitive.Item>
))
AccordionItem.displayName = "AccordionItem"

const AccordionTrigger = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Header className="flex">
    <AccordionPrimitive.Trigger
      ref={ref}
      className={cn(
        "flex flex-1 items-center justify-between py-[12px] font-bold text-[16px] text-slate-800 tracking-tight transition-all hover:no-underline outline-none",
        "rounded-[24px] group-data-[state=open]/item:rounded-[20px]",
        "px-[20px] group-data-[state=open]/item:px-[16px]",
        className
      )}
      {...props}
    >
      <span className="pl-1 text-left">{children}</span>
      <div className={cn(
        "h-[28px] w-[28px] rounded-full flex items-center justify-center shrink-0 transition-all duration-300",
        "group-data-[state=open]/item:bg-[#ffffff] group-data-[state=open]/item:shadow-sm",
        "group-data-[state=closed]/item:shadow-none"
      )}>
        <ChevronDown
          className="h-[16px] w-[16px] shrink-0 transition-transform duration-300 group-data-[state=open]/item:rotate-180 text-slate-700"
          strokeWidth={3}
        />
      </div>
    </AccordionPrimitive.Trigger>
  </AccordionPrimitive.Header>
))
AccordionTrigger.displayName = AccordionPrimitive.Trigger.displayName

const AccordionContent = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Content
    ref={ref}
    className="overflow-hidden text-[15px] text-slate-600 transition-all data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
    {...props}
  >
    <div className={cn("pb-[20px] pt-1 px-[24px] group-data-[state=open]/item:px-[20px]", className)}>{children}</div>
  </AccordionPrimitive.Content>
))

AccordionContent.displayName = AccordionPrimitive.Content.displayName

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }
