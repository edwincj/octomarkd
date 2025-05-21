import { render, screen, fireEvent } from '@testing-library/react';
import BookmarksPage from './index';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom';

vi.mock('./Bookmarks', () => ({
  __esModule: true,
  default: () => <div data-testid="bookmarks-component">BookmarksComponent</div>,
}));
vi.mock('./Stats', () => ({
  Stats: () => <div data-testid="stats-component">StatsComponent</div>,
}));

const useBookMarksMock = vi.fn();
vi.mock('@/context/BookMarkProvider', () => ({
  useBookMarks: () => useBookMarksMock(),
}));

describe('BookmarksPage', () => {
  beforeEach(() => {
    useBookMarksMock.mockReset();
  });

  it('renders Bookmarks tab and Bookmarks component by default', () => {
    useBookMarksMock.mockReturnValue({ bookMarks: [1, 2, 3] });
    render(<BookmarksPage />);
    expect(screen.getByText('Bookmarks')).toBeInTheDocument();
    expect(screen.getByTestId('bookmarks-component')).toBeInTheDocument();
    expect(screen.getByText('Stats')).toBeInTheDocument();
  });

  it('disables Stats tab when there are no bookmarks', () => {
    useBookMarksMock.mockReturnValue({ bookMarks: [] });
    render(<BookmarksPage />);
    const statsButton = screen.getByText('Stats');
    expect(statsButton).toBeDisabled();
  });

  it('shows Stats component when Stats tab is clicked and bookmarks exist', () => {
    useBookMarksMock.mockReturnValue({ bookMarks: [1] });
    render(<BookmarksPage />);
    const statsButton = screen.getByRole('tab',{name: /stats/i});
    fireEvent.mouseDown(statsButton);
    expect(screen.getByTestId('stats-component')).toBeInTheDocument();
  });
});
