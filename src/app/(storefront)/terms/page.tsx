import React from "react";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Όροι Χρήσης | Pavlicevits",
    description: "Όροι Χρήσης για τον ιστότοπο της Pavlicevits.",
};

export default function TermsOfServicePage() {
    return (
        <div className="max-w-4xl mx-auto px-6 py-20 mt-12 bg-background">
            <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-12">
                Όροι Χρήσης
            </h1>
            
            <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none text-muted-foreground space-y-8">
                <section>
                    <h2 className="text-2xl font-bold text-foreground uppercase tracking-wider mb-4">1. Εισαγωγή</h2>
                    <p>
                        Καλώς ήρθατε στον ιστότοπο της <strong>Pavlicevits</strong>. 
                        Η πρόσβαση και η χρήση του παρόντος ιστότοπου υπόκεινται στους παρακάτω 
                        Όρους Χρήσης. Παρακαλούμε να τους διαβάσετε προσεκτικά πριν πλοηγηθείτε 
                        ή χρησιμοποιήσετε τις υπηρεσίες μας. Ανατρέχοντας στον ιστότοπο, συμφωνείτε 
                        με τους παρόντες όρους.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-foreground uppercase tracking-wider mb-4">2. Πνευματική Ιδιοκτησία</h2>
                    <p>
                        Το σύνολο του περιεχομένου αυτού του ιστότοπου, συμπεριλαμβανομένων κειμένων, 
                        γραφικών, λογοτύπων, εικόνων (συμπεριλαμβανομένου φωτογραφικού υλικού έργων), 
                        σχεδίων και λογισμικού, αποτελεί πνευματική ιδιοκτησία της <strong>Pavlicevits</strong> 
                        ή των προμηθευτών/συνεργατών της και προστατεύεται από τους σχετικούς νόμους 
                        περί πνευματικών δικαιωμάτων.
                    </p>
                    <p className="mt-4">
                        Απαγορεύεται οποιαδήποτε αναπαραγωγή, τροποποίηση, διανομή ή εμπορική 
                        εκμετάλλευση του περιεχομένου χωρίς την προηγούμενη έγγραφη συγκατάθεσή μας.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-foreground uppercase tracking-wider mb-4">3. Χρήση του Ιστότοπου</h2>
                    <p>
                        Ο ιστότοπος προορίζεται για ενημερωτικούς σκοπούς σχετικά με τις 
                        δραστηριότητες, τις υπηρεσίες και τα έργα μας (portfolio). 
                        Συμφωνείτε να χρησιμοποιείτε τον ιστότοπο μόνο για νόμιμους σκοπούς 
                        και με τρόπο που δεν παραβιάζει τα δικαιώματα ούτε περιορίζει ή εμποδίζει 
                        τη χρήση του από οποιονδήποτε τρίτο.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-foreground uppercase tracking-wider mb-4">4. Ακρίβεια Πληροφοριών</h2>
                    <p>
                        Καταβάλλουμε κάθε δυνατή προσπάθεια ώστε οι πληροφορίες που παρέχονται στον 
                        ιστότοπο να είναι ακριβείς και ενημερωμένες. Ωστόσο, δεν παρέχουμε καμία 
                        εγγύηση (ρητή ή σιωπηρή) όσον αφορά την πληρότητα, την ακρίβεια ή την 
                        καταλληλότητα αυτών των πληροφοριών. Οι απεικονίσεις των έργων 
                        μπορεί να διαφέρουν εξαιτίας τεχνικών περιορισμών.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-foreground uppercase tracking-wider mb-4">5. Περιορισμός Ευθύνης</h2>
                    <p>
                        Στο μέγιστο βαθμό που επιτρέπεται από τον νόμο, η <strong>Pavlicevits</strong> 
                        δεν φέρει ουδεμία ευθύνη για άμεσες, έμμεσες, ειδικές, τυχαίες ή 
                        παρεπόμενες ζημίες που τυχόν προκύψουν από τη χρήση ή την αδυναμία 
                        χρήσης αυτού του ιστότοπου.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-foreground uppercase tracking-wider mb-4">6. Τροποποιήσεις Όρων</h2>
                    <p>
                        Διατηρούμε το δικαίωμα να τροποποιούμε τους παρόντες Όρους Χρήσης ανά πάσα στιγμή. 
                        Οι όποιες αλλαγές θα αναρτώνται σε αυτήν τη σελίδα. Η συνεχιζόμενη χρήση 
                        του ιστότοπου μετά από οποιαδήποτε αλλαγή συνιστά αποδοχή των νέων όρων.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-foreground uppercase tracking-wider mb-4">7. Επικοινωνία</h2>
                    <p>
                        Εάν έχετε οποιαδήποτε ερώτηση σχετικά με τους παρόντες Όρους, 
                        παρακαλούμε επικοινωνήστε μαζί μας μέσω της φόρμας "Επικοινωνία" 
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
