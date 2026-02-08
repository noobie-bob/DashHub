"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { ChatThread } from "../chat/ChatThread";
import { ChatComposer } from "../chat/ChatComposer";
import { EventTimeline } from "../events/EventTimeline";
import { MessageSquare, FileBox, Server, Database, Clock } from "lucide-react";

export function Dock() {
  return (
    <div className="flex h-full flex-col bg-background">
      <Tabs id="dock-tabs" defaultValue="chat" className="flex h-full flex-col">
        {/* Tab List */}
        <div className="shrink-0 border-b border-border px-2">
          <TabsList variant="line" className="h-10">
            <TabsTrigger value="chat" className="gap-1.5">
              <MessageSquare className="h-3.5 w-3.5" />
              <span className="text-xs">Chat</span>
            </TabsTrigger>
            <TabsTrigger value="events" className="gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              <span className="text-xs">Events</span>
            </TabsTrigger>
            <TabsTrigger value="artifacts" className="gap-1.5" disabled>
              <FileBox className="h-3.5 w-3.5" />
              <span className="text-xs">Artifacts</span>
            </TabsTrigger>
            <TabsTrigger value="mcp" className="gap-1.5" disabled>
              <Server className="h-3.5 w-3.5" />
              <span className="text-xs">MCP</span>
            </TabsTrigger>
            <TabsTrigger value="db" className="gap-1.5" disabled>
              <Database className="h-3.5 w-3.5" />
              <span className="text-xs">DB</span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Chat Tab */}
        <TabsContent value="chat" className="flex flex-1 flex-col m-0 overflow-hidden">
          <div className="flex-1 overflow-auto">
            <ChatThread />
          </div>
          <div className="shrink-0 border-t border-border p-3">
            <ChatComposer />
          </div>
        </TabsContent>

        {/* Events Tab */}
        <TabsContent value="events" className="flex-1 m-0 overflow-auto">
          <EventTimeline />
        </TabsContent>

        {/* Placeholder tabs */}
        <TabsContent value="artifacts" className="flex-1 m-0">
          <div className="flex h-full items-center justify-center text-muted-foreground">
            Artifacts (Phase 2)
          </div>
        </TabsContent>
        <TabsContent value="mcp" className="flex-1 m-0">
          <div className="flex h-full items-center justify-center text-muted-foreground">
            MCP (Phase 6+)
          </div>
        </TabsContent>
        <TabsContent value="db" className="flex-1 m-0">
          <div className="flex h-full items-center justify-center text-muted-foreground">
            Database (Phase 5+)
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
