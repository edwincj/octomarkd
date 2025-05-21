import { render, screen } from '@testing-library/react';
import App from './App';
import { describe, it, expect, vi } from 'vitest';
import '@testing-library/jest-dom';

vi.mock('@/layout/RouteContainer', () => ({
  default: () => <div data-testid="route-container">RouteContainer</div>,
}));

describe('App', () => {
  it('renders without crashing and shows RouteContainer', () => {
    render(<App />);
    expect(screen.getByTestId('route-container')).toBeInTheDocument();
  });
});
