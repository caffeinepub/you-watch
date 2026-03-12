import { Link, useRouterState } from "@tanstack/react-router";
import { Bell, BookMarked, Compass, Home, Plus } from "lucide-react";

const tabs = [
  { to: "/", icon: Home, label: "Home", ocid: "nav.tab" },
  { to: "/explore", icon: Compass, label: "Explore", ocid: "nav.tab" },
  { to: "/upload", icon: Plus, label: "Upload", ocid: "nav.tab" },
  { to: "/subscriptions", icon: Bell, label: "Subs", ocid: "nav.tab" },
  { to: "/library", icon: BookMarked, label: "Library", ocid: "nav.tab" },
];

export default function BottomNav() {
  const location = useRouterState({ select: (s) => s.location.pathname });

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-background/95 backdrop-blur border-t border-border">
      <div className="flex items-center justify-around h-16">
        {tabs.map(({ to, icon: Icon, label, ocid }) => {
          const isActive =
            to === "/" ? location === "/" : location.startsWith(to);
          return (
            <Link
              key={to}
              to={to}
              className="flex flex-col items-center gap-0.5 flex-1 py-2 transition-colors"
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
