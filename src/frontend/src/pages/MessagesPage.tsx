import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNavigate } from "@tanstack/react-router";
import {
  AlertTriangle,
  ArrowLeft,
  Check,
  CheckCheck,
  MessageCircle,
  Search,
  Send,
  SmilePlus,
  UserPlus,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import EmojiPicker from "../components/chat/EmojiPicker";
import VideoLinkPreview, {
  hasVideoLink,
} from "../components/chat/VideoLinkPreview";

interface Conversation {
  id: string;
  username: string;
  initials: string;
  lastMessage: string;
  time: string;
  unread: number;
  online: boolean;
}

interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
  status: "sent" | "delivered";
}

interface SearchUser {
  id: string;
  username: string;
  initials: string;
  followed: boolean;
}

function searchUsers(query: string): SearchUser[] {
  if (!query.trim()) return [];
  const q = query.toLowerCase().trim();
  const pool: SearchUser[] = [
    {
      id: "u1",
      username: `${q}_official`,
      initials: q.slice(0, 2).toUpperCase(),
      followed: false,
    },
    {
      id: "u2",
      username: `${q}tv`,
      initials: `${(q[0] ?? "U").toUpperCase()}T`,
      followed: false,
    },
    {
      id: "u3",
      username: `real_${q}`,
      initials: `R${(q[0] ?? "U").toUpperCase()}`,
      followed: true,
    },
    {
      id: "u4",
      username: `${q}123`,
      initials: q.slice(0, 2).toUpperCase(),
      followed: false,
    },
  ];
  return pool.filter((u) => u.username.includes(q));
}

export default function MessagesPage() {
  const navigate = useNavigate();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [inputText, setInputText] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const isRestricted = false;
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchUser[]>([]);
  const [followedUsers, setFollowedUsers] = useState<Set<string>>(new Set());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const activeConv = conversations.find((c) => c.id === activeConvId) ?? null;
  const activeMessages = activeConvId ? (messages[activeConvId] ?? []) : [];
  const videoLinkInInput = hasVideoLink(inputText) ? inputText : null;

  // biome-ignore lint/correctness/useExhaustiveDependencies: scroll triggered by message list changes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, activeConvId]);

  useEffect(() => {
    if (searchQuery.trim()) {
      setSearchResults(searchUsers(searchQuery));
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  function makeInitials(username: string): string {
    return (
      username
        .split(/[_\s]+/)
        .map((w) => w[0]?.toUpperCase() ?? "")
        .slice(0, 2)
        .join("") || username.slice(0, 2).toUpperCase()
    );
  }

  function handleOpenUserChat(user: SearchUser) {
    const existing = conversations.find(
      (c) => c.username.toLowerCase() === user.username.toLowerCase(),
    );
    if (existing) {
      setActiveConvId(existing.id);
      setSearchQuery("");
      return;
    }

    const newConv: Conversation = {
      id: `conv-${Date.now()}`,
      username: user.username,
      initials: user.initials || makeInitials(user.username),
      lastMessage: "",
      time: "now",
      unread: 0,
      online: false,
    };

    setConversations((prev) => [newConv, ...prev]);
    setMessages((prev) => ({ ...prev, [newConv.id]: [] }));
    setActiveConvId(newConv.id);
    setSearchQuery("");
  }

  function handleToggleFollow(userId: string, e: React.MouseEvent) {
    e.stopPropagation();
    setFollowedUsers((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) next.delete(userId);
      else next.add(userId);
      return next;
    });
    setSearchResults((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, followed: !u.followed } : u)),
    );
  }

  function handleSend() {
    if (!inputText.trim() || !activeConvId || isRestricted) return;

    const now = new Date();
    const timestamp = now.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
    const newMsg: Message = {
      id: `m${Date.now()}`,
      senderId: "me",
      text: inputText.trim(),
      timestamp,
      status: "sent",
    };

    setMessages((prev) => ({
      ...prev,
      [activeConvId]: [...(prev[activeConvId] ?? []), newMsg],
    }));

    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeConvId
          ? { ...c, lastMessage: inputText.trim(), time: "now" }
          : c,
      ),
    );

    setInputText("");
    setShowEmoji(false);

    setTimeout(() => {
      setMessages((prev) => ({
        ...prev,
        [activeConvId]: (prev[activeConvId] ?? []).map((m) =>
          m.id === newMsg.id ? { ...m, status: "delivered" } : m,
        ),
      }));
    }, 800);
  }

  function handleEmojiSelect(emoji: string) {
    setInputText((prev) => prev + emoji);
    inputRef.current?.focus();
  }

  function handleVideoLinkClick(url: string) {
    const match = url.match(/\/video\/([^/?#\s]+)/);
    if (match) navigate({ to: "/video/$id", params: { id: match[1] } });
  }

  const showSearch = searchQuery.trim().length > 0;

  return (
    <div className="flex h-[calc(100vh-4rem)] md:h-screen overflow-hidden bg-background">
      {/* LEFT: Conversation List */}
      <div
        className={`flex flex-col w-full md:w-80 shrink-0 border-r border-border ${
          activeConvId ? "hidden md:flex" : "flex"
        }`}
      >
        {/* Header */}
        <div className="px-4 py-3 border-b border-border shrink-0">
          <h1 className="text-lg font-semibold tracking-tight mb-3">
            Messages
          </h1>
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search users..."
              className="pl-9 h-9 bg-muted/50 border-muted text-sm"
              data-ocid="messages.search_input"
            />
          </div>
        </div>

        {/* Search Results */}
        {showSearch ? (
          <ScrollArea className="flex-1">
            {searchResults.length === 0 ? (
              <div
                className="flex flex-col items-center justify-center gap-2 py-12 text-muted-foreground text-sm"
                data-ocid="messages.search.empty_state"
              >
                <Search className="w-8 h-8 opacity-30" />
                <p>No users found for &quot;{searchQuery}&quot;</p>
              </div>
            ) : (
              <div className="py-1">
                {searchResults.map((user, idx) => {
                  const isFollowed =
                    user.followed || followedUsers.has(user.id);
                  return (
                    <button
                      key={user.id}
                      type="button"
                      onClick={() => handleOpenUserChat(user)}
                      data-ocid={`messages.search_result.item.${idx + 1}`}
                      className="w-full flex items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/50"
                    >
                      <Avatar className="w-10 h-10 shrink-0">
                        <AvatarFallback className="text-xs font-bold bg-primary/20 text-primary">
                          {user.initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0 text-left">
                        <p className="font-medium text-sm truncate">
                          @{user.username}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Tap to message
                        </p>
                      </div>
                      {!isFollowed && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 px-2 text-xs shrink-0 gap-1"
                          onClick={(e) => handleToggleFollow(user.id, e)}
                          data-ocid={`messages.follow_button.${idx + 1}`}
                        >
                          <UserPlus className="w-3 h-3" />
                          Follow
                        </Button>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        ) : conversations.length === 0 ? (
          <div
            className="flex-1 flex flex-col items-center justify-center gap-3 text-muted-foreground px-6 text-center"
            data-ocid="messages.empty_state"
          >
            <MessageCircle className="w-12 h-12 opacity-30" />
            <p className="font-medium text-foreground">No messages yet</p>
            <p className="text-sm">Search for a user above to start chatting</p>
          </div>
        ) : (
          <ScrollArea className="flex-1">
            <div className="py-1">
              {conversations.map((conv, idx) => (
                <button
                  key={conv.id}
                  type="button"
                  onClick={() => setActiveConvId(conv.id)}
                  data-ocid={`messages.conversation.item.${idx + 1}`}
                  className={`w-full flex items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/50 ${
                    activeConvId === conv.id ? "bg-muted" : ""
                  }`}
                >
                  <div className="relative shrink-0">
                    <Avatar className="w-10 h-10">
                      <AvatarFallback className="text-xs font-bold bg-primary/20 text-primary">
                        {conv.initials}
                      </AvatarFallback>
                    </Avatar>
                    {conv.online && (
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-green-500 ring-2 ring-background" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm truncate">
                        {conv.username}
                      </span>
                      <span className="text-[10px] text-muted-foreground ml-2 shrink-0">
                        {conv.time}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                      {conv.lastMessage || "No messages yet"}
                    </p>
                  </div>
                  {conv.unread > 0 && (
                    <Badge className="ml-1 h-5 min-w-5 px-1 text-[10px] shrink-0">
                      {conv.unread}
                    </Badge>
                  )}
                </button>
              ))}
            </div>
          </ScrollArea>
        )}
      </div>

      {/* RIGHT: Chat Screen */}
      {activeConvId && activeConv ? (
        <div className="flex flex-col flex-1 min-w-0">
          {/* Chat Header */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-border shrink-0">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden h-8 w-8"
              onClick={() => setActiveConvId(null)}
              data-ocid="messages.back_button"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="relative">
              <Avatar className="w-9 h-9">
                <AvatarFallback className="text-xs font-bold bg-primary/20 text-primary">
                  {activeConv.initials}
                </AvatarFallback>
              </Avatar>
              {activeConv.online && (
                <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-green-500 ring-2 ring-background" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm truncate">
                {activeConv.username}
              </p>
              <p className="text-[10px] text-muted-foreground">
                {activeConv.online ? "Online" : "Offline"}
              </p>
            </div>
          </div>

          {/* Restriction Banner */}
          {isRestricted && (
            <div
              data-ocid="messages.restriction_banner"
              className="flex items-center gap-2 px-4 py-2.5 bg-yellow-500/10 border-b border-yellow-500/30 text-yellow-600 dark:text-yellow-400 text-sm"
            >
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>
                Messaging temporarily restricted. Please follow community rules.
              </span>
            </div>
          )}

          {/* Message List */}
          <ScrollArea className="flex-1 px-4 py-4">
            <div className="flex flex-col gap-3">
              {activeMessages.length === 0 && (
                <div className="flex flex-col items-center justify-center gap-2 py-12 text-muted-foreground text-sm">
                  <MessageCircle className="w-8 h-8 opacity-30" />
                  <p>Say hello to {activeConv.username}!</p>
                </div>
              )}
              {activeMessages.map((msg) => {
                const isMine = msg.senderId === "me";
                const isVideoMsg = hasVideoLink(msg.text);
                return (
                  <div
                    key={msg.id}
                    className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`flex flex-col gap-1 max-w-[75%] ${isMine ? "items-end" : "items-start"}`}
                    >
                      {isVideoMsg ? (
                        <div className="w-64">
                          <VideoLinkPreview
                            url={msg.text}
                            onClick={() => handleVideoLinkClick(msg.text)}
                          />
                        </div>
                      ) : (
                        <div
                          className={`px-3 py-2 rounded-2xl text-sm leading-relaxed ${
                            isMine
                              ? "bg-primary text-primary-foreground rounded-br-sm"
                              : "bg-muted text-foreground rounded-bl-sm"
                          }`}
                        >
                          {msg.text}
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] text-muted-foreground">
                          {msg.timestamp}
                        </span>
                        {isMine &&
                          (msg.status === "delivered" ? (
                            <CheckCheck className="w-3 h-3 text-primary" />
                          ) : (
                            <Check className="w-3 h-3 text-muted-foreground" />
                          ))}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Input Area */}
          <div className="border-t border-border px-3 py-3 shrink-0 relative">
            {videoLinkInInput && (
              <div className="mb-2">
                <VideoLinkPreview
                  url={videoLinkInInput}
                  onRemove={() =>
                    setInputText((prev) =>
                      prev.replace(/https?:\/\/[^\s]*/g, "").trim(),
                    )
                  }
                  onClick={() => handleVideoLinkClick(videoLinkInInput)}
                />
              </div>
            )}

            {showEmoji && (
              <div className="absolute bottom-20 left-3 z-50 md:left-auto md:right-auto">
                <EmojiPicker onSelect={handleEmojiSelect} />
              </div>
            )}

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 shrink-0 text-muted-foreground hover:text-foreground"
                onClick={() => setShowEmoji((v) => !v)}
                data-ocid="messages.emoji_button"
                type="button"
              >
                <SmilePlus className="w-5 h-5" />
              </Button>

              <Input
                ref={inputRef}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Message..."
                disabled={isRestricted}
                className="flex-1 h-9 bg-muted/50 border-muted"
                data-ocid="messages.input"
              />

              <Button
                size="icon"
                className="h-9 w-9 shrink-0"
                disabled={!inputText.trim() || isRestricted}
                onClick={handleSend}
                data-ocid="messages.send_button"
                type="button"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="hidden md:flex flex-1 items-center justify-center flex-col gap-3 text-muted-foreground">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
            <MessageCircle className="w-7 h-7" />
          </div>
          <p className="font-medium">Select a conversation</p>
          <p className="text-sm">
            Search for a user or choose an existing chat
          </p>
        </div>
      )}
    </div>
  );
}
