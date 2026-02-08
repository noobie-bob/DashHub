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
          const text = (part as Record<string, unknown>).text;
          return typeof text === "string" ? text : String(text ?? "");
        }
        return "";
      })
      .join("");
  }
  if (content && typeof content === "object" && "text" in content) {
    const text = (content as Record<string, unknown>).text;
    return typeof text === "string" ? text : String(text ?? "");
  }
  return "";
}

export function ChatThread() {
  const { thread, generationStage } = useTamboThread();
  const { recordEvent } = useStore();
  const scrollRef = useRef<HTMLDivElement>(null);
  const lastThreadIdRef = useRef<string | null>(null);
  const seenMessageIdsRef = useRef<Set<string>>(new Set());
  const pendingAssistantMessageIdsRef = useRef<Set<string>>(new Set());
  const threadId = (thread as { id?: string } | null | undefined)?.id ?? null;

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [thread?.messages]);

  // Record events when messages change
  useEffect(() => {
    const messages = thread?.messages || [];
    const isGenerationSettled =
      generationStage === "IDLE" || generationStage === "COMPLETE" || generationStage === "ERROR";

    if (threadId !== lastThreadIdRef.current) {
      lastThreadIdRef.current = threadId;
      seenMessageIdsRef.current = new Set();
      pendingAssistantMessageIdsRef.current = new Set();
    }

    if (isGenerationSettled && pendingAssistantMessageIdsRef.current.size > 0) {
      const messagesById = new Map(messages.map((m) => [m.id, m] as const));

      for (const id of Array.from(pendingAssistantMessageIdsRef.current)) {
        const msg = messagesById.get(id);
        if (!msg) {
          pendingAssistantMessageIdsRef.current.delete(id);
          continue;
        }

        const contentText = getMessageText(msg.content);
        if (!contentText) continue;

        recordEvent("message.received", { outputs: contentText }, { messageIds: [msg.id] });
        pendingAssistantMessageIdsRef.current.delete(id);
      }
    }

    for (const msg of messages) {
      if (seenMessageIdsRef.current.has(msg.id)) continue;

      const contentText = getMessageText(msg.content);
      if (!contentText) continue;

      if (msg.role === "assistant" && !isGenerationSettled) {
        pendingAssistantMessageIdsRef.current.add(msg.id);
        seenMessageIdsRef.current.add(msg.id);
        continue;
      }

      if (msg.role === "user") {
        recordEvent("message.sent", { inputs: contentText }, { messageIds: [msg.id] });
      } else if (msg.role === "assistant") {
        recordEvent("message.received", { outputs: contentText }, { messageIds: [msg.id] });
      }

      seenMessageIdsRef.current.add(msg.id);
      pendingAssistantMessageIdsRef.current.delete(msg.id);
    }
  }, [threadId, thread?.messages, generationStage, recordEvent]);

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
