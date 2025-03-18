"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, Plus, Film, Star } from "lucide-react";
import MovieForm from "@/components/MovieForm";
import MovieList from "@/components/MovieList";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Movie {
  id: string;
  name: string;
  genre: string;
  rating: string;
  created_at: string;
}

export default function Home() {
  const [showAddMovie, setShowAddMovie] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [genreFilter, setGenreFilter] = useState("all");
  const [ratingFilter, setRatingFilter] = useState("all");

  const fetchMovies = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append("search", searchQuery);
      if (genreFilter !== "all") params.append("genre", genreFilter);
      if (ratingFilter !== "all") params.append("rating", ratingFilter);

      const queryString = params.toString();
      const url = `/api/movies${queryString ? `?${queryString}` : ""}`;

      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch movies");

      const data = await response.json();
      return;
    } catch (error) {
      console.error("Error fetching movies:", error);
    }
  }, [searchQuery, genreFilter, ratingFilter]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Film className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
              Movie Collection
            </h1>
          </div>
          <Button
            onClick={() => setShowAddMovie(true)}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <Plus className="mr-2 h-4 w-4" /> Add Movie
          </Button>
        </div>

        <div className="backdrop-blur-sm bg-white/50 dark:bg-gray-800/50 p-6 rounded-2xl shadow-lg mb-8">
          <div className="grid gap-4 md:grid-cols-[1fr,200px,200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search movies..."
                className="pl-10 bg-white/50 dark:bg-gray-700/50 border-none focus:ring-2 focus:ring-indigo-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <Select value={genreFilter} onValueChange={setGenreFilter}>
              <SelectTrigger className="bg-white/50 dark:bg-gray-700/50 border-none focus:ring-2 focus:ring-indigo-500">
                <SelectValue placeholder="Filter by Genre" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Genres</SelectItem>
                <SelectItem value="action">Action</SelectItem>
                <SelectItem value="comedy">Comedy</SelectItem>
                <SelectItem value="drama">Drama</SelectItem>
                <SelectItem value="horror">Horror</SelectItem>
                <SelectItem value="scifi">Sci-Fi</SelectItem>
              </SelectContent>
            </Select>

            <Select value={ratingFilter} onValueChange={setRatingFilter}>
              <SelectTrigger className="bg-white/50 dark:bg-gray-700/50 border-none focus:ring-2 focus:ring-indigo-500">
                <SelectValue placeholder="Filter by Rating" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Ratings</SelectItem>
                {[...Array(9)].map((_, i) => (
                  <SelectItem key={i + 1} value={(i + 1).toString()}>
                    <div className="flex items-center gap-1">
                      {[...Array(i + 1)].map((_, j) => (
                        <Star
                          key={j}
                          className="h-4 w-4 fill-yellow-400 text-yellow-400"
                        />
                      ))}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <MovieList
          searchQuery={searchQuery}
          genreFilter={genreFilter}
          ratingFilter={ratingFilter}
          refreshMovies={fetchMovies}
        />

        <MovieForm
          open={showAddMovie}
          onOpenChange={setShowAddMovie}
          refreshMovies={fetchMovies}
        />
      </div>
    </main>
  );
}
