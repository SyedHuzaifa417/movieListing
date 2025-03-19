"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Film, LogIn, LogOut, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";

interface JwtPayload {
  userId: string;
  username: string;
}

function parseJwt(token: string): JwtPayload | null {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

export default function Navbar() {
  const [username, setUsername] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const { toast } = useToast();

  const checkAuth = useCallback(() => {
    if (typeof window === "undefined") return false;

    const hasToken = document.cookie
      .split("; ")
      .some((row) => row.startsWith("token="));

    const hasAuthState = document.cookie
      .split("; ")
      .some((row) => row.startsWith("auth_state=true"));

    const hasLocalStorage = localStorage.getItem("isAuthenticated") === "true";

    const isAuthed = hasToken || hasAuthState || hasLocalStorage;

    console.log("Auth check:", {
      hasToken,
      hasAuthState,
      hasLocalStorage,
      isAuthed,
    });

    setIsAuthenticated(isAuthed);

    if (isAuthed) {
      const storedUsername = localStorage.getItem("username");
      if (storedUsername) {
        setUsername(storedUsername);
        return true;
      }
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("token="))
        ?.split("=")[1];

      if (token) {
        try {
          const decoded = parseJwt(token);
          if (decoded?.username) {
            setUsername(decoded.username);
            localStorage.setItem("username", decoded.username);
            return true;
          }
        } catch (error) {
          console.error("Failed to decode token:", error);
        }
      }
    } else {
      setUsername(null);
    }

    return isAuthed;
  }, []);

  useEffect(() => {
    setMounted(true);
    checkAuth();

    window.addEventListener("focus", checkAuth);

    const interval = setInterval(checkAuth, 5000);

    return () => {
      window.removeEventListener("focus", checkAuth);
      clearInterval(interval);
    };
  }, [checkAuth]);

  const handleSignOut = async () => {
    try {
      setIsLoading(true);

      const response = await fetch("/api/auth/signout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to sign out");
      }

      document.cookie =
        "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      document.cookie =
        "auth_state=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      localStorage.removeItem("isAuthenticated");
      localStorage.removeItem("username");

      toast({
        title: "Success",
        description: "You have been signed out",
      });

      setIsAuthenticated(false);
      setUsername(null);

      window.location.href = "/login";
    } catch (error) {
      console.error("Error signing out:", error);
      toast({
        title: "Error",
        description: "Failed to sign out",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = () => {
    window.location.href = "/login";
  };

  if (!mounted) return null;

  return (
    <nav className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow sticky top-0 z-10">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2 text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400"
        >
          <Film className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
          <span>Movies Collection</span>
        </Link>

        <div>
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center gap-1 hover:bg-white/20 dark:hover:bg-gray-800/20"
                >
                  <span className="font-medium text-indigo-600 dark:text-indigo-400">
                    {username || "User"}
                  </span>
                  <ChevronDown className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-none shadow-lg"
              >
                <DropdownMenuItem
                  onClick={handleSignOut}
                  className="text-red-500 cursor-pointer focus:bg-red-50 dark:focus:bg-red-950/20"
                  disabled={isLoading}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  <span>{isLoading ? "Signing out..." : "Sign Out"}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              onClick={handleSignIn}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow hover:shadow-lg transition-all duration-200 flex items-center gap-1"
            >
              <LogIn className="h-4 w-4 mr-1" />
              <span>Sign In</span>
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
}
