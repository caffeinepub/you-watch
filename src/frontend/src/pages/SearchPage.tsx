import { useSearch } from "@tanstack/react-router";
import { Search } from "lucide-react";
import SearchBar from "../components/common/SearchBar";
import VideoGrid from "../components/video/VideoGrid";
import { useSearchVideos } from "../hooks/useVideos";

export default function SearchPage() {
  const { q = "" } = useSearch({ from: "/search" }) as { q?: string };
  const { data: results = [], isLoading } = useSearchVideos(q);

  return (
    <div className="px-4 py-6 max-w-screen-2xl mx-auto animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <Search className="w-6 h-6 text-primary" />
        <h1 className="font-display font-bold text-2xl">
          {q ? `Results for "${q}"` : "Search"}
        </h1>
      </div>

      <div className="mb-6 max-w-xl">
        <SearchBar placeholder="Search videos..." />
      </div>

      {q ? (
        <>
          {!isLoading && (
            <p className="text-sm text-muted-foreground mb-4">
              {results.length} result{results.length !== 1 ? "s" : ""} found
            </p>
          )}
          <VideoGrid
            videos={results}
            isLoading={isLoading}
            emptyMessage={`No results found for "${q}". Try different keywords.`}
          />
        </>
      ) : (
        <div
          className="flex flex-col items-center justify-center py-20 text-center"
          data-ocid="search.empty_state"
        >
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
            <Search className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground">
            Enter a search term to find videos
          </p>
        </div>
      )}
    </div>
  );
}
