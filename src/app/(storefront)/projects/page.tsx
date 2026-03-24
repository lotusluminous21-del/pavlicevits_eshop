import ProjectsClient from './projects-client';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Τα Έργα μας | Παυλιτσέβιτς - Χρώματα & Δομικά Υλικά',
    description: 'Δείτε τα υλοποιημένα έργα μας με χρώματα αυτοκινήτου, ναυτιλιακά, οικοδομικά και δομικά υλικά.',
};

export default function ProjectsPage() {
    return <ProjectsClient />;
}
