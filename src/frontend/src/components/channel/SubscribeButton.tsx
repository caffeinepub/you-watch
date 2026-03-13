import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Principal } from "@icp-sdk/core/principal";
import { useNavigate } from "@tanstack/react-router";
import { BellOff, BellRing, Check, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuthContext } from "../../context/AuthContext";
import { useIsSubscribed, useSubscribe } from "../../hooks/useChannel";

type NotifLevel = "all" | "personalized" | "none";

const NOTIF_OPTIONS: { level: NotifLevel; label: string; desc: string }[] = [
  { level: "all", label: "All", desc: "Every new video" },
  { level: "personalized", label: "Personalized", desc: "Recommended uploads" },
  { level: "none", label: "None", desc: "No notifications" },
];

function getStoredNotif(channelId: string): NotifLevel {
  try {
    return (localStorage.getItem(`notif_${channelId}`) as NotifLevel) || "all";
  } catch {
    return "all";
  }
}

function setStoredNotif(channelId: string, level: NotifLevel) {
  try {
    localStorage.setItem(`notif_${channelId}`, level);
  } catch {}
}

interface SubscribeButtonProps {
  channelOwnerId: Principal;
}

export default function SubscribeButton({
  channelOwnerId,
}: SubscribeButtonProps) {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthContext();
  const channelIdStr = channelOwnerId.toString();

  const { data: isSubscribed, isLoading: checkLoading } = useIsSubscribed(
    isAuthenticated ? channelOwnerId : null,
  );
  const { mutate: toggleSubscribe, isPending } = useSubscribe();
  const [notifLevel, setNotifLevel] = useState<NotifLevel>(() =>
    getStoredNotif(channelIdStr),
  );

  useEffect(() => {
    setNotifLevel(getStoredNotif(channelIdStr));
  }, [channelIdStr]);

  const handleSubscribe = () => {
    if (!isAuthenticated) {
      navigate({ to: "/auth" });
      return;
    }
    toggleSubscribe({ channelOwnerId, isSubscribed: false });
    setStoredNotif(channelIdStr, "all");
    setNotifLevel("all");
  };

  const handleUnsubscribe = () => {
    toggleSubscribe({ channelOwnerId, isSubscribed: true });
  };

  const handleNotifLevel = (level: NotifLevel) => {
    setNotifLevel(level);
    setStoredNotif(channelIdStr, level);
  };

  if (checkLoading) {
    return (
      <Button
        disabled
        variant="outline"
        className="rounded-full"
        data-ocid="channel.subscribe_button"
      >
        <Loader2 className="w-4 h-4 animate-spin" />
      </Button>
    );
  }

  if (!isSubscribed) {
    return (
      <Button
        onClick={handleSubscribe}
        disabled={isPending}
        className="rounded-full font-semibold brand-gradient text-primary-foreground"
        data-ocid="channel.subscribe_button"
      >
        {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Subscribe"}
      </Button>
    );
  }

  const BellIcon = notifLevel === "none" ? BellOff : BellRing;

  return (
    <div className="flex items-center gap-1">
      <Button
        variant="outline"
        className="rounded-full font-semibold border-border text-foreground"
        data-ocid="channel.subscribed_button"
        disabled={isPending}
      >
        {isPending ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          "Subscribed"
        )}
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full w-9 h-9"
            data-ocid="channel.bell_button"
          >
            <BellIcon className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="w-56"
          data-ocid="channel.dropdown_menu"
        >
          {NOTIF_OPTIONS.map((opt) => (
            <DropdownMenuItem
              key={opt.level}
              onClick={() => handleNotifLevel(opt.level)}
              className="flex items-start gap-2 cursor-pointer"
              data-ocid={`channel.notif_${opt.level}_button`}
            >
              <span className="w-4 h-4 mt-0.5 flex-shrink-0">
                {notifLevel === opt.level && <Check className="w-4 h-4" />}
              </span>
              <div>
                <p className="font-medium text-sm">{opt.label}</p>
                <p className="text-xs text-muted-foreground">{opt.desc}</p>
              </div>
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={handleUnsubscribe}
            className="flex items-center gap-2 cursor-pointer text-destructive focus:text-destructive"
            data-ocid="channel.unsubscribe_button"
          >
            <span className="w-4 h-4 flex-shrink-0" />
            <span className="font-medium text-sm">Unsubscribe</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
