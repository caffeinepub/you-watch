import { Button } from "@/components/ui/button";
import type { Principal } from "@icp-sdk/core/principal";
import { useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useAuthContext } from "../../context/AuthContext";
import { useIsSubscribed, useSubscribe } from "../../hooks/useChannel";

interface SubscribeButtonProps {
  channelOwnerId: Principal;
}

export default function SubscribeButton({
  channelOwnerId,
}: SubscribeButtonProps) {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthContext();
  const { data: isSubscribed, isLoading: checkLoading } = useIsSubscribed(
    isAuthenticated ? channelOwnerId : null,
  );
  const { mutate: toggleSubscribe, isPending } = useSubscribe();

  const handleClick = () => {
    if (!isAuthenticated) {
      navigate({ to: "/auth" });
      return;
    }
    toggleSubscribe({ channelOwnerId, isSubscribed: !!isSubscribed });
  };

  if (checkLoading) {
    return (
      <Button disabled variant="outline" className="rounded-full">
        <Loader2 className="w-4 h-4 animate-spin" />
      </Button>
    );
  }

  return (
    <Button
      onClick={handleClick}
      disabled={isPending}
      variant={isSubscribed ? "outline" : "default"}
      className={`rounded-full font-semibold ${
        isSubscribed
          ? "border-border text-foreground"
          : "brand-gradient text-primary-foreground"
      }`}
      data-ocid="channel.subscribe_button"
    >
      {isPending ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : isSubscribed ? (
        "Subscribed"
      ) : (
        "Subscribe"
      )}
    </Button>
  );
}
