import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  Forward,
  MessageCircle,
  Search,
  Send,
  SmilePlus,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import EmojiPicker from "../components/chat/EmojiPicker";
import VideoLinkPreview, {
  hasVideoLink,
} from "../components/chat/VideoLinkPreview";
import {
  type Story,
  StoryViewerModal,
  loadStories,
  saveStories,
} from "../components/stories/StoriesRow";
import { useAuthContext } from "../context/AuthContext";
import { useConversations } from "../hooks/useConversations";
import { useStorage } from "../hooks/useStorage";

interface SearchUser {
  id: string;
  username: string;
  initials: string;
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

function searchUsersLocal(query: string): SearchUser[] {
  if (!query.trim()) return [];
  const q = query.toLowerCase().trim();
  return [
    {
      id: `search-${q}-1`,
      username: `${q}_user`,
      initials: makeInitials(`${q}_user`),
    },
  ].filter((u) => u.username.toLowerCase().includes(q));
}

export default function MessagesPage() {
  const navigate = useNavigate();
  const { userProfile } = useAuthContext();
  const { getBlobUrl } = useStorage();
  const { conversations, messages, getOrCreateConversation, sendMessage } =
    useConversations();

  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [inputText, setInputText] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const isRestricted = false;
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchUser[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Story viewer state
  const [storyViewerStories, setStoryViewerStories] = useState<Story[]>([]);
  const [storyViewerIndex, setStoryViewerIndex] = useState<number>(0);
  const [showStoryViewer, setShowStoryViewer] = useState(false);
  const [storyExpiredMsg, setStoryExpiredMsg] = useState(false);

  const activeConv = conversations.find((c) => c.id === activeConvId) ?? null;
  const activeMessages = activeConvId ? (messages[activeConvId] ?? []) : [];
  const videoLinkInInput = hasVideoLink(inputText) ? inputText : null;

  const myAvatarUrl = userProfile?.avatarBlobId
    ? getBlobUrl(userProfile.avatarBlobId)
    : "";
  const myInitial = (userProfile?.displayName ?? userProfile?.username ?? "U")
    .charAt(0)
    .toUpperCase();

  // biome-ignore lint/correctness/useExhaustiveDependencies: scroll triggered by message list changes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, activeConvId]);

  useEffect(() => {
    if (searchQuery.trim()) {
      setSearchResults(searchUsersLocal(searchQuery));
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  function handleOpenUserChat(user: SearchUser) {
    const conv = getOrCreateConversation(user.id, user.username);
    setActiveConvId(conv.id);
    setSearchQuery("");
  }

  function handleSend() {
    if (!inputText.trim() || !activeConvId || isRestricted) return;
    sendMessage(activeConvId, inputText.trim());
    setInputText("");
    setShowEmoji(false);
  }

  function handleEmojiSelect(emoji: string) {
    setInputText((prev) => prev + emoji);
    inputRef.current?.focus();
  }

  function handleVideoLinkClick(url: string) {
    const match = url.match(/\/video\/([^/?#\s]+)/);
    if (match) navigate({ to: "/video/$id", params: { id: match[1] } });
  }

  function handleStoryPreviewTap(storyId?: string) {
    const allStories = loadStories();
    if (!storyId) {
      showExpiredToast();
      return;
    }
    const found = allStories.find((s) => s.id === storyId);
    if (!found || found.expiresAt <= Date.now()) {
      showExpiredToast();
      return;
    }
    // Find the group of stories for this user
    const userStories = allStories.filter((s) => s.userId === found.userId);
    const idx = userStories.findIndex((s) => s.id === storyId);
    setStoryViewerStories(userStories);
    setStoryViewerIndex(idx >= 0 ? idx : 0);
    setShowStoryViewer(true);
  }

  function showExpiredToast() {
    setStoryExpiredMsg(true);
    setTimeout(() => setStoryExpiredMsg(false), 3000);
  }

  const showSearch = searchQuery.trim().length > 0;

  const currentUserId = userProfile?.username ?? "me";
  const currentUsername = userProfile?.username ?? "me";

  return (
    <div className="flex h-[calc(100vh-4rem)] md:h-screen overflow-hidden bg-background">
      {/* Story expired toast */}
      {storyExpiredMsg && (
        <div
          className="fixed top-16 left-1/2 -translate-x-1/2 z-[60] bg-zinc-900 text-white text-sm px-4 py-2 rounded-full shadow-lg pointer-events-none"
          data-ocid="messages.story_expired.toast"
        >
          Story no longer available
        </div>
      )}

      {/* Story viewer */}
      {showStoryViewer && storyViewerStories.length > 0 && (
        <StoryViewerModal
          stories={storyViewerStories}
          startIndex={storyViewerIndex}
          currentUserId={currentUserId}
          currentUsername={currentUsername}
          onClose={() => setShowStoryViewer(false)}
          onStoriesUpdate={(updated) => {
            setStoryViewerStories(
              updated.filter((s) => s.expiresAt > Date.now()),
            );
            saveStories(updated);
          }}
        />
      )}

      {/* LEFT: Conversation List */}
      <div
        className={`flex flex-col w-full md:w-80 shrink-0 border-r border-border ${
          activeConvId ? "hidden md:flex" : "flex"
        }`}
      >
        <div className="px-4 py-3 border-b border-border shrink-0">
          <h1 className="text-lg font-semibold tracking-tight mb-3">
            Messages
          </h1>
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

        {showSearch ? (
          <ScrollArea className="flex-1">
            {searchResults.length === 0 ? (
              <div
                className="flex flex-col items-center justify-center gap-2 py-12 text-muted-foreground text-sm"
                data-ocid="messages.search.empty_state"
              >
                <Search className="w-8 h-8 opacity-30" />
                <p>No users found</p>
              </div>
            ) : (
              <div className="py-1">
                {searchResults.map((user, idx) => (
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
                  </button>
                ))}
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

          {isRestricted && (
            <div
              data-ocid="messages.restriction_banner"
              className="flex items-center gap-2 px-4 py-2.5 bg-yellow-500/10 border-b border-yellow-500/30 text-yellow-600 dark:text-yellow-400 text-sm"
            >
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>Messaging temporarily restricted.</span>
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
                const isVideoMsg = hasVideoLink(msg.text) && !msg.storyShare;
                return (
                  <div
                    key={msg.id}
                    className={`flex items-end gap-1.5 ${
                      isMine ? "justify-end" : "justify-start"
                    }`}
                  >
                    {isMine && (
                      <div className="order-last shrink-0 self-end">
                        <Avatar className="w-7 h-7">
                          {myAvatarUrl ? (
                            <AvatarImage
                              src={myAvatarUrl}
                              alt="Me"
                              className="object-cover"
                            />
                          ) : null}
                          <AvatarFallback className="text-[10px] font-bold bg-primary/20 text-primary">
                            {myInitial}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                    )}
                    {!isMine && (
                      <div className="shrink-0 self-end">
                        <Avatar className="w-7 h-7">
                          <AvatarFallback className="text-[10px] font-bold bg-muted text-muted-foreground">
                            {activeConv.initials.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                    )}

                    <div
                      className={`flex flex-col gap-1 max-w-[70%] ${isMine ? "items-end" : "items-start"}`}
                    >
                      {/* Story reply preview — tappable */}
                      {msg.storyPreview && (
                        <button
                          type="button"
                          onClick={() =>
                            handleStoryPreviewTap(msg.storyPreview?.storyId)
                          }
                          className="flex items-center gap-2 bg-muted/60 border border-border rounded-xl px-3 py-2 mb-1 max-w-full hover:bg-muted/80 active:scale-95 transition-all cursor-pointer text-left"
                          data-ocid="messages.story_preview.button"
                        >
                          {msg.storyPreview.type === "image" &&
                          msg.storyPreview.mediaDataUrl ? (
                            <img
                              src={msg.storyPreview.mediaDataUrl}
                              alt="story"
                              className="w-8 h-8 rounded-md object-cover flex-shrink-0"
                            />
                          ) : (
                            <div
                              className="w-8 h-8 rounded-md flex-shrink-0"
                              style={{
                                background:
                                  msg.storyPreview.textBg || "#1a1a2e",
                              }}
                            />
                          )}
                          <p className="text-xs text-muted-foreground truncate">
                            Replied to{" "}
                            <span className="font-semibold text-foreground">
                              @{msg.storyPreview.username}
                            </span>
                            's story
                          </p>
                        </button>
                      )}

                      {/* Story share card */}
                      {msg.storyShare && (
                        <div
                          className={`rounded-2xl overflow-hidden border border-border ${
                            isMine ? "rounded-br-sm" : "rounded-bl-sm"
                          }`}
                          data-ocid="messages.story_share.card"
                        >
                          {/* Story thumbnail */}
                          <div className="w-48 h-28 relative bg-muted">
                            {msg.storyShare.type === "image" &&
                            msg.storyShare.mediaDataUrl ? (
                              <img
                                src={msg.storyShare.mediaDataUrl}
                                alt="story"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div
                                className="w-full h-full flex items-center justify-center p-3"
                                style={{
                                  background:
                                    msg.storyShare.textBg || "#1a1a2e",
                                }}
                              >
                                <p className="text-white text-xs font-bold text-center leading-snug line-clamp-3">
                                  {msg.storyShare.textContent}
                                </p>
                              </div>
                            )}
                            {/* Story badge */}
                            <div className="absolute top-1.5 left-1.5 flex items-center gap-1 bg-black/60 backdrop-blur-sm rounded-full px-2 py-0.5">
                              <Forward className="w-3 h-3 text-white" />
                              <span className="text-white text-[10px] font-medium">
                                Story
                              </span>
                            </div>
                          </div>
                          <div
                            className={`px-3 py-2 text-xs ${
                              isMine
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted text-foreground"
                            }`}
                          >
                            <p className="font-semibold">
                              @{msg.storyShare.username}'s story
                            </p>
                            <p className="opacity-70 mt-0.5">Tap to view</p>
                          </div>
                        </div>
                      )}

                      {/* Regular message / video link (only when not a story share) */}
                      {!msg.storyShare &&
                        (isVideoMsg ? (
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
                        ))}

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
              <div className="absolute bottom-20 left-3 z-50 md:left-auto">
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
