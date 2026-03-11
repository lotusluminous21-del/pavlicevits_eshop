'use client';

import {
  ThreadPrimitive,
  ComposerPrimitive,
  MessagePrimitive,
} from "@assistant-ui/react";
import { type FC } from "react";
import { Sparkles, ArrowUp } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";

export const MyThread: FC = () => {
  return (
    <ThreadPrimitive.Root className="flex h-full flex-col bg-background relative selection:bg-accent/20">
      <ThreadPrimitive.Viewport className="flex-1 overflow-y-auto scroll-smooth p-4 sm:p-6 md:px-10 pb-32">
        <ThreadPrimitive.Messages
          components={{
            UserMessage,
            AssistantMessage,
          }}
        />
      </ThreadPrimitive.Viewport>

      {/* Floating Composer */}
      <div className="absolute bottom-6 left-0 right-0 px-4 sm:px-6 md:px-10 z-10 pointer-events-none flex justify-center">
        <div className="w-full max-w-3xl pointer-events-auto">
          <MyComposer />
        </div>
      </div>
    </ThreadPrimitive.Root>
  );
};

const UserMessage: FC = () => {
  return (
    <MessagePrimitive.Root className="mb-8 flex flex-row-reverse gap-3 items-end max-w-3xl mx-auto w-full animate-in fade-in slide-in-from-bottom-2 duration-500 ease-out fill-mode-both">
      <div className="flex flex-col items-end max-w-[85%]">
        <div className="rounded-2xl rounded-br-sm px-5 py-3.5 bg-accent text-accent-foreground text-[15px] shadow-sm font-medium">
          <MessagePrimitive.Content />
        </div>
      </div>
    </MessagePrimitive.Root>
  );
};

const AssistantMessage: FC = () => {
  return (
    <MessagePrimitive.Root className="mb-8 flex gap-4 items-start max-w-3xl mx-auto relative w-full animate-in fade-in slide-in-from-bottom-2 duration-500 ease-out fill-mode-both">
      <div className="flex-shrink-0 w-8 h-8 md:w-10 md:h-10 rounded-full bg-primary flex items-center justify-center shadow-sm">
        <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-primary-foreground" />
      </div>
      <div className="flex flex-col max-w-[85%] mt-1">
        <div className="text-foreground text-[15px] transition-all duration-300">
           <MessagePrimitive.Content 
             components={{
               Text: ({ text }) => (
                 <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none prose-p:leading-relaxed prose-p:mb-4 last:prose-p:mb-0 prose-strong:text-foreground prose-strong:font-bold prose-headings:font-bold prose-headings:text-foreground">
                   <ReactMarkdown remarkPlugins={[remarkGfm]}>
                     {text}
                   </ReactMarkdown>
                 </div>
               )
             }}
           />
           
           <ThreadPrimitive.If running>
             <MessagePrimitive.If last>
                <div className="mt-3 flex items-center gap-2 text-accent bg-accent/5 w-fit px-3 py-1.5 rounded-full border border-accent/10">
                  <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                  <span className="text-[11px] font-bold uppercase tracking-widest bg-gradient-to-r from-accent to-accent-light bg-clip-text text-transparent animate-pulse">
                    ΑΝΑΛΥΣΗ ΈΡΓΟΥ...
                  </span>
                </div>
             </MessagePrimitive.If>
           </ThreadPrimitive.If>
        </div>
      </div>
    </MessagePrimitive.Root>
  );
};

const MyComposer: FC = () => {
  return (
    <ComposerPrimitive.Root className="relative flex flex-col gap-2">
      <div className="flex items-end gap-2 relative bg-card/80 backdrop-blur-xl border border-border shadow-skeuo-float rounded-3xl p-1.5 transition-shadow focus-within:shadow-skeuo-float focus-within:border-accent/40">
        <ComposerPrimitive.Input
          placeholder="Περιγράψτε το έργο σας ή ρωτήστε τεχνικά..."
          rows={1}
          autoFocus={false}
          className="w-full bg-transparent px-5 py-3.5 pr-14 text-[15px] resize-none focus:outline-none placeholder:text-muted-foreground min-h-[52px] max-h-[200px]"
        />
        
        <div className="absolute right-2.5 bottom-2.5 flex items-center">
          <ComposerPrimitive.Send className={cn(
            "p-2.5 rounded-full transition-all flex items-center justify-center",
            "bg-accent text-accent-foreground hover:bg-accent-light shadow-sm hover:shadow",
            "disabled:opacity-50 disabled:bg-muted disabled:text-muted-foreground disabled:shadow-none disabled:cursor-not-allowed"
          )}>
            <ArrowUp className="w-4 h-4 stroke-[2.5]" />
          </ComposerPrimitive.Send>
        </div>
      </div>
    </ComposerPrimitive.Root>
  );
};
