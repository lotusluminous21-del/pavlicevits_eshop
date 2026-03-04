'use client';

import { useState, useCallback, useMemo } from 'react';
import {
    Palette,
    AlertTriangle,
    Info,
    ChevronDown,
    Check,
    Car,
    Search,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
    COLOR_SYSTEMS,
    CAR_MANUFACTURERS,
    RAL_COLORS,
    lookupRALHex,
    lookupRALName,
    type ColorSystem,
} from './color-system-data';
import {
    type CustomColorSpec,
    computePrecision,
} from './custom-paint-helpers';

interface CustomColorFormProps {
    /** Called whenever the form state changes with a valid or partial spec */
    onChange: (spec: CustomColorSpec | null) => void;
    /** If true, shows validation warnings */
    showValidation?: boolean;
    /** Compact mode for inline (expert chat) usage */
    compact?: boolean;
}

export function CustomColorForm({ onChange, showValidation = false, compact = false }: CustomColorFormProps) {
    const [selectedSystem, setSelectedSystem] = useState<ColorSystem | null>(null);
    const [colorCode, setColorCode] = useState('');
    const [carMake, setCarMake] = useState('');
    const [carYear, setCarYear] = useState('');
    const [customerNotes, setCustomerNotes] = useState('');
    const [ralSearch, setRalSearch] = useState('');
    const [showRalPicker, setShowRalPicker] = useState(false);

    const systemData = useMemo(() =>
        selectedSystem ? COLOR_SYSTEMS.find(s => s.id === selectedSystem) : null
        , [selectedSystem]);

    const ralHex = useMemo(() => {
        if (selectedSystem !== 'RAL') return null;
        return lookupRALHex(colorCode);
    }, [selectedSystem, colorCode]);

    const ralName = useMemo(() => {
        if (selectedSystem !== 'RAL') return null;
        return lookupRALName(colorCode);
    }, [selectedSystem, colorCode]);

    const filteredRALColors = useMemo(() => {
        if (!ralSearch) return RAL_COLORS.slice(0, 20);
        const q = ralSearch.toLowerCase();
        return RAL_COLORS.filter(c =>
            c.code.includes(q) || c.name.toLowerCase().includes(q)
        ).slice(0, 20);
    }, [ralSearch]);

    const precision = useMemo(() => {
        if (!selectedSystem) return 'approximate' as const;
        return computePrecision(selectedSystem, colorCode);
    }, [selectedSystem, colorCode]);

    const isValid = useMemo(() => {
        if (!selectedSystem) return false;
        if (!colorCode.trim()) return false;
        if (selectedSystem === 'OEM' && !carMake) return false;
        return true;
    }, [selectedSystem, colorCode, carMake]);

    const emitChange = useCallback((
        sys: ColorSystem | null,
        code: string,
        make: string,
        year: string,
        notes: string,
    ) => {
        if (!sys || !code.trim()) {
            onChange(null);
            return;
        }
        if (sys === 'OEM' && !make) {
            onChange(null);
            return;
        }
        onChange({
            colorSystem: sys,
            colorCode: code.trim(),
            carMake: make || undefined,
            carYear: year || undefined,
            customerNotes: notes || undefined,
            precision: computePrecision(sys, code),
        });
    }, [onChange]);

    const handleSystemSelect = (sys: ColorSystem) => {
        setSelectedSystem(sys);
        setColorCode('');
        setCarMake('');
        setCarYear('');
        setShowRalPicker(false);
        emitChange(sys, '', '', '', customerNotes);
    };

    const handleCodeChange = (val: string) => {
        setColorCode(val);
        emitChange(selectedSystem, val, carMake, carYear, customerNotes);
    };

    const handleRalSelect = (code: string) => {
        const fullCode = `RAL ${code}`;
        setColorCode(fullCode);
        setShowRalPicker(false);
        emitChange(selectedSystem, fullCode, carMake, carYear, customerNotes);
    };

    const handleCarMakeChange = (val: string) => {
        setCarMake(val);
        emitChange(selectedSystem, colorCode, val, carYear, customerNotes);
    };

    const handleCarYearChange = (val: string) => {
        setCarYear(val);
        emitChange(selectedSystem, colorCode, carMake, val, customerNotes);
    };

    const handleNotesChange = (val: string) => {
        setCustomerNotes(val);
        emitChange(selectedSystem, colorCode, carMake, carYear, val);
    };

    return (
        <div className={cn(
            'rounded-lg border border-accent/30 bg-accent/5 overflow-hidden',
            compact ? 'p-3' : 'p-5'
        )}>
            {/* Header */}
            <div className="flex items-center gap-2 mb-4">
                <Palette className="w-5 h-5 text-accent" />
                <h3 className={cn(
                    'font-bold uppercase tracking-wider text-accent',
                    compact ? 'text-xs' : 'text-sm'
                )}>
                    Εξατομικευμένο Χρώμα
                </h3>
            </div>

            {/* Step 1: Color System Selector */}
            <div className="space-y-2 mb-4">
                <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                    Σύστημα Χρώματος
                </label>
                <div className={cn(
                    'grid gap-2',
                    compact ? 'grid-cols-3' : 'grid-cols-2 sm:grid-cols-3'
                )}>
                    {COLOR_SYSTEMS.map(sys => (
                        <button
                            key={sys.id}
                            type="button"
                            onClick={() => handleSystemSelect(sys.id)}
                            className={cn(
                                'flex items-center gap-2 px-3 py-2.5 rounded-md border text-left transition-all text-sm',
                                selectedSystem === sys.id
                                    ? 'border-accent bg-accent/10 text-accent font-bold ring-1 ring-accent/30'
                                    : 'border-border bg-card text-foreground hover:border-accent/40 hover:bg-accent/5'
                            )}
                        >
                            <span className="text-base">{sys.icon}</span>
                            <div className="min-w-0">
                                <div className="font-bold text-xs truncate">{sys.label}</div>
                                {!compact && (
                                    <div className="text-[10px] text-muted-foreground truncate">{sys.description}</div>
                                )}
                            </div>
                            {selectedSystem === sys.id && (
                                <Check className="w-3.5 h-3.5 ml-auto shrink-0 text-accent" />
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Step 2: Color Code Input (contextual) */}
            {selectedSystem && (
                <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
                    {/* Help Text Callout */}
                    {systemData && (
                        <div className="flex items-start gap-2 p-3 rounded-md bg-card border border-border">
                            <Info className="w-4 h-4 text-accent mt-0.5 shrink-0" />
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                {systemData.helpText}
                            </p>
                        </div>
                    )}

                    {/* OEM-specific fields */}
                    {selectedSystem === 'OEM' && (
                        <div className="grid grid-cols-2 gap-3 animate-in fade-in duration-200">
                            {/* Car Make */}
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1">
                                    <Car className="w-3 h-3" />
                                    Μάρκα *
                                </label>
                                <div className="relative">
                                    <select
                                        value={carMake}
                                        onChange={(e) => handleCarMakeChange(e.target.value)}
                                        className="w-full appearance-none px-3 py-2 rounded-md border border-border bg-card text-foreground text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-colors pr-8"
                                    >
                                        <option value="">Επιλέξτε...</option>
                                        {CAR_MANUFACTURERS.map(m => (
                                            <option key={m} value={m}>{m}</option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                                </div>
                            </div>
                            {/* Car Year */}
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                                    Έτος (προαιρ.)
                                </label>
                                <input
                                    type="text"
                                    value={carYear}
                                    onChange={(e) => handleCarYearChange(e.target.value)}
                                    placeholder="π.χ. 2020"
                                    maxLength={4}
                                    className="w-full px-3 py-2 rounded-md border border-border bg-card text-foreground text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-colors placeholder:text-muted-foreground/50"
                                />
                            </div>
                        </div>
                    )}

                    {/* Color Code / Description Input */}
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                            {selectedSystem === 'description' ? 'Περιγραφή Χρώματος *' : 'Κωδικός Χρώματος *'}
                        </label>
                        {selectedSystem === 'description' ? (
                            <textarea
                                value={colorCode}
                                onChange={(e) => handleCodeChange(e.target.value)}
                                placeholder={systemData?.placeholder}
                                rows={3}
                                className="w-full px-3 py-2 rounded-md border border-border bg-card text-foreground text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-colors resize-none placeholder:text-muted-foreground/50"
                            />
                        ) : (
                            <div className="relative">
                                <input
                                    type="text"
                                    value={colorCode}
                                    onChange={(e) => handleCodeChange(e.target.value)}
                                    placeholder={systemData?.placeholder}
                                    className="w-full px-3 py-2 rounded-md border border-border bg-card text-foreground text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-colors placeholder:text-muted-foreground/50"
                                />
                                {/* RAL Quick Picker Button */}
                                {selectedSystem === 'RAL' && (
                                    <button
                                        type="button"
                                        onClick={() => setShowRalPicker(!showRalPicker)}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-bold px-2 py-1 rounded bg-accent/10 text-accent border border-accent/20 hover:bg-accent/20 transition-colors uppercase tracking-widest"
                                    >
                                        Χρωματολόγιο
                                    </button>
                                )}
                            </div>
                        )}
                    </div>

                    {/* RAL Quick Picker Dropdown */}
                    {selectedSystem === 'RAL' && showRalPicker && (
                        <div className="rounded-md border border-border bg-card overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                            {/* Search */}
                            <div className="p-2 border-b border-border">
                                <div className="relative">
                                    <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                                    <input
                                        type="text"
                                        value={ralSearch}
                                        onChange={(e) => setRalSearch(e.target.value)}
                                        placeholder="Αναζήτηση RAL..."
                                        className="w-full pl-7 pr-3 py-1.5 text-xs bg-secondary rounded border-none outline-none placeholder:text-muted-foreground/50"
                                    />
                                </div>
                            </div>
                            {/* Grid */}
                            <div className="grid grid-cols-5 sm:grid-cols-8 gap-1 p-2 max-h-48 overflow-y-auto">
                                {filteredRALColors.map(ral => (
                                    <button
                                        key={ral.code}
                                        type="button"
                                        onClick={() => handleRalSelect(ral.code)}
                                        className="group flex flex-col items-center gap-0.5 p-1 rounded hover:bg-secondary transition-colors"
                                        title={`RAL ${ral.code} — ${ral.name}`}
                                    >
                                        <div
                                            className="w-7 h-7 rounded-sm border border-border group-hover:ring-2 ring-accent/40 transition-all"
                                            style={{ backgroundColor: ral.hex }}
                                        />
                                        <span className="text-[9px] font-bold text-muted-foreground group-hover:text-foreground">
                                            {ral.code}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Live Color Preview (RAL only) */}
                    {selectedSystem === 'RAL' && ralHex && (
                        <div className="flex items-center gap-3 p-3 rounded-md bg-card border border-border animate-in fade-in duration-200">
                            <div
                                className="w-10 h-10 rounded-md border-2 border-border shadow-sm"
                                style={{ backgroundColor: ralHex }}
                            />
                            <div>
                                <p className="text-sm font-bold text-foreground">
                                    RAL {colorCode.replace(/^RAL\s*/i, '')}
                                </p>
                                {ralName && (
                                    <p className="text-xs text-muted-foreground">{ralName}</p>
                                )}
                            </div>
                            <Check className="ml-auto w-4 h-4 text-green-500" />
                        </div>
                    )}

                    {/* Precision Warning for description mode */}
                    {precision === 'approximate' && selectedSystem === 'description' && colorCode.length > 0 && (
                        <div className="flex items-start gap-2 p-3 rounded-md bg-warning/5 border border-warning/20 animate-in fade-in duration-200">
                            <AlertTriangle className="w-4 h-4 text-warning mt-0.5 shrink-0" />
                            <div className="text-xs text-muted-foreground leading-relaxed">
                                <strong className="text-warning">Κατά Προσέγγιση:</strong>{' '}
                                Η αντιστοιχία βάσει περιγραφής είναι κατά προσέγγιση. Για ακριβή αντιστοιχία χρώματος,
                                επισκεφθείτε το κατάστημά μας με δείγμα ή κωδικό χρώματος.
                            </div>
                        </div>
                    )}

                    {/* Customer Notes */}
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                            Ειδικές Σημειώσεις (προαιρ.)
                        </label>
                        <textarea
                            value={customerNotes}
                            onChange={(e) => handleNotesChange(e.target.value)}
                            placeholder="Π.χ. θέλω ελαφρώς πιο σκούρη απόχρωση, ή σημειώσεις για τον τεχνίτη..."
                            rows={2}
                            className="w-full px-3 py-2 rounded-md border border-border bg-card text-foreground text-xs outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-colors resize-none placeholder:text-muted-foreground/50"
                        />
                    </div>

                    {/* Validation feedback */}
                    {showValidation && !isValid && (
                        <div className="flex items-center gap-2 text-xs text-warning font-medium animate-in fade-in duration-200">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            {!selectedSystem
                                ? 'Επιλέξτε σύστημα χρώματος'
                                : !colorCode.trim()
                                    ? 'Εισάγετε κωδικό ή περιγραφή χρώματος'
                                    : selectedSystem === 'OEM' && !carMake
                                        ? 'Επιλέξτε μάρκα αυτοκινήτου'
                                        : 'Συμπληρώστε τα απαιτούμενα πεδία'
                            }
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
