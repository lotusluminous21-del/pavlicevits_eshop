// src/components/custom-paint/color-system-data.ts
// Static data for color systems, RAL table, car manufacturers, and validation

export type ColorSystem = 'RAL' | 'NCS' | 'Pantone' | 'OEM' | 'description';

export interface ColorSystemOption {
    id: ColorSystem;
    label: string;
    description: string;
    placeholder: string;
    helpText: string;
    icon: string; // emoji
}

export const COLOR_SYSTEMS: ColorSystemOption[] = [
    {
        id: 'RAL',
        label: 'RAL',
        description: 'Ευρωπαϊκό πρότυπο χρωμάτων',
        placeholder: 'π.χ. RAL 7016',
        helpText: 'Ο κωδικός RAL βρίσκεται στην ετικέτα του δοχείου ή στο χρωματολόγιο. Μορφή: RAL + 4ψήφιος αριθμός.',
        icon: '🎨',
    },
    {
        id: 'NCS',
        label: 'NCS',
        description: 'Natural Color System',
        placeholder: 'π.χ. NCS S 2030-R90B',
        helpText: 'Το NCS χρησιμοποιείται κυρίως σε αρχιτεκτονικές εφαρμογές. Μορφή: S + αριθμοί + χρωματικός κωδικός.',
        icon: '🏗️',
    },
    {
        id: 'Pantone',
        label: 'Pantone',
        description: 'Βιομηχανικό πρότυπο',
        placeholder: 'π.χ. Pantone 185 C',
        helpText: 'Οι κωδικοί Pantone χρησιμοποιούνται σε graphic design και βιομηχανία. Μπορεί να μην αντιστοιχούν ακριβώς σε χρώμα βαφής.',
        icon: '🖨️',
    },
    {
        id: 'OEM',
        label: 'Αυτοκίνητο (OEM)',
        description: 'Κωδικός κατασκευαστή οχήματος',
        placeholder: 'π.χ. LY9T, 070, 1G3',
        helpText: 'Ο κωδικός χρώματος βρίσκεται σε ετικέτα στο εσωτερικό της πόρτας οδηγού, στο καπό ή στο βιβλίο service.',
        icon: '🚗',
    },
    {
        id: 'description',
        label: 'Περιγραφή / Δείγμα',
        description: 'Δεν ξέρω τον ακριβή κωδικό',
        placeholder: 'π.χ. σκούρο πράσινο σαν φύλλο ελιάς',
        helpText: 'Περιγράψτε το χρώμα όσο πιο αναλυτικά μπορείτε. Για ακριβή αντιστοιχία, προτείνουμε επίσκεψη στο κατάστημά μας με δείγμα.',
        icon: '✏️',
    },
];

// Top ~50 most common RAL Classic colors used in paint shops (code → hex → Greek name)
export interface RALColor {
    code: string;
    hex: string;
    name: string;
}

export const RAL_COLORS: RALColor[] = [
    { code: '1000', hex: '#BEBD7F', name: 'Πράσινο Μπεζ' },
    { code: '1001', hex: '#C2B078', name: 'Μπεζ' },
    { code: '1003', hex: '#E5BE01', name: 'Σηματοδοτικό Κίτρινο' },
    { code: '1013', hex: '#EAE6CA', name: 'Λευκό Μαργαριτάρι' },
    { code: '1015', hex: '#E6D690', name: 'Ελαφρύ Ιβουάρ' },
    { code: '1021', hex: '#F3DA0B', name: 'Κίτρινο Κάδμιο' },
    { code: '2002', hex: '#CB2821', name: 'Βερμίλιον' },
    { code: '2004', hex: '#E75B12', name: 'Καθαρό Πορτοκαλί' },
    { code: '3000', hex: '#AF2B1E', name: 'Πυρίμαχο Κόκκινο' },
    { code: '3001', hex: '#A52019', name: 'Σηματοδοτικό Κόκκινο' },
    { code: '3002', hex: '#A2231D', name: 'Κόκκινο Καρμίνι' },
    { code: '3003', hex: '#9B111E', name: 'Ρουμπινί Κόκκινο' },
    { code: '3020', hex: '#CC0605', name: 'Κόκκινο Κυκλοφορίας' },
    { code: '4010', hex: '#CF3476', name: 'Τηλε-Ματζέντα' },
    { code: '5002', hex: '#20214F', name: 'Ουλτραμαρίν Μπλε' },
    { code: '5005', hex: '#1E2460', name: 'Σηματοδοτικό Μπλε' },
    { code: '5010', hex: '#0E294B', name: 'Μπλε Εντζιαν' },
    { code: '5012', hex: '#3B83BD', name: 'Ανοιχτό Μπλε' },
    { code: '5015', hex: '#2271B3', name: 'Μπλε Ουρανού' },
    { code: '5017', hex: '#063971', name: 'Κυκλοφοριακό Μπλε' },
    { code: '5024', hex: '#5D9B9B', name: 'Μπλε Παστέλ' },
    { code: '6005', hex: '#2F4538', name: 'Πράσινο Βρύο' },
    { code: '6009', hex: '#31372B', name: 'Πράσινο Πεύκου' },
    { code: '6011', hex: '#587246', name: 'Πράσινο Ρεζέντα' },
    { code: '6018', hex: '#57A639', name: 'Πράσινο Μαΐου' },
    { code: '6019', hex: '#BDECB6', name: 'Λευκό Πράσινο' },
    { code: '6029', hex: '#20603D', name: 'Πράσινο Μέντα' },
    { code: '7001', hex: '#8A9597', name: 'Ασημί Γκρι' },
    { code: '7004', hex: '#969992', name: 'Σηματοδοτικό Γκρι' },
    { code: '7011', hex: '#434B4D', name: 'Σιδερί Γκρι' },
    { code: '7015', hex: '#4C514A', name: 'Σχιστολιθικό Γκρι' },
    { code: '7016', hex: '#293133', name: 'Ανθρακί' },
    { code: '7021', hex: '#23282B', name: 'Μαύρο Γκρι' },
    { code: '7024', hex: '#474A51', name: 'Γραφίτης' },
    { code: '7030', hex: '#8B8C7A', name: 'Πέτρινο Γκρι' },
    { code: '7032', hex: '#B8B799', name: 'Γκρι Βοτσαλάκι' },
    { code: '7035', hex: '#D7D7D7', name: 'Ανοιχτό Γκρι' },
    { code: '7037', hex: '#7D7F7D', name: 'Γκρι Σκόνης' },
    { code: '7038', hex: '#B5B8B1', name: 'Αχάτης Γκρι' },
    { code: '7040', hex: '#9DA1AA', name: 'Γκρι Παράθυρου' },
    { code: '7042', hex: '#8D948D', name: 'Κυκλοφοριακό Γκρι Α' },
    { code: '7043', hex: '#4E5452', name: 'Κυκλοφοριακό Γκρι Β' },
    { code: '7044', hex: '#CAC4B0', name: 'Μεταξωτό Γκρι' },
    { code: '7047', hex: '#D0D0D0', name: 'Τηλε-Γκρι 4' },
    { code: '8001', hex: '#955F20', name: 'Ώχρα Καφέ' },
    { code: '8011', hex: '#5B3A29', name: 'Καρυδί' },
    { code: '8017', hex: '#45322E', name: 'Σοκολατί' },
    { code: '8019', hex: '#403A3A', name: 'Γκρι Καφέ' },
    { code: '9001', hex: '#FDF4E3', name: 'Κρεμ' },
    { code: '9002', hex: '#E7EBDA', name: 'Λευκό Γκρι' },
    { code: '9003', hex: '#F4F4F4', name: 'Σηματοδοτικό Λευκό' },
    { code: '9005', hex: '#0A0A0A', name: 'Βαθύ Μαύρο' },
    { code: '9010', hex: '#FFFFFF', name: 'Καθαρό Λευκό' },
    { code: '9011', hex: '#1C1C1C', name: 'Γραφίτης Μαύρο' },
    { code: '9016', hex: '#F6F6F6', name: 'Κυκλοφοριακό Λευκό' },
    { code: '9017', hex: '#1E1E1E', name: 'Κυκλοφοριακό Μαύρο' },
];

// Greek-market car manufacturers
export const CAR_MANUFACTURERS = [
    'Audi', 'BMW', 'Citroën', 'Dacia', 'Fiat', 'Ford', 'Honda',
    'Hyundai', 'Jeep', 'Kia', 'Mazda', 'Mercedes-Benz', 'Mitsubishi',
    'Nissan', 'Opel', 'Peugeot', 'Renault', 'Seat', 'Škoda',
    'Smart', 'Subaru', 'Suzuki', 'Toyota', 'Volkswagen', 'Volvo',
    'Alfa Romeo', 'Land Rover', 'Mini', 'Porsche', 'Tesla', 'Άλλο',
];

// Validation patterns per color system
export const COLOR_CODE_PATTERNS: Record<ColorSystem, RegExp | null> = {
    RAL: /^(RAL\s?)?[0-9]{4}$/i,
    NCS: /^(NCS\s+)?S?\s?\d{4}[\-\s]?[A-Z]\d{2}[A-Z]$/i,
    Pantone: /^(Pantone\s+)?\d{1,4}\s?[A-Z]{0,3}$/i,
    OEM: null, // No universal pattern — each manufacturer differs
    description: null, // Free text
};

/**
 * Look up a RAL code and return the hex color. Returns null if not found.
 */
export function lookupRALHex(code: string): string | null {
    const cleaned = code.replace(/^RAL\s*/i, '').trim();
    const match = RAL_COLORS.find(c => c.code === cleaned);
    return match?.hex ?? null;
}

/**
 * Look up a RAL code and return the Greek name. Returns null if not found.
 */
export function lookupRALName(code: string): string | null {
    const cleaned = code.replace(/^RAL\s*/i, '').trim();
    const match = RAL_COLORS.find(c => c.code === cleaned);
    return match?.name ?? null;
}
