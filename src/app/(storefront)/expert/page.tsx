import { Metadata } from 'next';
import ExpertContent from './expert-content';

export const metadata: Metadata = {
    title: 'AI Expert Assistant | Pavlicevits',
    description:
        'Industrial coating specialist AI assistant. Get personalized coating recommendations based on your surface type, environment, and project requirements.',
};

export default function ExpertPage() {
    return <ExpertContent />;
}
