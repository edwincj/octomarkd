import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bookmark, GitFork, Loader2, Star } from "lucide-react";
import { NavLink } from "react-router";
import type { BookMark, GitRepo } from "@/types";

interface RepoResultsProps {
  repositories: Array<GitRepo>;
}

export function RepoResults({ repositories }: RepoResultsProps) {
  return (
    <div className="mt-6 space-y-4">
      <h2 className="text-2xl font-bold">Repositories</h2>
      <div className="grid gap-4 md:grid-cols-2">
        {repositories.map((repo) => (
          <RepositoryCard key={repo.id} repository={repo} />
        ))}
      </div>
    </div>
  );
}

function RepositoryCard({ repository }: { repository: GitRepo }) {
  const [isBookmarking, setIsBookmarking] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(() => {
    if (typeof window !== "undefined") {
      const bookmarks: Array<BookMark> = JSON.parse(
        localStorage.getItem("bookmarks") || "[]"
      );
      return bookmarks.some((b) => b.id === repository.id);
    }
    return false;
  });

  const handleBookmark = async () => {
    setIsBookmarking(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate API call
      const bookmarks: Array<BookMark> = JSON.parse(
        localStorage.getItem("bookmarks") || "[]"
      );
      const newBookmark: BookMark = {
        id: repository.id,
        name: repository.name,
        full_name: repository.full_name,
        description: repository.description,
        html_url: repository.html_url,
        owner: {
          login: repository.owner.login,
          avatar_url: repository.owner.avatar_url,
          html_url: repository.owner.html_url,
        },
        stargazers_count: repository.stargazers_count,
        forks_count: repository.forks_count,
        language: repository.language,
        bookmarked_at: new Date().toISOString(),
      };

      if (!bookmarks.some((b) => b.id === repository.id)) {
        bookmarks.push(newBookmark);
        localStorage.setItem("bookmarks", JSON.stringify(bookmarks));
        setIsBookmarked(true);
      }
    } catch (error) {
      console.error("Error bookmarking repository:", error);
    } finally {
      setIsBookmarking(false);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-4">
        <Avatar>
          <AvatarImage
            src={repository.owner.avatar_url}
            alt={repository.owner.login}
          />
          <AvatarFallback>
            {repository.owner.login.substring(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div>
          <CardTitle className="flex items-center gap-2">
            {repository.name}
            {repository.language && (
              <Badge variant="outline" className="ml-2">
                {repository.language}
              </Badge>
            )}
          </CardTitle>
          <CardDescription>
            by{" "}
            <NavLink
              to={repository.owner.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
              {repository.owner.login}
            </NavLink>
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground line-clamp-2">
          {repository.description || "No description provided"}
        </p>
        <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4" />
            <span>{repository.stargazers_count.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1">
            <GitFork className="h-4 w-4" />
            <span>{repository.forks_count.toLocaleString()}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" asChild>
          <NavLink
            to={repository.html_url}
            target="_blank"
            rel="noopener noreferrer"
          >
            View Repository
          </NavLink>
        </Button>
        <Button
          variant={isBookmarked ? "secondary" : "default"}
          onClick={handleBookmark}
          disabled={isBookmarking || isBookmarked}
        >
          {isBookmarking ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Bookmark className="mr-2 h-4 w-4" />
          )}
          {isBookmarked ? "Bookmarked" : "Bookmark"}
        </Button>
      </CardFooter>
    </Card>
  );
}
