import * as React from "react"
import { cn } from "@/lib/utils"
import { Check, AlertCircle } from "lucide-react"

export interface ConfirmedFactsProps extends React.HTMLAttributes<HTMLDivElement> {
    confirmed: Array<{ field: string; value: string }>;
    inferred?: Array<{ field: string; value: string; confidence: string }>;
    onCorrect?: () => void;
}

export function ConfirmedFacts({ confirmed, inferred, onCorrect, className, ...props }: ConfirmedFactsProps) {
    if (confirmed.length === 0 && (!inferred || inferred.length === 0)) {
        return null;
    }

    return (
        <div className={cn("skeuo-card p-4 space-y-3", className)} {...props}>
            <h3 className="text-[16px] font-bold text-slate-800 tracking-tight">Τι κατάλαβα</h3>

            {confirmed.length > 0 && (
                <div className="space-y-2">
                    {confirmed.map((fact, i) => (
                        <div key={i} className="flex items-center gap-3">
                            <div className="w-[20px] h-[20px] rounded-full bg-skeuo-accent flex items-center justify-center shrink-0 shadow-sm">
                                <Check className="w-[12px] h-[12px] text-white" strokeWidth={2} />
                            </div>
                            <span className="text-[14px] font-semibold text-slate-700 tracking-tight">
                                <span className="text-slate-500">{fact.field}:</span> {fact.value}
                            </span>
                        </div>
                    ))}
                </div>
            )}

            {inferred && inferred.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-slate-200">
                    <p className="text-[12px] font-medium text-slate-500 uppercase tracking-wide">Εκτιμώμενα</p>
                    {inferred.map((fact, i) => (
                        <div key={i} className="flex items-center gap-3">
                            <div className="w-[20px] h-[20px] rounded-full bg-amber-400 flex items-center justify-center shrink-0 shadow-sm">
                                <AlertCircle className="w-[12px] h-[12px] text-white" strokeWidth={2} />
                            </div>
                            <span className="text-[14px] font-semibold text-slate-600 tracking-tight">
                                <span className="text-slate-400">{fact.field}:</span> {fact.value}
                                <span className="text-[11px] text-slate-400 ml-1">({fact.confidence})</span>
                            </span>
                        </div>
                    ))}
                </div>
            )}

            {onCorrect && (
                <button
                    onClick={onCorrect}
                    className="text-[13px] font-bold text-skeuo-accent hover:text-skeuo-accent-dark tracking-tight hover:underline underline-offset-4"
                >
                    Κάτι δεν πάει καλά; Πατήστε για διόρθωση
                </button>
            )}
        </div>
    )
}
