import { render, screen } from "@testing-library/react";
import { Stats } from "./Stats";
import { describe, it, expect, vi} from 'vitest';
import '@testing-library/jest-dom';

vi.mock("@/context/BookMarkProvider", () => ({
  useBookMarks: () => ({
    bookMarks: [],
  }),
}));

const useBookMarksMock = vi.fn();
vi.mock('@/context/BookMarkProvider', () => ({
  useBookMarks: () => useBookMarksMock(),
}));

vi.mock("recharts", () => ({
  Bar: () => <div data-testid="bar" />,
  BarChart: ({ children }: any) => <div data-testid="barchart">{children}</div>,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  XAxis: () => <div data-testid="x-axis" />,
}));
vi.mock("@/components/ui/chart", () => ({
  ChartContainer: ({ children }: any) => <div data-testid="chart-container">{children}</div>,
  ChartTooltip: ({ children }: any) => <div data-testid="chart-tooltip">{children}</div>,
  ChartTooltipContent: ({ children }: any) => <div data-testid="chart-tooltip-content">{children}</div>,
}));

const mockBookmarks = [
  {
    id: 1,
    name: "repo1",
    full_name: "user1/repo1",
    description: "desc1",
    html_url: "https://github.com/user1/repo1",
    owner: { login: "user1", avatar_url: "", html_url: "" },
    stargazers_count: 5,
    forks_count: 2,
    language: "TypeScript",
    bookmarked_at: "2024-05-20T12:00:00.000Z",
  },
  {
    id: 2,
    name: "repo2",
    full_name: "user2/repo2",
    description: "desc2",
    html_url: "https://github.com/user2/repo2",
    owner: { login: "user2", avatar_url: "", html_url: "" },
    stargazers_count: 10,
    forks_count: 3,
    language: "JavaScript",
    bookmarked_at: "2024-05-20T15:00:00.000Z",
  },
  {
    id: 3,
    name: "repo3",
    full_name: "user3/repo3",
    description: "desc3",
    html_url: "https://github.com/user3/repo3",
    owner: { login: "user3", avatar_url: "", html_url: "" },
    stargazers_count: 7,
    forks_count: 1,
    language: "Python",
    bookmarked_at: "2024-05-21T10:00:00.000Z",
  },
];

describe("<Stats />", () => {
  it("renders chart card and headings", () => {
    useBookMarksMock.mockReturnValue({ bookMarks: mockBookmarks });
    render(<Stats />);
    expect(screen.getByText(/bar chart - interactive/i)).toBeInTheDocument();
    expect(screen.getByText(/showing number of repositories bookmarked by date/i)).toBeInTheDocument();
    expect(screen.getByTestId("chart-container")).toBeInTheDocument();
    expect(screen.getByTestId("barchart")).toBeInTheDocument();
    expect(screen.getByTestId("bar")).toBeInTheDocument();
    expect(screen.getByTestId("x-axis")).toBeInTheDocument();
    expect(screen.getByTestId("cartesian-grid")).toBeInTheDocument();
  });

  it("groups bookmarks by date for chart data", () => {
    useBookMarksMock.mockReturnValue({ bookMarks: mockBookmarks });
    render(<Stats />);
    expect(screen.getByTestId("barchart")).toBeInTheDocument();
  });

  it("handles empty bookmarks gracefully", () => {
    useBookMarksMock.mockReturnValue({ bookMarks: [] });
    render(<Stats />);
    expect(screen.getByTestId("barchart")).toBeInTheDocument();
  });
});
