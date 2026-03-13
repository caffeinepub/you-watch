import { Link, useRouterState } from "@tanstack/react-router";
import {
  BookMarked,
  Compass,
  Home,
  MessageCircle,
  Plus,
  Users,
} from "lucide-react";

const tabs = [
  { to: "/", icon: Home, label: "Home", ocid: "nav.home.tab" },
  { to: "/explore", icon: Compass, label: "Explore", ocid: "nav.explore.tab" },
  { to: "/upload", icon: Plus, label: "Upload", ocid: "nav.upload.tab" },
  { to: "/subscriptions", icon: Users, label: "Subs", ocid: "nav.subs.tab" },
  {
    to: "/messages",
    icon: MessageCircle,
    label: "Messages",
    ocid: "nav.messages.tab",
  },
  {
    to: "/library",
    icon: BookMarked,
    label: "Library",
    ocid: "nav.library.tab",
  },
];

export default function BottomNav() {
  const location = useRouterState({ select: (s) => s.location.pathname });

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-background/95 backdrop-blur border-t border-border">
      <div
        className="flex items-center overflow-x-auto scrollbar-hide snap-x snap-mandatory h-16"
        style={{ touchAction: "pan-x" }}
      >
        {tabs.map(({ to, icon: Icon, label, ocid }) => {
          const isActive =
            to === "/" ? location === "/" : location.startsWith(to);
          return (
            <Link
              key={to}
              to={to}
              className="flex flex-col items-center gap-0.5 snap-center shrink-0 min-w-[64px] py-2 px-1 transition-colors"
              data-ocid={ocid}
            >
              <div
                className={`flex flex-col items-center gap-0.5 ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {to === "/upload" ? (
                  <div className="w-10 h-10 rounded-full brand-gradient flex items-center justify-center">
                    <Icon className="w-5 h-5 text-primary-foreground" />
                  </div>
                ) : (
                  <>
                    <Icon className="w-5 h-5" />
                    <span className="text-[10px] font-medium">{label}</span>
                  </>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
