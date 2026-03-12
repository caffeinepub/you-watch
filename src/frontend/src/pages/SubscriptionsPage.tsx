import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { Bell, Compass, Lock } from "lucide-react";
import { useAuthContext } from "../context/AuthContext";

export default function SubscriptionsPage() {
  const { isAuthenticated } = useAuthContext();

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
          <Lock className="w-8 h-8 text-muted-foreground" />
        </div>
        <h2 className="font-display font-bold text-2xl mb-2">
          Login to See Subscriptions
        </h2>
        <p className="text-muted-foreground mb-6 max-w-sm">
          Subscribe to your favorite channels and never miss their latest
          content.
        </p>
        <Link to="/auth">
          <Button
            className="brand-gradient text-primary-foreground rounded-full px-8"
            data-ocid="subs.primary_button"
          >
            Login
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 max-w-screen-2xl mx-auto animate-fade-in">
      <div className="flex items-center gap-3 mb-8">
        <Bell className="w-6 h-6 text-primary" />
        <h1 className="font-display font-bold text-2xl">Subscriptions</h1>
      </div>

      <div
        className="flex flex-col items-center justify-center py-20 text-center"
        data-ocid="subs.empty_state"
      >
        <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center mb-4">
          <Bell className="w-10 h-10 text-muted-foreground" />
        </div>
        <h3 className="font-display font-bold text-xl mb-2">
          No subscriptions yet
        </h3>
        <p className="text-muted-foreground mb-6 max-w-sm">
          Explore channels and subscribe to see their latest videos here.
        </p>
        <Link to="/explore">
          <Button
            variant="outline"
            className="rounded-full gap-2"
            data-ocid="subs.secondary_button"
          >
            <Compass className="w-4 h-4" />
            Explore Channels
          </Button>
        </Link>
      </div>
    </div>
  );
}
