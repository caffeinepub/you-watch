import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  History,
  Pause,
  Play,
  Search,
  ThumbsUp,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type WatchItem = {
  id: string;
  title: string;
  channel: string;
  watchedAt: string;
  thumb: string;
};
type SearchItem = { id: string; query: string; searchedAt: string };
type CommentItem = {
  id: string;
  text: string;
  videoTitle: string;
  commentedAt: string;
};
type LikeItem = { id: string; title: string; channel: string; likedAt: string };

const MOCK_WATCH: WatchItem[] = [
  {
    id: "1",
    title: "Building a Full-Stack App with React & Node.js",
    channel: "CodeWithMosh",
    watchedAt: "2 hours ago",
    thumb: "",
  },
  {
    id: "2",
    title: "The Art of Drone Photography",
    channel: "SkyFrames",
    watchedAt: "Yesterday",
    thumb: "",
  },
  {
    id: "3",
    title: "World's Hottest Chili Pepper Challenge",
    channel: "FoodDareTV",
    watchedAt: "2 days ago",
    thumb: "",
  },
  {
    id: "4",
    title: "How Microchips Are Made",
    channel: "Tech Insider",
    watchedAt: "3 days ago",
    thumb: "",
  },
  {
    id: "5",
    title: "Ultimate Tokyo Street Food Tour 2025",
    channel: "WanderEats",
    watchedAt: "5 days ago",
    thumb: "",
  },
  {
    id: "6",
    title: "Learn Piano in 30 Days – Day 1",
    channel: "PianoMaster",
    watchedAt: "1 week ago",
    thumb: "",
  },
];

const MOCK_SEARCH: SearchItem[] = [
  {
    id: "1",
    query: "how to edit 4K video on laptop",
    searchedAt: "1 hour ago",
  },
  { id: "2", query: "best vlog cameras 2025", searchedAt: "3 hours ago" },
  { id: "3", query: "react hooks tutorial", searchedAt: "Yesterday" },
  { id: "4", query: "lo-fi music for studying", searchedAt: "2 days ago" },
  { id: "5", query: "drone footage africa wildlife", searchedAt: "4 days ago" },
];

const MOCK_COMMENTS: CommentItem[] = [
  {
    id: "1",
    text: "This is exactly what I needed, thank you!",
    videoTitle: "Building a Full-Stack App",
    commentedAt: "5 hours ago",
  },
  {
    id: "2",
    text: "Great drone shots at 4:32, how did you do that?",
    videoTitle: "The Art of Drone Photography",
    commentedAt: "2 days ago",
  },
  {
    id: "3",
    text: "Subscribed! Can't wait for the next episode.",
    videoTitle: "Learn Piano in 30 Days – Day 1",
    commentedAt: "1 week ago",
  },
];

const MOCK_LIKES: LikeItem[] = [
  {
    id: "1",
    title: "Ultimate Tokyo Street Food Tour 2025",
    channel: "WanderEats",
    likedAt: "Yesterday",
  },
  {
    id: "2",
    title: "How Microchips Are Made",
    channel: "Tech Insider",
    likedAt: "3 days ago",
  },
  {
    id: "3",
    title: "Building a Full-Stack App with React & Node.js",
    channel: "CodeWithMosh",
    likedAt: "5 days ago",
  },
  {
    id: "4",
    title: "World's Hottest Chili Pepper Challenge",
    channel: "FoodDareTV",
    likedAt: "1 week ago",
  },
];

export default function HistoryPage() {
  const [watchHistory, setWatchHistory] = useState<WatchItem[]>([]);
  const [searchHistory, setSearchHistory] = useState<SearchItem[]>([]);
  const [commentHistory, setCommentHistory] = useState<CommentItem[]>([]);
  const [likeHistory, setLikeHistory] = useState<LikeItem[]>([]);
  const [watchPaused, setWatchPaused] = useState(false);
  const [clearOpen, setClearOpen] = useState(false);
  const [clearTarget, setClearTarget] = useState<string>("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const wh = localStorage.getItem("yw_watch_history");
    const sh = localStorage.getItem("yw_search_history");
    const ch = localStorage.getItem("yw_comment_history");
    const lh = localStorage.getItem("yw_like_history");
    setWatchHistory(wh ? JSON.parse(wh) : MOCK_WATCH);
    setSearchHistory(sh ? JSON.parse(sh) : MOCK_SEARCH);
    setCommentHistory(ch ? JSON.parse(ch) : MOCK_COMMENTS);
    setLikeHistory(lh ? JSON.parse(lh) : MOCK_LIKES);
    const paused = localStorage.getItem("yw_watch_paused");
    if (paused) setWatchPaused(paused === "true");
  }, []);

  const save = (key: string, data: unknown[]) => {
    if (typeof window !== "undefined")
      localStorage.setItem(key, JSON.stringify(data));
  };

  const deleteWatch = (id: string) => {
    setWatchHistory((p) => {
      const n = p.filter((i) => i.id !== id);
      save("yw_watch_history", n);
      return n;
    });
  };
  const deleteSearch = (id: string) => {
    setSearchHistory((p) => {
      const n = p.filter((i) => i.id !== id);
      save("yw_search_history", n);
      return n;
    });
  };
  const deleteComment = (id: string) => {
    setCommentHistory((p) => {
      const n = p.filter((i) => i.id !== id);
      save("yw_comment_history", n);
      return n;
    });
  };
  const deleteLike = (id: string) => {
    setLikeHistory((p) => {
      const n = p.filter((i) => i.id !== id);
      save("yw_like_history", n);
      return n;
    });
  };

  const toggleWatchPaused = () => {
    setWatchPaused((p) => {
      const next = !p;
      if (typeof window !== "undefined")
        localStorage.setItem("yw_watch_paused", String(next));
      toast(next ? "Watch history paused" : "Watch history resumed");
      return next;
    });
  };

  const confirmClear = () => {
    if (clearTarget === "watch") {
      setWatchHistory([]);
      save("yw_watch_history", []);
    }
    if (clearTarget === "search") {
      setSearchHistory([]);
      save("yw_search_history", []);
    }
    if (clearTarget === "comments") {
      setCommentHistory([]);
      save("yw_comment_history", []);
    }
    if (clearTarget === "likes") {
      setLikeHistory([]);
      save("yw_like_history", []);
    }
    setClearOpen(false);
    toast.success("History cleared");
  };

  const openClear = (target: string) => {
    setClearTarget(target);
    setClearOpen(true);
  };

  return (
    <div className="px-4 py-6 max-w-2xl mx-auto animate-fade-in">
      <div className="flex items-center gap-3 mb-8">
        <History className="w-6 h-6 text-primary" />
        <h1 className="font-display font-bold text-2xl">History</h1>
      </div>

      <Dialog open={clearOpen} onOpenChange={setClearOpen}>
        <DialogContent data-ocid="history.dialog">
          <DialogHeader>
            <DialogTitle>Clear History</DialogTitle>
            <DialogDescription>
              This will permanently remove all items from this history section.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setClearOpen(false)}
              data-ocid="history.cancel_button"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmClear}
              data-ocid="history.confirm_button"
            >
              Clear All
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Tabs defaultValue="watch">
        <TabsList className="grid grid-cols-4 w-full mb-6 bg-muted/50">
          <TabsTrigger value="watch" data-ocid="history.tab">
            Watch
          </TabsTrigger>
          <TabsTrigger value="search" data-ocid="history.tab">
            Search
          </TabsTrigger>
          <TabsTrigger value="comments" data-ocid="history.tab">
            Comments
          </TabsTrigger>
          <TabsTrigger value="likes" data-ocid="history.tab">
            Likes
          </TabsTrigger>
        </TabsList>

        {/* Watch History */}
        <TabsContent value="watch">
          <div className="flex gap-2 mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleWatchPaused}
              className="gap-2"
              data-ocid="history.toggle"
            >
              {watchPaused ? (
                <Play className="w-3.5 h-3.5" />
              ) : (
                <Pause className="w-3.5 h-3.5" />
              )}
              {watchPaused ? "Resume History" : "Pause History"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => openClear("watch")}
              className="gap-2 text-destructive border-destructive/30 hover:bg-destructive/10"
              data-ocid="history.delete_button"
            >
              <Trash2 className="w-3.5 h-3.5" /> Clear All
            </Button>
          </div>
          {watchPaused && (
            <div className="mb-4 px-3 py-2 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-sm">
              Watch history is paused. New videos won't be saved.
            </div>
          )}
          {watchHistory.length === 0 ? (
            <div
              className="text-center py-12 text-muted-foreground"
              data-ocid="history.empty_state"
            >
              <History className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p>No watch history yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {watchHistory.map((item, idx) => (
                <div
                  key={item.id}
                  className="flex gap-3 items-center rounded-xl bg-card border border-border p-3 group"
                  data-ocid={`history.item.${idx + 1}`}
                >
                  <div className="w-20 h-12 rounded-lg bg-muted flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.channel} · {item.watchedAt}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => deleteWatch(item.id)}
                    className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all"
                    data-ocid={`history.delete_button.${idx + 1}`}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Search History */}
        <TabsContent value="search">
          <div className="flex gap-2 mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => openClear("search")}
              className="gap-2 text-destructive border-destructive/30 hover:bg-destructive/10"
              data-ocid="history.delete_button"
            >
              <Trash2 className="w-3.5 h-3.5" /> Clear All
            </Button>
          </div>
          {searchHistory.length === 0 ? (
            <div
              className="text-center py-12 text-muted-foreground"
              data-ocid="history.empty_state"
            >
              <Search className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p>No search history</p>
            </div>
          ) : (
            <div className="space-y-2">
              {searchHistory.map((item, idx) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 rounded-lg bg-card border border-border px-4 py-3 group"
                  data-ocid={`history.item.${idx + 1}`}
                >
                  <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">{item.query}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.searchedAt}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => deleteSearch(item.id)}
                    className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all"
                    data-ocid={`history.delete_button.${idx + 1}`}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Comment History */}
        <TabsContent value="comments">
          <div className="flex gap-2 mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => openClear("comments")}
              className="gap-2 text-destructive border-destructive/30 hover:bg-destructive/10"
              data-ocid="history.delete_button"
            >
              <Trash2 className="w-3.5 h-3.5" /> Clear All
            </Button>
          </div>
          {commentHistory.length === 0 ? (
            <div
              className="text-center py-12 text-muted-foreground"
              data-ocid="history.empty_state"
            >
              <p>No comment history</p>
            </div>
          ) : (
            <div className="space-y-3">
              {commentHistory.map((item, idx) => (
                <div
                  key={item.id}
                  className="rounded-xl bg-card border border-border p-4 group relative"
                  data-ocid={`history.item.${idx + 1}`}
                >
                  <p className="text-sm mb-1">{item.text}</p>
                  <p className="text-xs text-muted-foreground">
                    On: {item.videoTitle} · {item.commentedAt}
                  </p>
                  <button
                    type="button"
                    onClick={() => deleteComment(item.id)}
                    className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all"
                    data-ocid={`history.delete_button.${idx + 1}`}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Like History */}
        <TabsContent value="likes">
          <div className="flex gap-2 mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => openClear("likes")}
              className="gap-2 text-destructive border-destructive/30 hover:bg-destructive/10"
              data-ocid="history.delete_button"
            >
              <Trash2 className="w-3.5 h-3.5" /> Clear All
            </Button>
          </div>
          {likeHistory.length === 0 ? (
            <div
              className="text-center py-12 text-muted-foreground"
              data-ocid="history.empty_state"
            >
              <ThumbsUp className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p>No liked videos yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {likeHistory.map((item, idx) => (
                <div
                  key={item.id}
                  className="flex gap-3 items-center rounded-xl bg-card border border-border p-3 group"
                  data-ocid={`history.item.${idx + 1}`}
                >
                  <div className="w-20 h-12 rounded-lg bg-muted flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.channel} · {item.likedAt}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => deleteLike(item.id)}
                    className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all"
                    data-ocid={`history.delete_button.${idx + 1}`}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
