import type React from "react";
import { useState, Fragment } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Bookmark, GitFork, Loader2, Star, Trash, Upload } from "lucide-react";
import { NavLink } from "react-router";
import { useBookMarks } from "@/context/BookMarkProvider";
import Papa from "papaparse";
import type { BookMark } from "@/types";
import { validateRepository } from "@/services/github";

export default function Bookmarks() {
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [importStatus, setImportStatus] = useState<{
    status: "idle" | "loading" | "success" | "error";
    message: string;
  }>({
    status: "idle",
    message: "",
  });
  const [isDeleting, setIsDeleting] = useState<number | null>(null);

  const {
    bookMarks,
    isLoading,
    removeBookMark,
    addMultipleBookMarks,
    bookmarkIds,
  } = useBookMarks();

  const handleRemoveBookmark = async (id: number) => {
    try {
      setIsDeleting(id);
      await removeBookMark(id);
    } catch (error) {
      console.error("Error removing bookmark: ", error);
    } finally {
      setIsDeleting(null);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setCsvFile(e.target.files[0]);
    }
  };

  const handleImportCsv = async () => {
    if (!csvFile) return;

    setImportStatus({
      status: "loading",
      message: "Importing repositories...",
    });

    try {
      const parseResult = await new Promise<Papa.ParseResult<any>>(
        (resolve) => {
          Papa.parse(csvFile, {
            header: true,
            skipEmptyLines: true,
            delimiter: ",",
            complete: (results) => resolve(results),
          });
        }
      );
      if (parseResult.errors.length > 0) {
        console.log(parseResult.errors);
        throw new Error("Error parsing CSV file");
      }
      console.log(parseResult);
      const validRepositories: BookMark[] = [];
      const existingIds = new Set(Array.from(bookmarkIds));
      console.log(existingIds, "existingIds");

      for (const row of parseResult.data) {
        if (!row.full_name) continue;
        const repo = await validateRepository(row.full_name);
        if (repo && !existingIds.has(repo.id)) {
          validRepositories.push({
            id: repo.id,
            name: repo.name,
            full_name: repo.full_name,
            description: repo.description,
            html_url: repo.html_url,
            owner: {
              login: repo.owner.login,
              avatar_url: repo.owner.avatar_url,
              html_url: repo.owner.html_url,
            },
            stargazers_count: repo.stargazers_count,
            forks_count: repo.forks_count,
            language: repo.language,
            bookmarked_at: new Date(row.date ?? undefined).toISOString(),
          });
          existingIds.add(repo.id);
        }
      }
      console.log(validRepositories);
      addMultipleBookMarks(validRepositories);
      setImportStatus({
        status: "success",
        message: `Successfully imported ${validRepositories.length} repositories`,
      });
    } catch (error) {
      console.error("Error importing CSV:", error);
      setImportStatus({
        status: "error",
        message: "Error importing CSV file",
      });
    } finally {
      setCsvFile(null);
      const fileInput = document.getElementById("csv-file") as HTMLInputElement;
      if (fileInput) fileInput.value = "";
    }
  };

  return (
    <Fragment>
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Your Bookmarks</h1>
        <p className="text-muted-foreground">
          Manage your bookmarked GitHub repositories
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Import Repositories</CardTitle>
          <CardDescription>
            Import repositories from a CSV file. The CSV should have a column
            named &quot;full_name&quot; with the format &quot;owner/repo&quot;
            and a column named &quot;date&quot; with the format
            &quot;YYYY-MM-DD&quot;.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="csv-file">CSV File</Label>
            <Input
              id="csv-file"
              type="file"
              accept=".csv"
              onChange={handleFileChange}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button
            onClick={handleImportCsv}
            disabled={!csvFile || importStatus.status === "loading"}
          >
            {importStatus.status === "loading" ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Importing...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Import
              </>
            )}
          </Button>
        </CardFooter>
      </Card>

      {importStatus.status !== "idle" && (
        <Alert
          variant={
            importStatus.status === "success"
              ? "default"
              : importStatus.status === "error"
              ? "destructive"
              : "default"
          }
        >
          <AlertTitle>
            {importStatus.status === "success"
              ? "Success"
              : importStatus.status === "error"
              ? "Error"
              : "Processing"}
          </AlertTitle>
          <AlertDescription>{importStatus.message}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Your Bookmarks</h2>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : bookMarks.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
            <Bookmark className="h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">No bookmarks yet</h3>
            <p className="text-muted-foreground">
              Search for repositories and bookmark them to see them here
            </p>
            <Button className="mt-4" asChild>
              <NavLink to="/">Search Repositories</NavLink>
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {bookMarks.map((bookmark) => (
              <Card key={bookmark.id}>
                <CardHeader className="flex flex-row items-center gap-4">
                  <Avatar>
                    <AvatarImage
                      src={bookmark.owner.avatar_url || "/placeholder.svg"}
                      alt={bookmark.owner.login}
                    />
                    <AvatarFallback>
                      {bookmark.owner.login.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {bookmark.name}
                      {bookmark.language && (
                        <Badge variant="outline" className="ml-2">
                          {bookmark.language}
                        </Badge>
                      )}
                    </CardTitle>
                    <CardDescription>
                      by{" "}
                      <NavLink
                        to={`https://github.com/${bookmark.owner.login}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline"
                      >
                        {bookmark.owner.login}
                      </NavLink>
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {bookmark.description || "No description provided"}
                  </p>
                  <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4" />
                      <span>
                        {bookmark.stargazers_count?.toLocaleString() || 0}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <GitFork className="h-4 w-4" />
                      <span>{bookmark.forks_count?.toLocaleString() || 0}</span>
                    </div>
                    <div>
                      Bookmarked:{" "}
                      {new Date(bookmark.bookmarked_at).toLocaleDateString()}
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" asChild>
                    <NavLink
                      to={bookmark.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View Repository
                    </NavLink>
                  </Button>
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => handleRemoveBookmark(bookmark.id)}
                    disabled={isDeleting === bookmark.id}
                  >
                    {isDeleting === bookmark.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash className="h-4 w-4" />
                    )}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Fragment>
  );
}
