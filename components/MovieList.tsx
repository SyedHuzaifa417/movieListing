"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Star, Film, Trash } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

interface Movie {
  id: string;
  name: string;
  genre: string;
  rating: string;
  created_at: string;
}

interface MovieListProps {
  searchQuery: string;
  genreFilter: string;
  ratingFilter: string;
  isAuthenticated: boolean;
  refreshTrigger: number;
}

export default function MovieList({
  searchQuery,
  genreFilter,
  ratingFilter,
  isAuthenticated,
  refreshTrigger,
}: MovieListProps) {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  const refreshMovies = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (searchQuery) params.append("search", searchQuery);
      if (genreFilter !== "all") params.append("genre", genreFilter);
      if (ratingFilter !== "all") params.append("rating", ratingFilter);

      const queryString = params.toString();
      const url = `/api/movies${queryString ? `?${queryString}` : ""}`;

      const response = await fetch(url, { cache: "no-store" });

      if (!response.ok) {
        throw new Error("Failed to fetch movies");
      }

      const data = await response.json();
      setMovies(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Fetch error:", error);
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }, [searchQuery, genreFilter, ratingFilter]);

  const deleteMovie = async (id: string) => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to delete movies",
        variant: "destructive",
      });
      router.push("/login");
      return;
    }

    try {
      const response = await fetch(`/api/movies/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (response.status === 401) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to delete movies",
          variant: "destructive",
        });
        router.push("/login");
        return;
      }

      if (response.status === 403) {
        toast({
          title: "Permission Denied",
          description: "You don't have permission to delete this movie",
          variant: "destructive",
        });
        return;
      }

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete movie");
      }

      setMovies((prev) => prev.filter((movie) => movie.id !== id));

      toast({
        title: "Success",
        description: "Movie deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting movie:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to delete movie",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    refreshMovies();
  }, [refreshMovies, refreshTrigger]);

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <Card
            key={i}
            className="animate-pulse bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-none"
          >
            <CardHeader className="space-y-2">
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="h-3 bg-muted rounded w-1/4"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 backdrop-blur-sm bg-white/50 dark:bg-gray-800/50 rounded-2xl">
        <Film className="h-12 w-12 mx-auto text-red-500 mb-4" />
        <p className="text-lg text-red-500 font-medium">Error: {error}</p>
        <button
          onClick={refreshMovies}
          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (movies.length === 0) {
    return (
      <div className="text-center py-12 backdrop-blur-sm bg-white/50 dark:bg-gray-800/50 rounded-2xl">
        <Film className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-lg text-muted-foreground">No movies found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">
        {isAuthenticated ? "My Movies" : "Browse Movies"}
      </h2>

      <div className="grid gap-4 md:grid-cols-3">
        {movies.map((movie) => (
          <Card
            key={movie.id}
            className="group hover:scale-105 transition-all duration-200 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-none shadow-lg hover:shadow-xl"
          >
            <CardHeader>
              <CardTitle className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
                {movie.name}
              </CardTitle>
              <CardDescription className="capitalize text-indigo-600/70 dark:text-indigo-400/70">
                {movie.genre}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1">
                  {[...Array(parseInt(movie.rating) || 0)].map((_, i) => (
                    <Star
                      key={i}
                      className="h-4 w-4 fill-yellow-400 text-yellow-400"
                    />
                  ))}
                  {[...Array(9 - (parseInt(movie.rating) || 0))].map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-gray-300" />
                  ))}
                </div>
                {isAuthenticated && (
                  <button
                    onClick={() => deleteMovie(movie.id)}
                    className="p-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                  >
                    <Trash className="h-4 w-4" />
                  </button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
