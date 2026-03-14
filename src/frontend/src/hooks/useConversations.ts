import { useCallback, useEffect, useState } from "react";

// ── Types ────────────────────────────────────────────────────────────────────
export interface StorySharePayload {
  storyId: string;
  username: string;
  type: "image" | "text";
  mediaDataUrl?: string;
  textContent?: string;
  textBg?: string;
}

export interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
  status: "sent" | "delivered";
  /** Optional story reply preview */
  storyPreview?: {
    username: string;
    type: "image" | "text";
    mediaDataUrl?: string;
    textContent?: string;
    textBg?: string;
  };
  /** Optional story share card */
  storyShare?: StorySharePayload;
}

export interface Conversation {
  id: string;
  userId: string;
  username: string;
  initials: string;
  lastMessage: string;
  time: string;
  unread: number;
  online: boolean;
}

// ── Storage keys ─────────────────────────────────────────────────────────────
const CONV_KEY = "yw_conversations";
const MSG_KEY = "yw_messages";

function loadConversations(): Conversation[] {
  try {
    return JSON.parse(localStorage.getItem(CONV_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function loadMessages(): Record<string, Message[]> {
  try {
    return JSON.parse(localStorage.getItem(MSG_KEY) ?? "{}");
  } catch {
    return {};
  }
}

function saveConversations(convs: Conversation[]) {
  localStorage.setItem(CONV_KEY, JSON.stringify(convs));
  window.dispatchEvent(new Event("yw_conv_update"));
}

function saveMessages(msgs: Record<string, Message[]>) {
  localStorage.setItem(MSG_KEY, JSON.stringify(msgs));
  window.dispatchEvent(new Event("yw_conv_update"));
}

function makeInitials(username: string): string {
  return (
    username
      .split(/[_\s]+/)
      .map((w) => w[0]?.toUpperCase() ?? "")
      .slice(0, 2)
      .join("") || username.slice(0, 2).toUpperCase()
  );
}

// ── Hook ─────────────────────────────────────────────────────────────────────
export function useConversations() {
  const [conversations, setConversations] =
    useState<Conversation[]>(loadConversations);
  const [messages, setMessages] =
    useState<Record<string, Message[]>>(loadMessages);

  useEffect(() => {
    const handler = () => {
      setConversations(loadConversations());
      setMessages(loadMessages());
    };
    window.addEventListener("yw_conv_update", handler);
    return () => window.removeEventListener("yw_conv_update", handler);
  }, []);

  const getOrCreateConversation = useCallback(
    (userId: string, username: string): Conversation => {
      const convs = loadConversations();
      const existing = convs.find((c) => c.userId === userId);
      if (existing) return existing;

      const newConv: Conversation = {
        id: `conv-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        userId,
        username,
        initials: makeInitials(username),
        lastMessage: "",
        time: "now",
        unread: 0,
        online: false,
      };
      const updated = [newConv, ...convs];
      saveConversations(updated);
      setConversations(updated);
      return newConv;
    },
    [],
  );

  const sendMessage = useCallback(
    (
      convId: string,
      text: string,
      storyPreview?: Message["storyPreview"],
      storyShare?: StorySharePayload,
    ) => {
      const now = new Date();
      const timestamp = now.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
      const newMsg: Message = {
        id: `m${Date.now()}-${Math.random().toString(36).slice(2)}`,
        senderId: "me",
        text,
        timestamp,
        status: "sent",
        ...(storyPreview ? { storyPreview } : {}),
        ...(storyShare ? { storyShare } : {}),
      };

      const allMsgs = loadMessages();
      const updated = {
        ...allMsgs,
        [convId]: [...(allMsgs[convId] ?? []), newMsg],
      };
      saveMessages(updated);
      setMessages(updated);

      const allConvs = loadConversations();
      const updatedConvs = allConvs.map((c) =>
        c.id === convId ? { ...c, lastMessage: text, time: "now" } : c,
      );
      saveConversations(updatedConvs);
      setConversations(updatedConvs);

      setTimeout(() => {
        const msgs2 = loadMessages();
        const updated2 = {
          ...msgs2,
          [convId]: (msgs2[convId] ?? []).map((m) =>
            m.id === newMsg.id ? { ...m, status: "delivered" as const } : m,
          ),
        };
        saveMessages(updated2);
        setMessages(updated2);
      }, 800);
    },
    [],
  );

  const updateConversations = useCallback((convs: Conversation[]) => {
    saveConversations(convs);
    setConversations(convs);
  }, []);

  return {
    conversations,
    messages,
    getOrCreateConversation,
    sendMessage,
    updateConversations,
    makeInitials,
  };
}
