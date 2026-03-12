import { Button } from "@/components/ui/button";
import { useNavigate } from "@tanstack/react-router";
import { Bell, Heart, Loader2, Play, Upload } from "lucide-react";
import { useEffect } from "react";
import { useAuthContext } from "../context/AuthContext";

const FEATURES = [
  { icon: Upload, text: "Upload & share videos" },
  { icon: Heart, text: "Like and save content" },
  { icon: Bell, text: "Subscribe to creators" },
  { icon: Play, text: "Personalized feed" },
];

export default function AuthPage() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoggingIn, login } = useAuthContext();

  useEffect(() => {
    if (isAuthenticated) {
      navigate({ to: "/" });
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-10">
          <h1 className="font-display font-black text-5xl tracking-tight mb-2">
            <span className="text-brand">YOU</span>
            <span className="text-foreground"> WATCH</span>
          </h1>
          <p className="text-muted-foreground">
            The decentralized video platform
          </p>
        </div>

        {/* Card */}
        <div className="bg-card border border-border rounded-2xl p-8 shadow-2xl">
          <h2 className="font-display font-bold text-2xl mb-2 text-center">
            Welcome
          </h2>
          <p className="text-muted-foreground text-sm text-center mb-8">
            Sign in with Internet Identity to access all features
          </p>

          {/* Features list */}
          <div className="space-y-3 mb-8">
            {FEATURES.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3 text-sm">
                <div className="w-8 h-8 rounded-lg brand-gradient flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <span className="text-foreground/80">{text}</span>
              </div>
            ))}
          </div>

          <Button
            onClick={login}
            disabled={isLoggingIn}
            size="lg"
            className="w-full brand-gradient text-primary-foreground font-bold text-base rounded-xl"
            data-ocid="auth.primary_button"
          >
            {isLoggingIn ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Signing in...
              </>
            ) : (
              "Sign in with Internet Identity"
            )}
          </Button>

          <p className="text-xs text-muted-foreground text-center mt-4">
            Secured by the Internet Computer. No passwords needed.
          </p>
        </div>

        {/* Footer */}
        <p className="text-xs text-muted-foreground text-center mt-6">
          &copy; {new Date().getFullYear()}. Built with love using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            caffeine.ai
          </a>
        </p>
      </div>
    </div>
  );
}
