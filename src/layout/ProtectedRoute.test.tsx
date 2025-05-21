import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import ProtectedRoute from "./ProtectedRoute";
import '@testing-library/jest-dom';

const useAuthMock = vi.fn();
const useBookMarksMock = vi.fn();

vi.mock("@/context/AuthProvider", () => ({
  useAuth: () => useAuthMock(),
}));
vi.mock("@/context/BookMarkProvider", () => ({
  useBookMarks: () => useBookMarksMock(),
}));
vi.mock("lucide-react", () => ({
  Loader2: () => <div data-testid="loader2" />,
}));
vi.mock("react-router", () => ({
  Navigate: ({ to }: any) => <div data-testid="navigate" data-to={to} />,
}));

const DummyChild = () => <div data-testid="child">Protected Content</div>;

describe("<ProtectedRoute />", () => {
  it("renders loader when auth is loading", () => {
    useAuthMock.mockReturnValue({ isLoggedIn: false, loading: true });
    useBookMarksMock.mockReturnValue({ isLoading: false });
    render(
      <ProtectedRoute>
        <DummyChild />
      </ProtectedRoute>
    );
    expect(screen.getByTestId("loader2")).toBeInTheDocument();
  });

  it("renders loader bookmarks are loading", () => {
    useAuthMock.mockReturnValue({ isLoggedIn: false, loading: false });
    useBookMarksMock.mockReturnValue({ isLoading: true });
    render(
      <ProtectedRoute>
        <DummyChild />
      </ProtectedRoute>
    );
    expect(screen.getByTestId("loader2")).toBeInTheDocument();
  });

  it("renders children if logged in and not loading", () => {
    useAuthMock.mockReturnValue({ isLoggedIn: true, loading: false });
    useBookMarksMock.mockReturnValue({ isLoading: false });
    render(
      <ProtectedRoute>
        <DummyChild />
      </ProtectedRoute>
    );
    expect(screen.getByTestId("child")).toBeInTheDocument();
  });

  it("redirects to /login if not logged in and not loading", () => {
    useAuthMock.mockReturnValue({ isLoggedIn: false, loading: false });
    useBookMarksMock.mockReturnValue({ isLoading: false });
    render(
      <ProtectedRoute>
        <DummyChild />
      </ProtectedRoute>
    );
    expect(screen.getByTestId("navigate")).toHaveAttribute("data-to", "/login");
  });
});
