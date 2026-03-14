import { useNavigate } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useState } from "react";

export default function SearchBar({
  placeholder = "Search...",
}: { placeholder?: string }) {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [focused, setFocused] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (q.trim()) navigate({ to: "/search", search: { q: q.trim() } });
  };

  return (
    <form onSubmit={handleSubmit} className="relative">
      <div className={`phosphor-border${focused ? " phosphor-active" : ""}`}>
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none"
          style={{ zIndex: 1 }}
        />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          className="w-full pl-9 pr-4 py-2 bg-background rounded-full text-sm text-foreground placeholder:text-muted-foreground focus:outline-none relative"
          style={{ zIndex: 1 }}
          data-ocid="search.search_input"
        />
      </div>
    </form>
  );
}
