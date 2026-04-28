import AboutClient from './about-client';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Η Εταιρία μας | Παυλιτσέβιτς - Χρώματα & Δομικά Υλικά',
    description: 'Από το 1982 στον χώρο των χρωμάτων με συνέπεια, γνώση και αφοσίωση στην ποιότητα. Εξειδίκευση σε χρώματα αυτοκινήτου, ναυτιλιακά, οικοδομικά και δομικά υλικά.',
};

export default function AboutPage() {
    return <AboutClient />;
}
