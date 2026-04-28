import ContactClient from './contact-client';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Επικοινωνία | Παυλιτσέβιτς - Χρώματα & Δομικά Υλικά',
    description: 'Επικοινωνήστε μαζί μας. Λεωφ. Εθνικής Αντιστάσεως 66, Καλαμαριά Θεσσαλονίκης. Τηλ: 2310 447 033. Χρώματα αυτοκινήτου, ναυτιλιακά, οικοδομικά και δομικά υλικά.',
};

export default function ContactPage() {
    return <ContactClient />;
}
