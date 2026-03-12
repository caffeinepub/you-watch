import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { Lock, Upload } from "lucide-react";
import UploadForm from "../components/upload/UploadForm";
import { useAuthContext } from "../context/AuthContext";

export default function UploadPage() {
  const { isAuthenticated } = useAuthContext();

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
          <Lock className="w-8 h-8 text-muted-foreground" />
        </div>
        <h2 className="font-display font-bold text-2xl mb-2">Login Required</h2>
        <p className="text-muted-foreground mb-6 max-w-sm">
          You need to be logged in to upload videos and share content with the
          world.
        </p>
        <Link to="/auth">
          <Button
            className="brand-gradient text-primary-foreground rounded-full px-8"
            data-ocid="upload.primary_button"
          >
            Login to Upload
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 max-w-2xl mx-auto animate-fade-in">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl brand-gradient flex items-center justify-center">
          <Upload className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="font-display font-bold text-2xl">Upload Video</h1>
          <p className="text-sm text-muted-foreground">
            Share your content with the world
          </p>
        </div>
      </div>
      <UploadForm />
    </div>
  );
}
