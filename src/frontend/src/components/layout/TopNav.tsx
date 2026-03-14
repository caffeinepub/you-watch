import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "@tanstack/react-router";
import { Bell, Menu, Upload, User, X } from "lucide-react";
import { useState } from "react";
import { useAuthContext } from "../../context/AuthContext";
import { useNotifications } from "../../context/NotificationsContext";
import { useStorage } from "../../hooks/useStorage";

export default function TopNav() {
  const navigate = useNavigate();
  const { isAuthenticated, userProfile } = useAuthContext();
  const { getBlobUrl } = useStorage();
  const { unreadCount } = useNotifications();
  const [searchQuery, setSearchQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [desktopFocused, setDesktopFocused] = useState(false);
  const [mobileFocused, setMobileFocused] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate({ to: "/search", search: { q: searchQuery.trim() } });
    }
  };

  const avatarUrl = userProfile?.avatarBlobId
    ? getBlobUrl(userProfile.avatarBlobId)
    : "";

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
      <div className="flex items-center gap-3 px-4 h-14">
        <Link
          to="/"
          className="flex items-center gap-1 shrink-0"
          data-ocid="nav.link"
        >
          <span className="font-display font-black text-xl tracking-tight">
            <span className="text-brand">YOU</span>
            <span className="text-foreground"> WATCH</span>
          </span>
        </Link>

        <form
          onSubmit={handleSearch}
          className="flex-1 max-w-xl mx-auto hidden sm:flex"
        >
          <div
            className={`relative w-full phosphor-border${desktopFocused ? " phosphor-active" : ""}`}
          >
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setDesktopFocused(true)}
              onBlur={() => setDesktopFocused(false)}
              placeholder="Search videos..."
              className="w-full bg-background rounded-full px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none relative"
              style={{ zIndex: 1 }}
              data-ocid="nav.search_input"
            />
          </div>
        </form>

        <div className="flex items-center gap-2 ml-auto">
          <Link to="/upload" className="hidden sm:flex">
            <Button
              size="sm"
              className="brand-gradient text-primary-foreground font-semibold gap-1.5 rounded-full"
              data-ocid="nav.upload_button"
            >
              <Upload className="w-4 h-4" />
              Upload
            </Button>
          </Link>

          {/* Bell notification icon — visible on all screen sizes */}
          <Link
            to="/notifications"
            data-ocid="nav.notifications_link"
            className="relative flex items-center justify-center w-9 h-9 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center leading-none">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </Link>

          <Link
            to={isAuthenticated ? "/profile" : "/auth"}
            data-ocid="nav.link"
          >
            <div className="w-8 h-8 rounded-full overflow-hidden bg-muted flex items-center justify-center cursor-pointer hover:ring-2 hover:ring-primary transition-all">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-4 h-4 text-muted-foreground" />
              )}
            </div>
          </Link>

          <button
            type="button"
            className="sm:hidden text-muted-foreground"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="sm:hidden px-4 pb-3">
          <form onSubmit={handleSearch}>
            <div
              className={`phosphor-border${mobileFocused ? " phosphor-active" : ""}`}
            >
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setMobileFocused(true)}
                onBlur={() => setMobileFocused(false)}
                placeholder="Search videos..."
                className="w-full bg-background rounded-full px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none relative"
                style={{ zIndex: 1 }}
                data-ocid="nav.search_input"
              />
            </div>
          </form>
        </div>
      )}
    </header>
  );
}
