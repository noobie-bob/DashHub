"use client";

import { useTamboThread } from "@tambo-ai/react";
import { User, Bot, Loader2 } from "lucide-react";
import { useEffect, useRef } from "react";
import { z } from "zod";
import { useStore } from "@/lib/store";
import { SummaryCard } from "@/components/tambo/SummaryCard";
import { DataTableTool } from "@/components/tambo/DataTable";
import { Graph } from "@/components/tambo/Graph";
import { DataTableSchema, GraphSchema, SummaryCardSchema } from "@/lib/schemas";
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
  const eventsRef = useRef(state.events);

  // Keep `state.events` out of the message-processing effect deps.
  // Recording events updates `state.events` and would otherwise cause extra reruns.
  useEffect(() => {
    eventsRef.current = state.events;
  }, [state.events]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [thread?.messages]);

  // Record events when messages change
  useEffect(() => {
    const messages = thread?.messages || [];
    const typedMessages = messages as ThreadMessage[];
    const isGenerationSettled =
      generationStage === "IDLE" ||
      generationStage === "COMPLETE" ||
      generationStage === "ERROR";

    const existingEvents = eventsRef.current;
    const sentMessageIdsInEvents = new Set<string>();
    const receivedMessageIdsInEvents = new Set<string>();
    const sentMessageIdsRecordedThisRun = new Set<string>();
    const receivedMessageIdsRecordedThisRun = new Set<string>();

    for (const e of existingEvents) {
      const messageIds = e.refs?.messageIds;
      if (!Array.isArray(messageIds) || messageIds.length === 0) continue;

      if (e.kind === "message.sent") {
        for (const id of messageIds) sentMessageIdsInEvents.add(id);
      }

      if (e.kind === "message.received") {
        for (const id of messageIds) receivedMessageIdsInEvents.add(id);
      }
    }

    function hasSentEventForMessageId(messageId: string): boolean {
      return sentMessageIdsInEvents.has(messageId) || sentMessageIdsRecordedThisRun.has(messageId);
    }

    function hasReceivedEventForMessageId(messageId: string): boolean {
      return (
        receivedMessageIdsInEvents.has(messageId) ||
        receivedMessageIdsRecordedThisRun.has(messageId)
      );
    }

    if (threadId !== lastThreadIdRef.current) {
      lastThreadIdRef.current = threadId;
      seenMessageIdsRef.current = new Set();
      pendingAssistantMessageIdsRef.current = new Set();
    }

    if (isGenerationSettled && pendingAssistantMessageIdsRef.current.size > 0) {
      const messagesById = new Map(typedMessages.map((m) => [m.id, m] as const));
      const messageIndexById = new Map(typedMessages.map((m, i) => [m.id, i] as const));

      for (const id of Array.from(pendingAssistantMessageIdsRef.current)) {
        if (hasReceivedEventForMessageId(id)) {
          pendingAssistantMessageIdsRef.current.delete(id);
          continue;
        }

        const msg = messagesById.get(id);
        if (!msg) {
          pendingAssistantMessageIdsRef.current.delete(id);
          continue;
        }

        const msgIndex = messageIndexById.get(msg.id);
        if (msgIndex != null && isRedundantAssistantTextOnlyMessage(typedMessages, msgIndex)) {
          pendingAssistantMessageIdsRef.current.delete(id);
          continue;
        }

        const contentText = getMessageText(msg.content);
        if (!contentText) {
          pendingAssistantMessageIdsRef.current.delete(id);
          continue;
        }

        recordEvent(
          "message.received",
          { outputs: contentText },
          { messageIds: [msg.id] }
        );

        receivedMessageIdsRecordedThisRun.add(msg.id);
        pendingAssistantMessageIdsRef.current.delete(id);
      }
    }

    for (let i = 0; i < typedMessages.length; i++) {
      const msg = typedMessages[i];
      if (seenMessageIdsRef.current.has(msg.id)) continue;

      if (isRedundantAssistantTextOnlyMessage(typedMessages, i)) {
        seenMessageIdsRef.current.add(msg.id);
        continue;
      }

      // Double check store to prevent duplication on remount (tab switch)
      const hasSentEvent = hasSentEventForMessageId(msg.id);
      const hasReceivedEvent = hasReceivedEventForMessageId(msg.id);

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
        sentMessageIdsRecordedThisRun.add(msg.id);
      } else if (msg.role === "assistant" && !hasReceivedEvent) {
        recordEvent(
          "message.received",
          { outputs: contentText },
          { messageIds: [msg.id] }
        );
        receivedMessageIdsRecordedThisRun.add(msg.id);
      }

      seenMessageIdsRef.current.add(msg.id);
      pendingAssistantMessageIdsRef.current.delete(msg.id);
    }
  }, [threadId, thread?.messages, generationStage, recordEvent]);

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
        (messages as ThreadMessage[]).map((msg: ThreadMessage, index: number) => {
          const textContent = getMessageText(msg.content);

          if (isRedundantAssistantTextOnlyMessage(messages as ThreadMessage[], index)) {
            return null;
          }

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
                    msg.tool_calls.map((toolCall: unknown, toolCallIndex: number) => {
                      const tc =
                        toolCall && typeof toolCall === "object"
                          ? (toolCall as Record<string, unknown>)
                          : null;

                      const id =
                        (tc?.id && typeof tc.id === "string" ? tc.id : null) ??
                        `${msg.id}-tool-call-${toolCallIndex}`;

                      const fn =
                        tc?.function && typeof tc.function === "object"
                          ? (tc.function as Record<string, unknown>)
                          : null;

                      const name = fn?.name;
                      const rawArguments = fn?.arguments;
                      if (typeof name !== "string" || name.length === 0) return null;

                      const argsResult = parseToolArguments(rawArguments);
                      if (!argsResult.ok) {
                        return (
                          <div key={id} className="mt-2">
                            <InvalidToolArguments
                              toolName={name}
                              detail={argsResult.error}
                            />
                          </div>
                        );
                      }

                      return (
                        <div key={id} className="mt-2">
                          <ToolRenderer toolName={name} args={argsResult.args} />
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
  args: unknown;
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

const DataTableLegacyArgsSchema = z.object({
  title: z.string(),
  columns: z.array(
    z.object({
      key: z.string(),
      label: z.string(),
    })
  ),
  rows: z.array(z.record(z.unknown())),
  maxRows: z.number().optional(),
});

function ToolRenderer({
  toolName,
  args,
}: {
  toolName: string;
  args: unknown;
}) {
  switch (toolName) {
    case "SummaryCard":
      return renderValidatedTool(toolName, SummaryCardSchema, args, (validatedArgs) => (
        <SummaryCard {...validatedArgs} />
      ));
    case "DataTable":
      return renderDataTable(toolName, args);
    case "Graph":
      return renderValidatedTool(toolName, GraphSchema, args, (validatedArgs) => (
        <Graph {...validatedArgs} />
      ));
    default:
      return (
        <div className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
          Unknown component: {toolName}
        </div>
      );
  }
}

function renderDataTable(toolName: string, args: unknown) {
  const primary = DataTableSchema.safeParse(args);
  if (primary.success) {
    return <DataTableTool {...primary.data} />;
  }

  const legacy = DataTableLegacyArgsSchema.safeParse(args);
  if (legacy.success) {
    return <DataTableTool {...legacy.data} />;
  }

  return <InvalidToolArguments toolName={toolName} detail={formatZodError(primary.error)} />;
}

function InvalidToolArguments({ toolName, detail }: { toolName: string; detail: string }) {
  return (
    <div className="rounded-md border border-dashed bg-muted/10 p-4 text-sm">
      <p className="font-medium">Unable to render {toolName}</p>
      <p className="mt-1 text-muted-foreground">{detail}</p>
    </div>
  );
}

function parseToolArguments(
  rawArguments: unknown
): { ok: true; args: unknown } | { ok: false; error: string } {
  if (rawArguments == null) {
    return { ok: false, error: "Tool arguments were missing." };
  }

  if (typeof rawArguments === "string") {
    try {
      return { ok: true, args: JSON.parse(rawArguments) };
    } catch {
      return { ok: false, error: "Tool arguments were not valid JSON." };
    }
  }

  if (typeof rawArguments === "object") {
    if (Array.isArray(rawArguments)) {
      return { ok: false, error: "Tool arguments must be an object, not an array." };
    }

    return { ok: true, args: rawArguments };
  }

  return { ok: false, error: "Tool arguments had an unexpected type." };
}

function renderValidatedTool<TSchema extends z.ZodTypeAny>(
  toolName: string,
  schema: TSchema,
  args: unknown,
  render: (validatedArgs: z.infer<TSchema>) => React.ReactNode
) {
  const result = schema.safeParse(args);

  if (!result.success) {
    return <InvalidToolArguments toolName={toolName} detail={formatZodError(result.error)} />;
  }

  return render(result.data);
}

function formatZodError(error: z.ZodError): string {
  const [first, ...rest] = error.issues;
  if (!first) return "Invalid tool arguments.";

  const path = first.path.length > 0 ? first.path.join(".") : "args";
  const extraCount = rest.length;

  return extraCount > 0
    ? `${path}: ${first.message} (+${extraCount} more)`
    : `${path}: ${first.message}`;
}

function getPreviousAssistantMessage(
  messages: ThreadMessage[],
  index: number
): ThreadMessage | null {
  for (let i = index - 1; i >= 0; i--) {
    const prev = messages[i];
    if (prev.role === "assistant") return prev;
    if (prev.role === "user") return null;
  }

  return null;
}

function isRedundantAssistantTextOnlyMessage(
  messages: ThreadMessage[],
  index: number
): boolean {
  const msg = messages[index];
  if (!msg || msg.role !== "assistant") return false;
  if (hasComponent(msg)) return false;

  const prevAssistant = getPreviousAssistantMessage(messages, index);
  return prevAssistant != null && hasComponent(prevAssistant);
}
