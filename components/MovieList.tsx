"use client";

import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface Movie {
  id: string;
  name: string;
  genre: string;
  rating: string;
  created_at: string;
}

export default function MovieList({
  searchQuery,
  genreFilter,
  ratingFilter,
}: {
  searchQuery: string;
  genreFilter: string;
  ratingFilter: string;
}) {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMovies();
  }, [searchQuery, genreFilter, ratingFilter]);

  async function fetchMovies() {
    try {
      const params = new URLSearchParams({
        search: searchQuery,
        genre: genreFilter,
        rating: ratingFilter,
      });

      const response = await fetch(`/api/movies?${params}`);
      if (!response.ok) throw new Error("Failed to fetch movies");

      const data = await response.json();
      setMovies(data);
    } catch (error) {
      console.error("Error fetching movies:", error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
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

  if (movies.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-lg text-muted-foreground">No movies found</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {movies.map((movie) => (
        <Card key={movie.id}>
          <CardHeader>
            <CardTitle>{movie.name}</CardTitle>
            <CardDescription className="capitalize">
              {movie.genre}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-1">
              {[...Array(parseInt(movie.rating))].map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-primary text-primary" />
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
