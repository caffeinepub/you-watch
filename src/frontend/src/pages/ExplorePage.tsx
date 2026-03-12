import { Compass } from "lucide-react";
import { useMemo, useState } from "react";
import CategoryPill from "../components/common/CategoryPill";
import SearchBar from "../components/common/SearchBar";
import VideoGrid from "../components/video/VideoGrid";
import { useAllVideos } from "../hooks/useVideos";

const ALL_CATEGORIES = [
  "All",
  "Entertainment",
  "Education",
  "Gaming",
  "Music",
  "Sports",
  "News",
  "Science & Tech",
  "Travel",
  "Food",
  "Fashion",
  "Comedy",
  "Film & Animation",
];

export default function ExplorePage() {
  const { data: allVideos = [], isLoading } = useAllVideos();
  const [activeCategory, setActiveCategory] = useState("All");

  const filtered = useMemo(() => {
    if (activeCategory === "All") return allVideos;
    return allVideos.filter((v) => v.category === activeCategory);
  }, [allVideos, activeCategory]);

  return (
    <div className="px-4 py-6 max-w-screen-2xl mx-auto animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <Compass className="w-6 h-6 text-primary" />
        <h1 className="font-display font-bold text-2xl">Explore</h1>
      </div>

      <SearchBar placeholder="Search videos, channels..." />

      <div className="flex gap-2 overflow-x-auto hide-scrollbar py-4">
        {ALL_CATEGORIES.map((cat) => (
          <CategoryPill
            key={cat}
            label={cat}
            active={activeCategory === cat}
            onClick={() => setActiveCategory(cat)}
          />
        ))}
      </div>

      <VideoGrid
        videos={filtered}
        isLoading={isLoading}
        emptyMessage={`No ${
          activeCategory === "All" ? "" : `${activeCategory} `
        }videos found`}
      />
    </div>
  );
}
