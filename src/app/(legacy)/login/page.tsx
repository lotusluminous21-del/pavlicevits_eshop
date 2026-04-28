"use client";

import React, { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { signInWithGoogle, signInWithEmail, signUpWithEmail } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Layers, Mail, Lock, AlertCircle, UserCircle2 } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { IndexedFadeInUp } from '@/components/ui/motion';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { app } from '@/lib/firebase';

export default function LoginPage() {
    return (
        <React.Suspense fallback={
            <div className="flex-1 flex items-center justify-center min-h-[60vh] bg-background">
                <div className="w-[50px] h-[50px] rounded-full border-[4px] border-secondary border-t-primary animate-spin shadow-sm"></div>
            </div>
        }>
            <LoginContent />
        </React.Suspense>
    );
}

function LoginContent() {
    const { user, loading, isAnonymous } = useAuth();
    const [isSigningIn, setIsSigningIn] = useState(false);
    const [isRegistering, setIsRegistering] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [authError, setAuthError] = useState<string | null>(null);
    const router = useRouter();
    const searchParams = useSearchParams();

    React.useEffect(() => {
        if (!loading && user && !isAnonymous) {
            const redirectParams = searchParams?.get('redirect');
            if (redirectParams) {
                router.push(redirectParams);
            } else {
                router.push('/');
            }
        }
    }, [user, loading, isAnonymous, router, searchParams]);

    const handleGoogleLogin = async () => {
        setIsSigningIn(true);
        setAuthError(null);
        try {
            await signInWithGoogle();
        } catch (error: any) {
            console.error(error);
            setAuthError(error.message || 'Google authentication failed.');
            setIsSigningIn(false);
        }
    };

    const handleEmailAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setAuthError(null);
        if (!email || !password) {
            setAuthError('Παρακαλούμε συμπληρώστε email και κωδικό.');
            return;
        }
        
        if (isRegistering && (!firstName || !lastName)) {
            setAuthError('Παρακαλούμε συμπληρώστε Όνομα και Επώνυμο.');
            return;
        }

        setIsSigningIn(true);
        try {
            if (isRegistering) {
                await signUpWithEmail(email, password, firstName, lastName);
                
                try {
                    const functions = getFunctions(app, 'europe-west1');
                    const syncCustomer = httpsCallable(functions, 'sync_shopify_customer');
                    await syncCustomer({ firstName, lastName });
                } catch (syncError) {
                    console.error("Failed to sync Shopify customer right away:", syncError);
                }
            } else {
                await signInWithEmail(email, password);
            }
        } catch (error: any) {
            console.error(error);
            // Translate common Firebase errors
            if (error.code === 'auth/email-already-in-use') {
                setAuthError('Αυτό το email χρησιμοποιείται ήδη.');
            } else if (error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
                setAuthError('Λάθος email ή κωδικός.');
            } else if (error.code === 'auth/weak-password') {
                setAuthError('Ο κωδικός πρέπει να έχει τουλάχιστον 6 χαρακτήρες.');
            } else {
                setAuthError(error.message || 'Authentication failed.');
            }
            setIsSigningIn(false);
        }
    };

    if (loading || (user && !isAnonymous)) {
        return (
            <div className="flex-1 flex items-center justify-center min-h-[60vh] bg-background">
                <div className="w-[50px] h-[50px] rounded-full border-[4px] border-secondary border-t-primary animate-spin shadow-sm"></div>
            </div>
        );
    }

    return (
        <div className="flex flex-1 flex-col items-center justify-center min-h-[70vh] text-center px-4 py-12 bg-background">
            <IndexedFadeInUp index={0}>
                <div className="w-20 h-20 bg-white border border-border flex items-center justify-center mb-6 shadow-sm group hover:border-primary transition-colors cursor-default rounded-2xl mx-auto">
                    <User className="w-8 h-8 text-muted-foreground group-hover:text-primary transition-colors" strokeWidth={1.5} />
                </div>
            </IndexedFadeInUp>
            <IndexedFadeInUp index={1}>
                <h1 className="text-3xl font-black text-foreground uppercase tracking-tighter mb-2">Ο Λογαριασμος Σας</h1>
                <p className="text-xs font-bold text-muted-foreground mb-8 max-w-sm uppercase tracking-widest leading-relaxed mx-auto">
                    Συνδεθείτε για να διαχειριστείτε τα έργα, να παρακολουθήσετε παραγγελίες και να δείτε τεχνικές προδιαγραφές.
                </p>
            </IndexedFadeInUp>

            <IndexedFadeInUp index={2} className="w-full max-w-[340px] mx-auto">
                <form onSubmit={handleEmailAuth} className="space-y-4 mb-6 text-left">
                    {authError && (
                        <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md flex items-start gap-2 text-destructive text-sm font-medium">
                            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                            <p>{authError}</p>
                        </div>
                    )}
                    
                    {isRegistering && (
                        <div className="flex gap-4">
                            <div className="space-y-1.5 flex-1">
                                <Label htmlFor="firstName" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Όνομα</Label>
                                <div className="relative">
                                    <Input 
                                        id="firstName" 
                                        type="text" 
                                        placeholder="Γιώργος" 
                                        value={firstName}
                                        onChange={(e) => setFirstName(e.target.value)}
                                        required={isRegistering} 
                                        className="pl-9 font-medium"
                                        disabled={isSigningIn}
                                    />
                                    <UserCircle2 className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                                </div>
                            </div>
                            <div className="space-y-1.5 flex-1">
                                <Label htmlFor="lastName" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Επώνυμο</Label>
                                <div className="relative">
                                    <Input 
                                        id="lastName" 
                                        type="text" 
                                        placeholder="Παπαδόπουλος" 
                                        value={lastName}
                                        onChange={(e) => setLastName(e.target.value)}
                                        required={isRegistering} 
                                        className="pl-9 font-medium"
                                        disabled={isSigningIn}
                                    />
                                    <UserCircle2 className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="space-y-1.5">
                        <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Διεύθυνση Email</Label>
                        <div className="relative">
                            <Input 
                                id="email" 
                                type="email" 
                                placeholder="name@company.com" 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required 
                                className="pl-9 font-medium"
                                disabled={isSigningIn}
                            />
                            <Mail className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                        </div>
                    </div>
                    
                    <div className="space-y-1.5">
                        <Label htmlFor="password" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Κωδικός Πρόσβασης</Label>
                        <div className="relative">
                            <Input 
                                id="password" 
                                type="password" 
                                placeholder="••••••••" 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required 
                                className="pl-9 font-medium"
                                disabled={isSigningIn}
                            />
                            <Lock className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                        </div>
                    </div>

                    <Button
                        type="submit"
                        disabled={isSigningIn}
                        className="w-full text-xs tracking-widest uppercase font-black bg-foreground text-background hover:opacity-90 transition-opacity rounded-md"
                        size="lg"
                    >
                        {isSigningIn ? "Επεξεργασια..." : (isRegistering ? "Δημιουργια Λογαριασμου" : "Συνδεση")}
                    </Button>
                </form>

                <div className="flex items-center gap-4 mb-6">
                    <div className="h-px bg-border flex-1"></div>
                    <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Η</span>
                    <div className="h-px bg-border flex-1"></div>
                </div>

                <div className="w-full mx-auto space-y-4">
                    <Button
                        type="button"
                        onClick={handleGoogleLogin}
                        disabled={isSigningIn}
                        variant="outline"
                        className="w-full text-[10px] tracking-widest uppercase font-black hover:bg-muted transition-colors rounded-md"
                        size="lg"
                    >
                        Συνδεση με Google
                    </Button>

                    <Button
                        type="button"
                        onClick={() => { setIsRegistering(!isRegistering); setAuthError(null); }}
                        disabled={isSigningIn}
                        variant="ghost"
                        className="w-full text-[10px] tracking-widest uppercase font-bold text-muted-foreground hover:text-foreground"
                    >
                        {isRegistering ? "Εχετε ηδη λογαριασμο; Συνδεση" : "Δεν εχετε λογαριασμο; Εγγραφη"}
                    </Button>
                </div>
            </IndexedFadeInUp>
        </div>
    );
}
