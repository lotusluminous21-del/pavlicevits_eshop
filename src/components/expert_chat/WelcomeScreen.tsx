'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, LogIn, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import type { User } from 'firebase/auth';

interface WelcomeScreenProps {
  visible: boolean;
  user: User | null;
  authLoading: boolean;
}

export function WelcomeScreen({ visible, user, authLoading }: WelcomeScreenProps) {
  const isAuthenticated = !!user;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center justify-center flex-1 select-none px-6"
        >
          {/* Brand Icon with Glow */}
          <div className="relative flex flex-col items-center justify-center gap-5">
            <div className="relative">
              <div className="expert-chat-spin w-20 h-20 md:w-28 md:h-28 rounded-full bg-accent flex items-center justify-center cursor-pointer relative z-10">
                <Sparkles className="w-8 h-8 md:w-12 md:h-12 text-accent-foreground" />
              </div>
              <div className="expert-chat-spin absolute inset-0 w-20 h-20 md:w-28 md:h-28 rounded-full bg-accent rotate-12 blur-xl opacity-50 cursor-pointer" />
            </div>

            {authLoading ? (
              /* Loading skeleton */
              <div className="flex flex-col items-center gap-3 mt-2">
                <div className="h-8 w-48 bg-secondary/60 rounded-lg animate-pulse" />
                <div className="h-4 w-64 bg-secondary/40 rounded-md animate-pulse" />
              </div>
            ) : isAuthenticated ? (
              /* ── Authenticated Welcome ── */
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.4 }}
                className="flex flex-col items-center gap-3 text-center mt-2"
              >
                <h2 className="text-2xl md:text-3xl tracking-tight font-semibold text-foreground">
                  Καλωσήρθατε στον Ειδικό
                </h2>
                <p className="text-sm md:text-base text-muted-foreground max-w-md leading-relaxed">
                  Περιγράψτε το έργο ή το πρόβλημά σας, και θα λάβετε εξατομικευμένες
                  συστάσεις προϊόντων και τεχνικές λύσεις.
                </p>
                <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground/60">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                  Έτοιμος για ανάλυση
                </div>
              </motion.div>
            ) : (
              /* ── Unauthenticated Welcome ── */
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.4 }}
                className="flex flex-col items-center gap-4 text-center mt-2"
              >
                <h2 className="text-2xl md:text-3xl tracking-tight font-semibold text-foreground">
                  Ειδικός Pavlicevits
                </h2>
                <p className="text-sm md:text-base text-muted-foreground max-w-md leading-relaxed">
                  Αποκτήστε πρόσβαση στον AI ειδικό μας για εξατομικευμένες
                  τεχνικές συμβουλές και συστάσεις προϊόντων.
                </p>
                <p className="text-sm text-muted-foreground/80 max-w-sm">
                  Δημιουργήστε έναν <span className="font-semibold text-foreground">δωρεάν λογαριασμό</span> για
                  να ξεκινήσετε.
                </p>
                <Link
                  href="/login"
                  className="mt-2 inline-flex items-center gap-2 px-6 py-3 rounded-full bg-accent text-accent-foreground font-semibold text-sm hover:bg-accent-light shadow-md hover:shadow-lg transition-all duration-200 group"
                >
                  <LogIn className="w-4 h-4" />
                  Σύνδεση / Εγγραφή
                  <ArrowRight className="w-4 h-4 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
                </Link>
              </motion.div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
