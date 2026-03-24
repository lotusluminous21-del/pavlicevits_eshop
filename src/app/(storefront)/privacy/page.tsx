import React from "react";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Πολιτική Απορρήτου | Pavlicevits",
    description: "Πολιτική Απορρήτου για τον ιστότοπο της Pavlicevits.",
};

export default function PrivacyPolicyPage() {
    return (
        <div className="max-w-4xl mx-auto px-6 py-20 mt-12 bg-background">
            <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-12">
                Πολιτική Απορρήτου
            </h1>
            
            <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none text-muted-foreground space-y-8">
                <section>
                    <h2 className="text-2xl font-bold text-foreground uppercase tracking-wider mb-4">1. Εισαγωγή</h2>
                    <p>
                        Η εταιρεία <strong>Pavlicevits</strong> σέβεται το απόρρητό σας και δεσμεύεται να προστατεύει 
                        τα προσωπικά σας δεδομένα. Η παρούσα Πολιτική Απορρήτου περιγράφει πώς συλλέγουμε, χρησιμοποιούμε, 
                        και προστατεύουμε τις πληροφορίες σας κατά την επίσκεψη στον ιστότοπό μας.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-foreground uppercase tracking-wider mb-4">2. Πληροφορίες που Συλλέγουμε</h2>
                    <p>
                        Επί του παρόντος, ο ιστότοπός μας λειτουργεί ως εταιρικό προφίλ (portfolio). 
                        Δεν συλλέγουμε προσωπικά δεδομένα πέρα από αυτά που εκουσίως 
                        μας παρέχετε μέσω της φόρμας επικοινωνίας (όπως όνομα, email, τηλέφωνο, 
                        και το περιεχόμενο του μηνύματός σας).
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-foreground uppercase tracking-wider mb-4">3. Χρήση των Δεδομένων σας</h2>
                    <p>
                        Οι πληροφορίες που μας παρέχετε μέσω επικοινωνίας χρησιμοποιούνται αποκλειστικά για:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 mt-4">
                        <li>Την απάντηση στα ερωτήματα ή τα αιτήματά σας.</li>
                        <li>Την επικοινωνία μαζί σας σχετικά με τις υπηρεσίες μας.</li>
                        <li>Τη βελτίωση της εξυπηρέτησης πελατών.</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-foreground uppercase tracking-wider mb-4">4. Διατήρηση Δεδομένων</h2>
                    <p>
                        Διατηρούμε τα προσωπικά σας δεδομένα μόνο για όσο χρονικό διάστημα είναι απαραίτητο 
                        για την εκπλήρωση των σκοπών για τους οποίους συλλέχθηκαν, 
                        συμπεριλαμβανομένης της ικανοποίησης νομικών, λογιστικών ή άλλων απαιτήσεων.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-foreground uppercase tracking-wider mb-4">5. Ασφάλεια</h2>
                    <p>
                        Λαμβάνουμε κατάλληλα τεχνικά και οργανωτικά μέτρα για να διασφαλίσουμε ότι 
                        τα δεδομένα σας είναι προστατευμένα από μη εξουσιοδοτημένη πρόσβαση, 
                        απώλεια ή καταστροφή.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-foreground uppercase tracking-wider mb-4">6. Τα Δικαιώματά σας</h2>
                    <p>
                        Σύμφωνα με τον Γενικό Κανονισμό Προστασίας Δεδομένων (GDPR), έχετε το δικαίωμα 
                        πρόσβασης, διόρθωσης, διαγραφής, ή περιορισμού της επεξεργασίας 
                        των προσωπικών σας δεδομένων που τηρούμε.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-foreground uppercase tracking-wider mb-4">7. Επικοινωνία</h2>
                    <p>
                        Για οποιαδήποτε απορία σχετικά με την παρούσα Πολιτική Απορρήτου, 
                        μπορείτε να επικοινωνήσετε μαζί μας μέσω της σελίδας "Επικοινωνία" 
                        στον ιστότοπό μας.
                    </p>
                </section>

                <p className="text-xs pt-8 mb-8 border-t border-border">
                    Τελευταία ενημέρωση: Μάρτιος 2026
                </p>
            </div>
        </div>
    );
}
