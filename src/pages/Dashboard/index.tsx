import { Button } from "@/components/ui/button";
import {
  Card,
  CardTitle,
  CardContent,
  CardHeader,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, type FC, type FormEvent } from "react";
import { Loader2, Search, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { UserResults } from "@/pages/dashboard/UserResults";
import { RepoResults } from "@/pages/dashboard/RepoResults";
import { getRepos, getUsers } from "@/services/github";
import type { GitRepo, GitUser } from "@/types";

type SearchType = "repositories" | "users";

const Dashboard: FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState<SearchType>("repositories");
  const [isLoading, setIsLoading] = useState(false);
  const [userResults, setUserResults] = useState<Array<GitUser>>([]);
  const [repoResults, setRepoResults] = useState<Array<GitRepo>>([]);
  const [isEmptyResults, setIsEmptyresults] = useState(false);

  const handleSearch = async (e: FormEvent<HTMLFormElement>) => {
    try {
      setIsLoading(true);
      e.preventDefault();
      if (searchType === "users") {
        const userData = await getUsers(searchQuery);
        setUserResults(userData.items);
        setIsEmptyresults(userData.total_count === 0);
      } else {
        const repoData = await getRepos(searchQuery);
        setRepoResults(repoData.items);
        setIsEmptyresults(repoData.total_count === 0);
      }
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight">Search GitHub</h1>
      <p className="text-muted-foreground mb-2">
        Search for GitHub users and repositories
      </p>

      <Card>
        <CardHeader>
          <CardTitle>Search</CardTitle>
          <CardDescription>
            Enter a search term to find GitHub users or repositories
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="flex flex-col space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
              <div className="flex-1">
                <Input
                  placeholder="Search GitHub..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Tabs
                defaultValue="repositories"
                value={searchType}
                onValueChange={(value) => setSearchType(value as SearchType)}
                className="w-full sm:w-auto"
              >
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="repositories">Repositories</TabsTrigger>
                  <TabsTrigger value="users">Users</TabsTrigger>
                </TabsList>
              </Tabs>
              <Button type="submit" disabled={isLoading || !searchQuery.trim()}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-4 w-4" />
                    Search
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {searchType === "users" && userResults.length > 0 && (
        <UserResults users={userResults} />
      )}
      
      {searchType === "repositories" && repoResults.length > 0 && (
        <RepoResults repositories={repoResults} />
      )}

      {isLoading && (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {!isLoading && searchQuery && isEmptyResults && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <User className="h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">No results found</h3>
          <p className="text-muted-foreground">
            Try a different search term or search type
          </p>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
