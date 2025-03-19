"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Search, Star, Plus, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import MovieList from "@/components/MovieList";
import { useToast } from "@/hooks/use-toast";
import MovieForm from "@/components/MovieForm";

const genres = [
  "all",
  "action",
  "adventure",
  "comedy",
  "drama",
  "fantasy",
  "horror",
  "mystery",
  "romance",
  "sci-fi",
  "thriller",
];

export default function Home() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialSearch = searchParams.get("search") || "";
  const initialGenre = searchParams.get("genre") || "all";
  const initialRating = searchParams.get("rating") || "all";
  const { toast } = useToast();

  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [genreFilter, setGenreFilter] = useState(initialGenre);
  const [ratingFilter, setRatingFilter] = useState(initialRating);
  const [isGenreOpen, setIsGenreOpen] = useState(false);
  const [isRatingOpen, setIsRatingOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showAddMovie, setShowAddMovie] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/check", {
          method: "GET",
          credentials: "include",
        });

        setIsAuthenticated(response.ok);
      } catch (error) {
        console.error("Auth check error:", error);
        setIsAuthenticated(false);
      }
    };

    checkAuth();
  }, []);

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    updateSearchParams({ search: value });
  };

  const handleGenreSelect = (genre: string) => {
    setGenreFilter(genre);
    updateSearchParams({ genre });
  };

  const handleRatingSelect = (rating: string) => {
    setRatingFilter(rating);
    updateSearchParams({ rating });
  };

  const handleAddMovie = () => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to add movies",
        variant: "destructive",
      });
      router.push("/login");
      return;
    }
    setShowAddMovie(true);
  };

  const updateSearchParams = (params: Record<string, string>) => {
    const url = new URL(window.location.href);

    for (const [key, value] of Object.entries(params)) {
      if (value) {
        url.searchParams.set(key, value);
      } else {
        url.searchParams.delete(key);
      }
    }

    router.push(url.pathname + url.search);
  };

  const handleMovieAdded = async (): Promise<void> => {
    setRefreshTrigger((prev) => prev + 1);
    setShowAddMovie(false);
    return Promise.resolve();
  };

  return (
    <div className="min-h-screen bg-white">
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 flex flex-col gap-4">
          <div className="flex justify-end">
            <Button
              onClick={handleAddMovie}
              className="gap-2 bg-gray-900 text-white hover:bg-gray-800"
            >
              <Plus className="h-4 w-4" />
              Add Movie
            </Button>
          </div>

          <div className="flex flex-col gap-4 md:flex-row md:items-center md:gap-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search movies..."
                className="pl-10 bg-white border-gray-200 text-gray-900 placeholder:text-gray-500 focus:border-gray-400"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>

            <div className="flex gap-2">
              <DropdownMenu open={isRatingOpen} onOpenChange={setIsRatingOpen}>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="gap-2 bg-white border-gray-200 text-gray-900 hover:bg-gray-50"
                  >
                    Rating
                    <ChevronDown
                      className={`h-4 w-4 transition-transform duration-200 ${
                        isRatingOpen ? "rotate-180" : ""
                      }`}
                    />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-56 bg-white border-gray-200"
                  align="end"
                >
                  <DropdownMenuLabel className="text-gray-900">
                    Filter by Rating
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-gray-200" />
                  <DropdownMenuCheckboxItem
                    checked={ratingFilter === "all"}
                    onCheckedChange={() => handleRatingSelect("all")}
                    className="text-gray-900 hover:bg-gray-50 [&>span]:border-gray-300"
                  >
                    All Ratings
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuSeparator className="bg-gray-200" />
                  {[...Array(9)].map((_, i) => (
                    <DropdownMenuCheckboxItem
                      key={i + 1}
                      checked={ratingFilter === (i + 1).toString()}
                      onCheckedChange={() =>
                        handleRatingSelect((i + 1).toString())
                      }
                      className="flex items-center space-x-2 text-gray-900 hover:bg-gray-50 [&>span]:border-gray-300"
                    >
                      <div className="flex items-center">
                        {[...Array(i + 1)].map((_, j) => (
                          <Star
                            key={j}
                            className="h-4 w-4 fill-gray-900 text-gray-900"
                          />
                        ))}
                        {[...Array(9 - (i + 1))].map((_, j) => (
                          <Star key={j} className="h-4 w-4 text-gray-300" />
                        ))}
                      </div>
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu open={isGenreOpen} onOpenChange={setIsGenreOpen}>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="gap-2 bg-white border-gray-200 text-gray-900 hover:bg-gray-50"
                  >
                    Genre
                    <ChevronDown
                      className={`h-4 w-4 transition-transform duration-200 ${
                        isGenreOpen ? "rotate-180" : ""
                      }`}
                    />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-56 bg-white border-gray-200"
                  align="end"
                >
                  <DropdownMenuLabel className="text-gray-900">
                    Filter by Genre
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-gray-200" />
                  {genres.map((genre) => (
                    <DropdownMenuCheckboxItem
                      key={genre}
                      checked={genreFilter === genre}
                      onCheckedChange={() => handleGenreSelect(genre)}
                      className="capitalize text-gray-900 hover:bg-gray-50 [&>span]:border-gray-300"
                    >
                      {genre === "all" ? "All Genres" : genre}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        <MovieList
          searchQuery={searchQuery}
          genreFilter={genreFilter}
          ratingFilter={ratingFilter}
          isAuthenticated={isAuthenticated}
          refreshTrigger={refreshTrigger}
        />

        <MovieForm
          open={showAddMovie}
          onOpenChange={setShowAddMovie}
          refreshMovies={handleMovieAdded}
          isAuthenticated={isAuthenticated}
        />
      </main>
    </div>
  );
}
