"use client";

import { useTamboThread } from "@tambo-ai/react";
import { User, Bot, Loader2 } from "lucide-react";
import { useEffect, useRef } from "react";
import { useStore } from "@/lib/store";

// Helper to safely extract text content from message
function getMessageText(content: unknown): string {
  if (typeof content === "string") {
    return content;
  }
  if (Array.isArray(content)) {
    // Handle ChatCompletionContentPart[] format
    return content
      .map((part) => {
        if (typeof part === "string") return part;
        if (part && typeof part === "object" && "text" in part) {
          return String(part.text);
        }
        return "";
      })
      .join("");
  }
  if (content && typeof content === "object" && "text" in content) {
    return String((content as { text: string }).text);
  }
  return "";
}

export function ChatThread() {
  const { thread, generationStage } = useTamboThread();
  const { recordEvent } = useStore();
  const scrollRef = useRef<HTMLDivElement>(null);
  const lastMessageCountRef = useRef(0);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [thread?.messages]);

  // Record events when messages change
  useEffect(() => {
    const messages = thread?.messages || [];
    if (messages.length > lastMessageCountRef.current) {
      // New messages were added
      for (let i = lastMessageCountRef.current; i < messages.length; i++) {
        const msg = messages[i];
        const contentText = getMessageText(msg.content);
        if (msg.role === "user") {
          recordEvent("message.sent", { inputs: contentText }, { messageIds: [msg.id] });
        } else if (msg.role === "assistant") {
          recordEvent("message.received", { outputs: contentText }, { messageIds: [msg.id] });
        }
      }
      lastMessageCountRef.current = messages.length;
    }
  }, [thread?.messages, recordEvent]);

  const messages = thread?.messages || [];
  const isGenerating = generationStage !== "IDLE" && generationStage !== "COMPLETE" && generationStage !== "ERROR";

  return (
    <div ref={scrollRef} className="h-full overflow-auto p-4 space-y-4">
      {messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-center py-12">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Bot className="h-6 w-6 text-primary" />
          </div>
          <h3 className="text-lg font-medium mb-1">Welcome to DashHub</h3>
          <p className="text-sm text-muted-foreground max-w-xs">
            Start a conversation by typing a message below.
          </p>
        </div>
      ) : (
        messages.map((message) => {
          const textContent = getMessageText(message.content);
          return (
            <div key={message.id} className="flex gap-3">
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                  message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                }`}
              >
                {message.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
              </div>
              <div className="flex-1 space-y-1 pt-1">
                <p className="text-xs font-medium text-muted-foreground">
                  {message.role === "user" ? "You" : "Assistant"}
                </p>
                <div className="text-sm leading-relaxed whitespace-pre-wrap">
                  {textContent || (
                    <span className="text-muted-foreground italic">No text content</span>
                  )}
                </div>
              </div>
            </div>
          );
        })
      )}

      {/* Loading indicator */}
      {isGenerating && (
        <div className="flex gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <Bot className="h-4 w-4" />
          </div>
          <div className="flex items-center gap-2 pt-2">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Thinking...</span>
          </div>
        </div>
      )}
    </div>
  );
}
