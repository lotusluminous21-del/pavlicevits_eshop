'use client';

import { motion } from 'framer-motion';
import { PlusCircle, PanelLeftOpen } from 'lucide-react';
import Image from 'next/image';
import TextRotate from './TextRotate';

const CAPABILITY_LABELS = [
  'Αντιδιαβρωτικά',
  'Βαφές & Επικαλύψεις',
  'Υφαλοχρώματα',
  'ISO 12944',
  'Εποξειδικά',
];

interface ChatHeaderProps {
  hasMessages: boolean;
  onReset: () => void;
  onOpenSidebar: () => void;
}

export function ChatHeader({ hasMessages, onReset, onOpenSidebar }: ChatHeaderProps) {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex items-center justify-between gap-3 px-4 sm:px-6 md:px-8 py-3 border-b border-border/60 bg-background/60 backdrop-blur-sm flex-shrink-0 z-10"
    >
      <div className="flex items-center gap-3">
        {/* Mobile sidebar toggle */}
        <button
          onClick={onOpenSidebar}
          className="md:hidden inline-flex items-center justify-center w-8 h-8 rounded-md bg-secondary border border-border hover:bg-muted transition-colors"
        >
          <PanelLeftOpen className="w-4 h-4" />
        </button>

        {/* Logo */}
        <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center shadow-sm">
          <Image
            src="/svg/pavlicevits_logo.svg"
            alt="Pavlicevits"
            width={22}
            height={22}
            className="brightness-0 invert"
          />
        </div>

        <div>
          <h1 className="font-semibold text-foreground text-sm md:text-base">Ειδικός Pavlicevits</h1>
          <div className="text-xs text-muted-foreground inline-flex items-center">
            <span className="mr-1">με</span>
            <TextRotate
              texts={CAPABILITY_LABELS}
              mainClassName="text-xs"
              staggerFrom="last"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '-120%' }}
              staggerDuration={0.025}
              splitLevelClassName="overflow-hidden pb-0.5"
              transition={{ type: 'spring', damping: 20, stiffness: 200 }}
              rotationInterval={2500}
            />
          </div>
        </div>
      </div>

      {/* New session button */}
      {hasMessages && (
        <button
          onClick={onReset}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-muted-foreground hover:text-foreground bg-secondary/80 border border-border hover:border-foreground/20 transition-all"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Νέα Συνεδρία</span>
        </button>
      )}
    </motion.header>
  );
}
