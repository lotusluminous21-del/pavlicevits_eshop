import ServicesClient from './services-client';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Υπηρεσίες | Παυλιτσέβιτς - Χρώματα & Δομικά Υλικά',
    description: 'Εξειδικευμένη τεχνική υποστήριξη και συμβουλευτική σε χρώματα οικοδομικά, αυτοκινήτου, ναυτιλιακά. Color matching, παρασκευή αποχρώσεων και τεχνική καθοδήγηση.',
};

export default function ServicesPage() {
    return <ServicesClient />;
}
