import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Edit, FileVideo, Trash2, Upload } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type Draft = {
  id: string;
  title: string;
  lastEdited: string;
  progress: number;
  status: "Draft";
};

export default function DraftsPage() {
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setMounted(true);
    const stored = localStorage.getItem("yw_drafts");
    if (stored) {
      try {
        setDrafts(JSON.parse(stored));
      } catch {
        setDrafts([]);
      }
    } else {
      setDrafts([]);
    }
  }, []);

  const saveDrafts = (updated: Draft[]) => {
    setDrafts(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("yw_drafts", JSON.stringify(updated));
    }
  };

  const handleDelete = (id: string) => {
    saveDrafts(drafts.filter((d) => d.id !== id));
    setDeleteId(null);
    toast.success("Draft deleted");
  };

  const handleContinue = (_id: string) => {
    toast("Resuming upload... (connect to upload system)");
  };

  const handleEdit = (_id: string) => {
    toast("Opening draft editor...");
  };

  return (
    <div className="px-4 py-6 max-w-2xl mx-auto animate-fade-in">
      <div className="flex items-center gap-3 mb-2">
        <FileVideo className="w-6 h-6 text-primary" />
        <h1 className="font-display font-bold text-2xl">My Draft Videos</h1>
      </div>
      <p className="text-xs text-muted-foreground mb-6">
        Drafts are automatically deleted after 365 days if not published.
      </p>

      <Dialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <DialogContent data-ocid="drafts.dialog">
          <DialogHeader>
            <DialogTitle>Delete Draft</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this draft? This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteId(null)}
              data-ocid="drafts.cancel_button"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteId && handleDelete(deleteId)}
              data-ocid="drafts.confirm_button"
            >
              Delete Draft
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {!mounted ? (
        <div
          className="text-center py-12 text-muted-foreground"
          data-ocid="drafts.loading_state"
        >
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p>Loading drafts...</p>
        </div>
      ) : drafts.length === 0 ? (
        <div
          className="text-center py-16 text-muted-foreground"
          data-ocid="drafts.empty_state"
        >
          <FileVideo className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p className="font-medium">No draft videos</p>
          <p className="text-sm mt-1">
            Start uploading a video and save it as a draft to continue later.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {drafts.map((draft, idx) => (
            <div
              key={draft.id}
              className="rounded-xl border border-border bg-card p-4"
              data-ocid={`drafts.item.${idx + 1}`}
            >
              <div className="flex gap-4 items-start">
                <div className="w-24 h-14 rounded-lg bg-muted flex-shrink-0 flex items-center justify-center">
                  <FileVideo className="w-6 h-6 text-muted-foreground/40" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <p className="font-medium text-sm leading-tight">
                      {draft.title}
                    </p>
                    <Badge
                      variant="secondary"
                      className="flex-shrink-0 text-xs"
                    >
                      Draft
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mb-3">
                    Last edited {draft.lastEdited}
                  </p>
                  <div className="space-y-1 mb-3">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Upload progress</span>
                      <span>{draft.progress}%</span>
                    </div>
                    <Progress value={draft.progress} className="h-1.5" />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleContinue(draft.id)}
                      className="gap-1.5 brand-gradient text-primary-foreground"
                      data-ocid={`drafts.primary_button.${idx + 1}`}
                    >
                      <Upload className="w-3.5 h-3.5" /> Continue Upload
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(draft.id)}
                      className="gap-1.5"
                      data-ocid={`drafts.edit_button.${idx + 1}`}
                    >
                      <Edit className="w-3.5 h-3.5" /> Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setDeleteId(draft.id)}
                      className="gap-1.5 text-destructive border-destructive/30 hover:bg-destructive/10"
                      data-ocid={`drafts.delete_button.${idx + 1}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
