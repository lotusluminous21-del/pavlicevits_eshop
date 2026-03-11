'use client';

import { useState, useEffect, useRef, useMemo, Children, isValidElement, cloneElement, ReactNode, createContext, useContext } from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '@/lib/utils';
import type { ChatMessage as ChatMessageType } from '@/lib/expert/store';

// ─── Streaming Reveal ─────────────────────────────────────────────
// ReactMarkdown parses all formatting. Every text word is assigned a
// sequential index via a mutable counter. A progressive reveal timer
// advances +1 word every WORD_INTERVAL_MS. Words within ACTIVE_WINDOW
// of the reveal edge animate via motion.span (opacity + blur + y).
// Words further behind render as plain <span> for performance.
// List items hide their markers until their first word is reached.

/** Messages already fully revealed — survives re-renders but NOT page reloads */
const revealedMessages = new Set<string>();

/** Whether initial hydration seeding has run */
let _hydrationSeeded = false;

/**
 * Call once after the store rehydrates to mark all existing message IDs
 * as already revealed. This ensures the reveal effect only fires for
 * genuinely new messages, not on page reload.
 */
export function seedRevealedMessages(ids: string[]) {
  if (_hydrationSeeded) return;
  _hydrationSeeded = true;
  ids.forEach((id) => revealedMessages.add(id));
}

const ASSISTANT_WORD_INTERVAL_MS = 50;   // ms between each word reveal (assistant)
const USER_WORD_INTERVAL_MS = 25;        // faster for user messages
const WORD_TRANSITION_S = 0.3;           // duration of each word's fade-in
const ACTIVE_WINDOW = 12;                // only this many trailing words use motion.span

// ─── Reveal Context ─────────────────────────────────────────────

interface RevealState {
  counter: { current: number };
  revealedCount: number;
  isAnimating: boolean;
  isUser: boolean;
}

const RevealContext = createContext<RevealState>({
  counter: { current: 0 },
  revealedCount: Infinity,
  isAnimating: false,
  isUser: false,
});

// ─── Word Wrapper ───────────────────────────────────────────────

function wrapChildren(children: ReactNode): ReactNode {
  return Children.map(children, (child) => {
    if (typeof child === 'string') {
      return <AnimatedWords text={child} />;
    }
    if (isValidElement(child)) {
      const el = child as React.ReactElement<any>;
      if (el.props.children != null) {
        return cloneElement(el, {}, wrapChildren(el.props.children));
      }
      return el;
    }
    return child;
  });
}

function AnimatedWords({ text }: { text: string }) {
  const { counter, revealedCount, isAnimating, isUser } = useContext(RevealContext);
  const segments = text.split(/(\s+)/);

  return (
    <>
      {segments.map((seg, i) => {
        if (/^\s+$/.test(seg)) {
          return <span key={i}>{seg}</span>;
        }

        const wordIdx = counter.current++;

        if (!isAnimating) {
          return <span key={i}>{seg}</span>;
        }

        const isVisible = wordIdx < revealedCount;
        const isSettled = wordIdx < revealedCount - ACTIVE_WINDOW;

        // Far behind the edge → plain span (no motion overhead)
        if (isSettled) {
          return <span key={i}>{seg}</span>;
        }

        // Near the edge → animated motion.span
        return (
          <motion.span
            key={i}
            initial={
              isUser
                ? { opacity: 0, y: 4 }
                : { opacity: 0, y: 8, filter: 'blur(6px)' }
            }
            animate={
              isVisible
                ? isUser
                  ? { opacity: 1, y: 0 }
                  : { opacity: 1, y: 0, filter: 'blur(0px)' }
                : isUser
                  ? { opacity: 0, y: 4 }
                  : { opacity: 0, y: 8, filter: 'blur(6px)' }
            }
            transition={{
              duration: isUser ? 0.2 : WORD_TRANSITION_S,
              ease: [0.25, 0.1, 0.25, 1],
            }}
            className="inline"
          >
            {seg}
          </motion.span>
        );
      })}
    </>
  );
}

// ─── Animated List Item ─────────────────────────────────────────
// Hides the list marker (number/bullet) until the first word in
// this <li> is reached by the reveal counter.

function AnimatedLi({ children, ...props }: any) {
  const { counter, revealedCount, isAnimating } = useContext(RevealContext);
  const startIdx = counter.current; // capture index BEFORE wrapping
  const wrapped = wrapChildren(children);

  if (!isAnimating) {
    return <li {...props}>{wrapped}</li>;
  }

  const markerVisible = startIdx < revealedCount;

  return (
    <li
      {...props}
      style={{
        listStyleType: markerVisible ? undefined : 'none',
        transition: 'list-style-type 0s',
      }}
    >
      {wrapped}
    </li>
  );
}

// ─── Animated Markdown Components ───────────────────────────────

const animatedMdComponents = {
  p: ({ children, ...props }: any) => <p {...props}>{wrapChildren(children)}</p>,
  li: AnimatedLi,
  h1: ({ children, ...props }: any) => <h1 {...props}>{wrapChildren(children)}</h1>,
  h2: ({ children, ...props }: any) => <h2 {...props}>{wrapChildren(children)}</h2>,
  h3: ({ children, ...props }: any) => <h3 {...props}>{wrapChildren(children)}</h3>,
  h4: ({ children, ...props }: any) => <h4 {...props}>{wrapChildren(children)}</h4>,
  strong: ({ children, ...props }: any) => <strong {...props}>{wrapChildren(children)}</strong>,
  em: ({ children, ...props }: any) => <em {...props}>{wrapChildren(children)}</em>,
  blockquote: ({ children, ...props }: any) => <blockquote {...props}>{wrapChildren(children)}</blockquote>,
  a: ({ children, ...props }: any) => (
    <a {...props} className="text-accent hover:text-accent-light underline underline-offset-2 transition-colors" target="_blank" rel="noopener noreferrer">
      {wrapChildren(children)}
    </a>
  ),
  table: ({ children, ...props }: any) => (
    <div className="overflow-x-auto my-2">
      <table className="min-w-full divide-y divide-border" {...props}>{children}</table>
    </div>
  ),
  th: ({ children, ...props }: any) => (
    <th className="px-3 py-1.5 bg-secondary text-left text-xs font-semibold uppercase tracking-wider" {...props}>{wrapChildren(children)}</th>
  ),
  td: ({ children, ...props }: any) => (
    <td className="px-3 py-1.5 border-t border-border text-sm" {...props}>{wrapChildren(children)}</td>
  ),
  code: ({ children, className: codeClassName, ...props }: any) => {
    const isBlock = codeClassName?.includes('language-');
    if (isBlock) {
      return <code className="block bg-secondary p-3 rounded-lg my-2 text-sm overflow-x-auto" {...props}>{children}</code>;
    }
    return <code className="bg-secondary px-1.5 py-0.5 rounded text-sm font-mono" {...props}>{wrapChildren(children)}</code>;
  },
  img: ({ alt, ...props }: any) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={alt || 'image'} {...props} className="rounded-lg max-w-full h-auto my-2 hover:shadow-md transition-shadow" loading="lazy" />
  ),
};

// ─── Static Markdown Components ─────────────────────────────────

const staticMdComponents = {
  table: ({ children, ...props }: any) => (
    <div className="overflow-x-auto my-2">
      <table className="min-w-full divide-y divide-border" {...props}>{children}</table>
    </div>
  ),
  th: ({ children, ...props }: any) => (
    <th className="px-3 py-1.5 bg-secondary text-left text-xs font-semibold uppercase tracking-wider" {...props}>{children}</th>
  ),
  td: ({ children, ...props }: any) => (
    <td className="px-3 py-1.5 border-t border-border text-sm" {...props}>{children}</td>
  ),
  code: ({ children, className: codeClassName, ...props }: any) => {
    const isBlock = codeClassName?.includes('language-');
    if (isBlock) {
      return <code className="block bg-secondary p-3 rounded-lg my-2 text-sm overflow-x-auto" {...props}>{children}</code>;
    }
    return <code className="bg-secondary px-1.5 py-0.5 rounded text-sm font-mono" {...props}>{children}</code>;
  },
  img: ({ alt, ...props }: any) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={alt || 'image'} {...props} className="rounded-lg max-w-full h-auto my-2 hover:shadow-md transition-shadow" loading="lazy" />
  ),
  a: ({ children, ...props }: any) => (
    <a {...props} className="text-accent hover:text-accent-light underline underline-offset-2 transition-colors" target="_blank" rel="noopener noreferrer">{children}</a>
  ),
};

// ─── Helpers ────────────────────────────────────────────────────

function formatRelativeTime(timestamp: number): string {
  if (!timestamp || typeof timestamp !== 'number' || isNaN(timestamp)) return '';
  const diff = Date.now() - timestamp;
  if (diff < 0 || isNaN(diff)) return '';
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'τώρα';
  if (minutes < 60) return `πριν ${minutes} λ.`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `πριν ${hours} ώρ.`;
  return new Date(timestamp).toLocaleTimeString('el-GR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

// ─── Main Component ─────────────────────────────────────────────

interface ChatMessageProps {
  message: ChatMessageType;
  isLast: boolean;
  isTyping: boolean;
}

export function ChatMessageBubble({ message, isLast, isTyping }: ChatMessageProps) {
  const isUser = message.role === 'user';
  const isAssistant = !isUser;

  const alreadyRevealed = revealedMessages.has(message.id);

  const [revealedCount, setRevealedCount] = useState(alreadyRevealed ? Infinity : 0);
  const [isDone, setIsDone] = useState(alreadyRevealed);

  const bubbleRef = useRef<HTMLDivElement>(null);

  // Mutable counter — resets to 0 each render, shared via context
  const counterRef = useRef(0);
  counterRef.current = 0;

  // After each render, capture how many words ReactMarkdown produced
  const renderedWordCountRef = useRef(0);

  const intervalMs = isUser ? USER_WORD_INTERVAL_MS : ASSISTANT_WORD_INTERVAL_MS;

  // Progressive word reveal timer — works for BOTH user and assistant
  useEffect(() => {
    if (alreadyRevealed) {
      setRevealedCount(Infinity);
      setIsDone(true);
      revealedMessages.add(message.id);
      return;
    }

    setRevealedCount(0);
    setIsDone(false);

    const timer = setInterval(() => {
      setRevealedCount((prev) => {
        const next = prev + 1;
        if (next >= renderedWordCountRef.current && renderedWordCountRef.current > 0) {
          clearInterval(timer);
          revealedMessages.add(message.id);
          setIsDone(true);
          return Infinity;
        }
        return next;
      });
    }, intervalMs);

    return () => clearInterval(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [message.id, alreadyRevealed, intervalMs]);

  // Auto-scroll during reveal (only if user is already near bottom)
  useEffect(() => {
    if (isLast && !isDone && bubbleRef.current) {
      const parent = bubbleRef.current.closest('.overflow-y-auto');
      if (parent) {
        const { scrollTop, scrollHeight, clientHeight } = parent;
        const nearBottom = scrollHeight - scrollTop - clientHeight < 150;
        if (nearBottom) {
          bubbleRef.current.scrollIntoView?.({ behavior: 'smooth', block: 'end' });
        }
      }
    }
  }, [revealedCount, isLast, isDone]);

  // Context value
  const revealState: RevealState = {
    counter: counterRef,
    revealedCount,
    isAnimating: !isDone,
    isUser,
  };

  // After React processes the tree, capture the final counter value
  useEffect(() => {
    renderedWordCountRef.current = counterRef.current;
  });

  const timeStr = formatRelativeTime(message.timestamp);

  return (
    <motion.div
      ref={bubbleRef}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', damping: 25, stiffness: 300, duration: 0.4 }}
      className={cn(
        'flex gap-2',
        isUser ? 'w-fit ml-auto flex-row-reverse' : '',
      )}
    >
      {/* Avatar */}
      {isUser ? (
        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-secondary border border-border/60" />
      ) : (
        <div className="flex-shrink-0 w-6 h-6 md:w-7 md:h-7 rounded-full bg-accent flex items-center justify-center shadow-sm">
          <Sparkles className="w-3 h-3 md:w-3.5 md:h-3.5 text-accent-foreground" />
        </div>
      )}

      {/* Bubble */}
      <div
        className={cn(
          'rounded-2xl px-3.5 py-2 break-words',
          isUser
            ? 'bg-secondary text-foreground rounded-tr-sm border border-border/40 max-w-[80%]'
            : 'bg-transparent text-foreground rounded-tl-sm max-w-[700px]',
        )}
      >
        {isUser ? (
          isDone ? (
            <p className="text-sm leading-snug tracking-[-0.01em]">{message.content}</p>
          ) : (
            <RevealContext.Provider value={revealState}>
              <p className="text-sm leading-snug tracking-[-0.01em]">
                <AnimatedWords text={message.content} />
              </p>
            </RevealContext.Provider>
          )
        ) : (
          <div className="markdown-chat">
            {isDone ? (
              <ReactMarkdown remarkPlugins={[remarkGfm]} components={staticMdComponents}>
                {message.content}
              </ReactMarkdown>
            ) : (
              <RevealContext.Provider value={revealState}>
                <ReactMarkdown remarkPlugins={[remarkGfm]} components={animatedMdComponents}>
                  {message.content}
                </ReactMarkdown>
              </RevealContext.Provider>
            )}
          </div>
        )}

        {/* Typing indicator */}
        {isTyping && isLast && !isUser && isDone && (
          <div className="flex items-center gap-2 mt-1.5">
            <div className="flex items-center space-x-1">
              <div className="w-1.5 h-1.5 animate-bounce rounded-full bg-muted-foreground/60 [animation-delay:-0.3s]" />
              <div className="w-1.5 h-1.5 animate-bounce rounded-full bg-muted-foreground/60 [animation-delay:-0.15s]" />
              <div className="w-1.5 h-1.5 animate-bounce rounded-full bg-muted-foreground/40" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground animate-pulse">
              ΑΝΑΛΥΣΗ…
            </span>
          </div>
        )}

        {/* Timestamp (assistant only) */}
        {!isUser && timeStr && (
          <p className="text-[10px] mt-1 text-muted-foreground/50">
            {timeStr}
          </p>
        )}
      </div>
    </motion.div>
  );
}
