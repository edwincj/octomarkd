import type React from "react";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useAuth } from "./AuthProvider";
import type { BookMark, GitRepo, UserBookMarks } from "@/types";

type BookMarkContextType = {
  bookMarks: Array<BookMark>;
  isLoading: boolean;
  addBookMark: (repoToMark: GitRepo) => Promise<void>;
  removeBookMark: (id: number) => Promise<void>;
  addMultipleBookMarks: (newMarks: BookMark[]) => Promise<void>
  isBookmarked: (repoId: number) => boolean;
  bookmarkIds: Set<number>;
};

const BookMarkContext = createContext<BookMarkContextType | undefined>(
  undefined
);

export function BookMarkProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [bookMarks, setBookmarks] = useState<Array<BookMark>>([]);
  const [email, setEmail] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [bookmarkIds, setBookmarkIds] = useState<Set<number>>(new Set());
  const userBooKMarkMap = useRef<UserBookMarks>(new Map());

  useEffect(() => {
    if (user && user.email) {
      setEmail(user.email);
      const userBookMarks = localStorage.getItem("userBookMarks");
      if (userBookMarks) {
        const bookMarkMap: UserBookMarks = new Map(JSON.parse(userBookMarks));
        userBooKMarkMap.current = bookMarkMap;
        if (bookMarkMap.has(user.email))
          setBookmarks(bookMarkMap.get(user.email) ?? []);
      }
    }
    setIsLoading(false);
  }, [user]);

  useEffect(() => {
    setBookmarkIds(new Set(bookMarks.map((mark) => mark.id)));
  }, [bookMarks]);

  const addBookMark = async (repoToMark: GitRepo) => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));

      const newBookmark: BookMark = {
        id: repoToMark.id,
        name: repoToMark.name,
        full_name: repoToMark.full_name,
        description: repoToMark.description,
        html_url: repoToMark.html_url,
        owner: {
          login: repoToMark.owner.login,
          avatar_url: repoToMark.owner.avatar_url,
          html_url: repoToMark.owner.html_url,
        },
        stargazers_count: repoToMark.stargazers_count,
        forks_count: repoToMark.forks_count,
        language: repoToMark.language,
        bookmarked_at: new Date().toISOString(),
      };

      const updated = [...bookMarks, newBookmark];
      userBooKMarkMap.current.set(email, updated);
      localStorage.setItem(
        "userBookMarks",
        JSON.stringify(Array.from(userBooKMarkMap.current.entries()))
      );
      setBookmarks(updated);
    } catch (error) {
      console.error("Error bookmarking repository:", error);
    }
  };

  const removeBookMark = async (id: number) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const updated = bookMarks.filter((mark) => mark.id !== id);
    userBooKMarkMap.current.set(email, updated);
    localStorage.setItem(
      "userBookMarks",
      JSON.stringify(Array.from(userBooKMarkMap.current.entries()))
    );
    setBookmarks(updated);
  };

  const addMultipleBookMarks = async (newMarks: BookMark[]) => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const updated = [...bookMarks, ...newMarks];
      userBooKMarkMap.current.set(email, updated);
      localStorage.setItem(
        "userBookMarks",
        JSON.stringify(Array.from(userBooKMarkMap.current.entries()))
      );
      setBookmarks(updated);
    } catch (error) {
      console.error("Error bookmarking repository:", error);
    }
  };

  const isBookmarked = (repoId: number): boolean =>
    bookmarkIds.has(repoId);

  return (
    <BookMarkContext.Provider
      value={{
        bookMarks,
        addBookMark,
        isLoading,
        isBookmarked,
        removeBookMark,
        addMultipleBookMarks,
        bookmarkIds
      }}
    >
      {children}
    </BookMarkContext.Provider>
  );
}

export function useBookMarks() {
  const context = useContext(BookMarkContext);
  if (context === undefined) {
    throw new Error("useBookMarks must be used within an BookMarkProvider");
  }
  return context;
}
