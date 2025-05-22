import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Loader2, Star, GitFork, ExternalLink } from "lucide-react";
import { NavLink } from "react-router";
import type { GitRepo } from "@/types";
import { getUserRepos } from "@/services/github";
import { useBookMarks } from "@/context/BookMarkProvider";

interface UserRepositoriesModalProps {
  username: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export function UserRepositoriesModal({
  username,
  isOpen,
  onClose,
}: UserRepositoriesModalProps) {
  const [repositories, setRepositories] = useState<Array<GitRepo>>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [haveMore, setHaveMore] = useState<boolean>(false);
  const [isBookMarking, setIsBookMarking] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { addBookMark, isBookmarked } = useBookMarks();
  const [page, setPage] = useState(1);
  const [currentPage, setCurrentPage] = useState(0);

  useEffect(() => {
    const fetchRepositories = async (username: string, page: number) => {
      setIsLoading(true);
      setError(null);

      try {
        const items = await getUserRepos(username, page);

        if (items.length < 30) setHaveMore(false);
        else setHaveMore(true);

        const updatedRepos = items
          ? items.map((repo) => ({
              ...repo,
              isBookmarked: isBookmarked(repo.id),
            }))
          : [];

        setRepositories((pre) => [...pre, ...updatedRepos]);
        setCurrentPage(page);
      } catch (error) {
        console.error("Error fetching repositories:", error);
        setError("Failed to load repositories. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };
    if (isOpen && username && currentPage === (page - 1)) {
      fetchRepositories(username, page);
    }
  }, [isOpen, username, isBookmarked, page, currentPage]);

  const handleBookmark = async (repository: GitRepo) => {
    try {
      setIsBookMarking(repository.id);
      await addBookMark(repository);

      const updatedRepos = repositories.map((repo) =>
        repo.id === repository.id ? { ...repo, isBookmarked: true } : repo
      );
      setRepositories(updatedRepos);
    } catch (error) {
      console.error("Error bookmarking repository:", error);
    } finally {
      setIsBookMarking(null);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        onClose();
        setRepositories([]);
        setError(null);
        setPage(1);
        setCurrentPage(0);
      }
    }}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader className="sticky">
          <DialogTitle className="flex items-center gap-2">
            {username && (
              <>
                <Avatar className="h-6 w-6">
                  <AvatarImage
                    src={
                      repositories[0]?.owner?.avatar_url ||
                      `/placeholder.svg?height=24&width=24`
                    }
                    alt={username}
                  />
                  <AvatarFallback>
                    {username.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span>{username}'s Repositories</span>
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {repositories.length > 0
              ? `Showing ${repositories.length} repositories`
              : "Loading repositories..."}
          </DialogDescription>
        </DialogHeader>

        {isLoading && (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {error && (
          <div className="rounded-md bg-red-50 p-4 my-4">
            <p className="text-sm text-red-500">{error}</p>
          </div>
        )}

        {!isLoading && repositories.length === 0 && !error && (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No repositories found</p>
          </div>
        )}

        <div className="space-y-4 mt-4">
          {repositories.map((repo) => (
            <div
              key={repo.id}
              className="rounded-lg border p-4 hover:bg-muted/50 transition-colors"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium text-lg flex items-center gap-2">
                    {repo.name}
                    {repo.language && (
                      <Badge variant="outline" className="ml-2">
                        {repo.language}
                      </Badge>
                    )}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {repo.description || "No description provided"}
                  </p>
                  <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4" />
                      <span>{repo.stargazers_count.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <GitFork className="h-4 w-4" />
                      <span>{repo.forks_count.toLocaleString()}</span>
                    </div>
                    <div className="text-xs">
                      Updated: {new Date(repo.updated_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1"
                    asChild
                  >
                    <NavLink
                      to={repo.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="h-3 w-3" />
                      <span>View</span>
                    </NavLink>
                  </Button>
                  <Button
                    variant={repo.isBookmarked ? "secondary" : "default"}
                    size="sm"
                    onClick={() => handleBookmark(repo)}
                    disabled={repo.isBookmarked || isBookMarking === repo.id}
                  >
                    {repo.isBookmarked ? "Bookmarked" : "Bookmark"}
                  </Button>
                </div>
              </div>
            </div>
          ))}
          {haveMore && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setPage((prev) => prev + 1)}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Load more"
              )}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
