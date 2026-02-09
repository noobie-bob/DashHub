"use client";

import { useTamboThread } from "@tambo-ai/react";
import { User, Bot, Loader2 } from "lucide-react";
import { useEffect, useRef } from "react";
import { useStore } from "@/lib/store";
import { SummaryCard } from "@/components/tambo/SummaryCard";
import { DataTable } from "@/components/tambo/DataTable";
import { Graph } from "@/components/tambo/Graph";
import ReactMarkdown from "react-markdown";

// Helper to safely extract text content from message
function getMessageText(content: unknown): string {
  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    return content
      .map((c: unknown) => {
        if (typeof c === "string") return c;
        if (c && typeof c === "object") {
          const part = c as Record<string, unknown>;
          if ("text" in part) return String(part.text);
          if (part.type === "text" && "content" in part) {
            return String(part.content);
          }
        }
        return "";
      })
      .filter(Boolean)
      .join("\n");
  }
  if (content && typeof content === "object" && "text" in content) {
    const text = (content as Record<string, unknown>).text;
    return typeof text === "string" ? text : String(text ?? "");
  }
  return "";
}

export function ChatThread() {
  const { thread, generationStage } = useTamboThread();
  const { state, recordEvent } = useStore();
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
      generationStage === "IDLE" ||
      generationStage === "COMPLETE" ||
      generationStage === "ERROR";

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

        recordEvent(
          "message.received",
          { outputs: contentText },
          { messageIds: [msg.id] }
        );
        pendingAssistantMessageIdsRef.current.delete(id);
      }
    }

    const existingEvents = state.events;

    for (let i = 0; i < messages.length; i++) {
      const msg = messages[i] as ThreadMessage;
      if (seenMessageIdsRef.current.has(msg.id)) continue;

      // Event Deduplication: Skip recording for text-only follow-ups if previous was a card
      const prevMsg = i > 0 ? (messages[i - 1] as ThreadMessage) : null;
      const isRedundant =
        msg.role === "assistant" &&
        !hasComponent(msg) &&
        prevMsg?.role === "assistant" &&
        hasComponent(prevMsg);

      if (isRedundant) {
        seenMessageIdsRef.current.add(msg.id);
        continue;
      }

      // Double check store to prevent duplication on remount (tab switch)
      const hasSentEvent = existingEvents.some(
        (e) => e.kind === "message.sent" && e.refs?.messageIds?.includes(msg.id)
      );
      const hasReceivedEvent = existingEvents.some(
        (e) =>
          e.kind === "message.received" && e.refs?.messageIds?.includes(msg.id)
      );

      const contentText = getMessageText(msg.content);
      if (!contentText) continue;

      if (msg.role === "assistant" && !isGenerationSettled) {
        if (!hasReceivedEvent) {
          pendingAssistantMessageIdsRef.current.add(msg.id);
        }
        seenMessageIdsRef.current.add(msg.id);
        continue;
      }

      if (msg.role === "user" && !hasSentEvent) {
        recordEvent(
          "message.sent",
          { inputs: contentText },
          { messageIds: [msg.id] }
        );
      } else if (msg.role === "assistant" && !hasReceivedEvent) {
        recordEvent(
          "message.received",
          { outputs: contentText },
          { messageIds: [msg.id] }
        );
      }

      seenMessageIdsRef.current.add(msg.id);
      pendingAssistantMessageIdsRef.current.delete(msg.id);
    }
  }, [threadId, thread?.messages, generationStage, recordEvent, state.events]);

  const messages = thread?.messages || [];
  const isGenerating =
    generationStage !== "IDLE" &&
    generationStage !== "COMPLETE" &&
    generationStage !== "ERROR";

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
        messages.map((message: unknown, index: number) => {
          const msg = message as ThreadMessage;
          const textContent = getMessageText(msg.content);

          // Multi-message deduplication:
          // If this is an assistant message with NO component, but the PREVIOUS message
          // was an assistant message WITH a component, we hide this one to avoid duplication.
          const prevMsg =
            index > 0 ? (messages[index - 1] as ThreadMessage) : null;

          const isRedundantTextOnly =
            msg.role === "assistant" &&
            !hasComponent(msg) &&
            prevMsg?.role === "assistant" &&
            hasComponent(prevMsg);

          if (isRedundantTextOnly) return null;

          return (
            <div key={msg.id} className="flex gap-3">
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {msg.role === "user" ? (
                  <User className="h-4 w-4" />
                ) : (
                  <Bot className="h-4 w-4" />
                )}
              </div>
              <div className="flex-1 space-y-1 pt-1">
                <p className="text-xs font-medium text-muted-foreground">
                  {msg.role === "user" ? "You" : "Assistant"}
                </p>
                <div className="text-sm leading-relaxed whitespace-pre-wrap">
                  {/* Render Text Content (Hide if assistant message has generative UI to avoid redundancy) */}
                  {textContent &&
                    !(
                      msg.role === "assistant" &&
                      (msg.renderedComponent ||
                        (msg.tool_calls && msg.tool_calls.length > 0) ||
                        (msg.toolInvocations && msg.toolInvocations.length > 0))
                    ) && (
                      <div className="mb-2 prose prose-sm dark:prose-invert max-w-none">
                        <ReactMarkdown>{textContent}</ReactMarkdown>
                      </div>
                    )}

                  {/* Render Generative UI Component from Tambo SDK */}
                  {msg.renderedComponent && (
                    <div className="mt-2">{msg.renderedComponent}</div>
                  )}

                  {/* Render tool_calls (Newer SDK pattern) */}
                  {Array.isArray(msg.tool_calls) &&
                    msg.tool_calls.map((toolCall: unknown) => {
                      const tc = toolCall as {
                        id: string;
                        function?: { name: string; arguments: string };
                      };
                      const { name, arguments: argsStr } = tc.function || {};
                      if (!name) return null;
                      let args = {};
                      try {
                        args =
                          typeof argsStr === "string"
                            ? JSON.parse(argsStr)
                            : argsStr;
                      } catch (e) {
                        console.error("Failed to parse tool_call args:", e);
                      }
                      return (
                        <div key={tc.id} className="mt-2">
                          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                          <ToolRenderer toolName={name} args={args as any} />
                        </div>
                      );
                    })}

                  {/* Fallback Rendering (Legacy toolInvocations) */}
                  {msg.toolInvocations?.map((toolInvocation) => {
                    const { toolName, toolCallId, args } = toolInvocation;
                    return (
                      <div key={toolCallId} className="mt-2">
                        <ToolRenderer toolName={toolName} args={args} />
                      </div>
                    );
                  })}
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

interface ToolInvocation {
  toolName: string;
  toolCallId: string;
  args: Record<string, unknown>;
}

interface ThreadMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: unknown;
  toolInvocations?: ToolInvocation[];
  tool_calls?: unknown[];
  renderedComponent?: React.ReactNode;
}

function hasComponent(m: Partial<ThreadMessage>): boolean {
  return (
    !!m.renderedComponent ||
    (Array.isArray(m.tool_calls) && m.tool_calls.length > 0) ||
    (Array.isArray(m.toolInvocations) && m.toolInvocations.length > 0)
  );
}

function ToolRenderer({
  toolName,
  args,
}: {
  toolName: string;
  args: Record<string, unknown>;
}) {
  switch (toolName) {
    case "SummaryCard":
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return <SummaryCard {...(args as any)} />;
    case "DataTable":
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return <DataTable {...(args as any)} />;
    case "Graph":
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return <Graph {...(args as any)} />;
    default:
      return (
        <div className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
          Unknown component: {toolName}
        </div>
      );
  }
}
