import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import Bookmarks from "./Bookmarks";
import * as githubService from '@/services/github';
const mockedGithub = vi.mocked(githubService);
import Papa from 'papaparse';
import '@testing-library/jest-dom';

const useBookMarksMock = vi.fn();
vi.mock("@/context/BookMarkProvider", () => ({ useBookMarks: () => useBookMarksMock() }));
vi.mock("lucide-react", () => ({
  Loader2: () => <div data-testid="loader2" />,
  Bookmark: () => <div data-testid="icon-bookmark" />,
  GitFork: () => <div data-testid="icon-gitfork" />,
  Star: () => <div data-testid="icon-star" />,
  Trash: () => <div data-testid="icon-trash" />,
  Upload: () => <div data-testid="icon-upload" />,
}));
vi.mock("react-router", () => ({ NavLink: ({ to, children }: any) => <a href={to}>{children}</a> }));

const baseBookmark = {
  id: 1,
  name: "baseBookmarkName",
  full_name: "baseBookmarkOwner/baseBookmarkName",
  description: "A test repo",
  html_url: "https://github.com/baseBookmarkOwner/baseBookmarkName",
  owner: {
    login: "baseBookmarkOwner",
    avatar_url: "https://avatars.githubusercontent.com/u/1?v=4",
    html_url: "https://github.com/baseBookmarkOwner",
  },
  stargazers_count: 42,
  forks_count: 7,
  language: "TypeScript",
  bookmarked_at: new Date().toISOString(),
};

describe("<Bookmarks />", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(githubService, 'validateRepository').mockReset();
    useBookMarksMock.mockReturnValue({
      bookMarks: [],
      isLoading: false,
      removeBookMark: vi.fn(),
      addMultipleBookMarks: vi.fn(),
      bookmarkIds: new Set(),
    });
  });

  it("renders empty state and search button", () => {
    render(<Bookmarks />);
    expect(screen.getByText(/no bookmarks yet/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /search repositories/i })).toBeInTheDocument();
  });

  it("renders loading state", () => {
    useBookMarksMock.mockReturnValue({
      bookMarks: [],
      isLoading: true,
      removeBookMark: vi.fn(),
      addMultipleBookMarks: vi.fn(),
      bookmarkIds: new Set(),
    });
    render(<Bookmarks />);
    expect(screen.getByTestId("loader2")).toBeInTheDocument();
  });

  it("renders bookmarks list", () => {
    useBookMarksMock.mockReturnValue({
      bookMarks: [baseBookmark],
      isLoading: false,
      removeBookMark: vi.fn(),
      addMultipleBookMarks: vi.fn(),
      bookmarkIds: new Set([1]),
    });
    render(<Bookmarks />);
    expect(screen.getByText(baseBookmark.name)).toBeInTheDocument();
    expect(screen.getByText(baseBookmark.owner.login)).toBeInTheDocument();
    expect(screen.getByText(baseBookmark.description)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /view repository/i })).toHaveAttribute("href", baseBookmark.html_url);
  });

  it("calls removeBookMark when delete is clicked", async () => {
    const removeBookMark = vi.fn();
    useBookMarksMock.mockReturnValue({
      bookMarks: [baseBookmark],
      isLoading: false,
      removeBookMark,
      addMultipleBookMarks: vi.fn(),
      bookmarkIds: new Set([1]),
    });
    render(<Bookmarks />);
    const deleteBtn = screen.getByRole("button", { name: "" });
    await userEvent.click(deleteBtn);
    await waitFor(() => expect(removeBookMark).toHaveBeenCalledWith(1));
  });

  it("disables import button when no file is selected", () => {
    render(<Bookmarks />);
    const importBtn = screen.getByRole("button", { name: /import/i });
    expect(importBtn).toBeDisabled();
  });

  it("enables import button when file is selected", async () => {
    render(<Bookmarks />);
    const file = new File(["full_name,date\noctocat/Hello-World,2024-01-01"], "test.csv", { type: "text/csv" });
    const input = screen.getByLabelText(/csv file/i);
    await userEvent.upload(input, file);
    const importBtn = screen.getByRole("button", { name: /import/i });
    expect(importBtn).toBeEnabled();
  });

  it("shows loading and success alert on successful import", async () => {
    const addMultipleBookMarks = vi.fn();
    useBookMarksMock.mockReturnValue({
      bookMarks: [],
      isLoading: false,
      removeBookMark: vi.fn(),
      addMultipleBookMarks,
      bookmarkIds: new Set(),
    });
    vi.spyOn(Papa, 'parse').mockImplementation((file: File, opts: any) => {
      opts.complete({
        data: [{ full_name: "octocat/Hello-World", date: "2024-01-01" }],
        errors: [],
      });
    });
    mockedGithub.validateRepository.mockResolvedValue({
      id: 2,
      name: "Hello-World",
      full_name: "octocat/Hello-World",
      description: "desc",
      html_url: "https://github.com/octocat/Hello-World",
      owner: { login: "octocat", avatar_url: "", html_url: "" },
      stargazers_count: 1,
      forks_count: 2,
      language: "JS",
      node_id: "",
      private: false,
      fork: false,
      url: "",
    });
    render(<Bookmarks />);
    const file = new File(["full_name,date\noctocat/Hello-World,2024-01-01"], "test.csv", { type: "text/csv" });
    const input = screen.getByLabelText(/csv file/i);
    await userEvent.upload(input, file);
    const importBtn = screen.getByRole("button", { name: /import/i });
    await userEvent.click(importBtn);
    expect(await screen.findByText(/successfully imported/i)).toBeInTheDocument();
    expect(addMultipleBookMarks).toHaveBeenCalled();
  });

  it("shows error alert if CSV parse fails", async () => {
    useBookMarksMock.mockReturnValue({
      bookMarks: [],
      isLoading: false,
      removeBookMark: vi.fn(),
      addMultipleBookMarks: vi.fn(),
      bookmarkIds: new Set(),
    });
    vi.spyOn(Papa, 'parse').mockImplementation((_file, opts) => {
      opts.complete({ data: [], errors: [{ message: "Parse error" }] });
    });
    render(<Bookmarks />);
    const file = new File(["bad"], "bad.csv", { type: "text/csv" });
    const input = screen.getByLabelText(/csv file/i);
    await userEvent.upload(input, file);
    const importBtn = screen.getByRole("button", { name: /import/i });
    await userEvent.click(importBtn);
    expect(await screen.findByText(/error importing csv file/i)).toBeInTheDocument();
  });

  it("shows error alert if validateRepository throws", async () => {
    useBookMarksMock.mockReturnValue({
      bookMarks: [],
      isLoading: false,
      removeBookMark: vi.fn(),
      addMultipleBookMarks: vi.fn(),
      bookmarkIds: new Set(),
    });
    mockedGithub.validateRepository.mockRejectedValue(new Error("API error"));
    render(<Bookmarks />);
    const file = new File(["full_name,date\noctocat/Hello-World,2024-01-01"], "test.csv", { type: "text/csv" });
    const input = screen.getByLabelText(/csv file/i);
    await userEvent.upload(input, file);
    const importBtn = screen.getByRole("button", { name: /import/i });
    await userEvent.click(importBtn);
    expect(await screen.findByText(/error importing csv file/i)).toBeInTheDocument();
  });
});
