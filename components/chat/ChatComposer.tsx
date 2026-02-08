"use client";

import { useTamboThreadInput } from "@tambo-ai/react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Send, Loader2 } from "lucide-react";
import { useCallback } from "react";

export function ChatComposer() {
  const { value, setValue, submit, isPending } = useTamboThreadInput();

  const submitIfAllowed = useCallback(() => {
    if (!value.trim() || isPending) return;
    submit({ streamResponse: true });
  }, [value, isPending, submit]);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      submitIfAllowed();
    },
    [submitIfAllowed]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key !== "Enter" || e.shiftKey) return;

      e.preventDefault();
      submitIfAllowed();
    },
    [submitIfAllowed]
  );

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type a message..."
        disabled={isPending}
        className="flex-1"
      />
      <Button type="submit" size="icon" disabled={!value.trim() || isPending}>
        {isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Send className="h-4 w-4" />
        )}
      </Button>
    </form>
  );
}
