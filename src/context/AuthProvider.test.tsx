import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthProvider, useAuth } from './AuthProvider';
import React from 'react';
import '@testing-library/jest-dom';

const mockNavigate = vi.fn();
vi.mock('react-router', () => ({
  useNavigate: () => mockNavigate,
}));

function renderWithProvider(children: React.ReactNode) {
  return render(<AuthProvider>{children}</AuthProvider>);
}

describe('<AuthProvider />', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('provides default context values', () => {
    renderWithProvider(<TestComponent />);
    expect(screen.getByTestId('auth-user')).toHaveTextContent('null');
    expect(screen.getByTestId('auth-loading')).toHaveTextContent('false');
    expect(screen.getByTestId('auth-loggedin')).toHaveTextContent('false');
  });

  it('signup creates a new user and logs in', async () => {
    renderWithProvider(<TestComponent />);
    await screen.getByTestId('signup-btn').click();
    await waitFor(() => {
      expect(screen.getByTestId('auth-user')).toHaveTextContent('testuser');
      expect(screen.getByTestId('auth-loggedin')).toHaveTextContent('true');
    });
    expect(localStorage.getItem('user')).toContain('testuser');
    expect(localStorage.getItem('users')).toContain('test@email.com');
    expect(mockNavigate).toHaveBeenCalled();
    expect(
      mockNavigate.mock.calls.some(
        (args) => args[0] === '/' || args[0] === 0
      )
    ).toBe(true);
  });

  it('login with correct credentials logs in', async () => {
    const users = new Map([
      ['test@email.com', { name: 'testuser', password: btoa('password') }],
    ]);
    localStorage.setItem('users', JSON.stringify(Array.from(users.entries())));
    renderWithProvider(<TestComponent />);
    await screen.getByTestId('login-btn').click();
    await waitFor(() => {
      expect(screen.getByTestId('auth-loggedin')).toHaveTextContent('true');
    });
    expect(mockNavigate).toHaveBeenCalled();
  });

  it('login with wrong password throws error', async () => {
    const users = new Map([
      ['test@email.com', { name: 'testuser', password: btoa('password') }],
    ]);
    localStorage.setItem('users', JSON.stringify(Array.from(users.entries())));
    let loginFn: ((email: string, password: string) => Promise<void>) | undefined;
    renderWithProvider(<TestComponent onLoginReady={fn => { loginFn = fn; }} />);
    await waitFor(() => expect(typeof loginFn).toBe('function'));
    await expect(loginFn!('test@email.com', 'wrong')).rejects.toThrow('Incorrect password');
    expect(screen.getByTestId('auth-user')).toHaveTextContent('null');
    expect(screen.getByTestId('auth-loggedin')).toHaveTextContent('false');
  });

  it('logout clears user and navigates', async () => {
    localStorage.setItem('user', JSON.stringify({ name: 'testuser', email: 'test@email.com' }));
    renderWithProvider(<TestComponent />);
    await screen.getByTestId('logout-btn').click();
    expect(screen.getByTestId('auth-user')).toHaveTextContent('null');
    expect(screen.getByTestId('auth-loggedin')).toHaveTextContent('false');
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });
});

function TestComponent({ onLoginReady }: { onLoginReady?: (login: (email: string, password: string) => Promise<void>) => void }) {
  const { user, loading, isLoggedIn, login, signup, logout } = useAuth();
  React.useEffect(() => {
    if (onLoginReady) onLoginReady(login);
  }, [onLoginReady, login]);
  return (
    <div>
      <div data-testid="auth-user">{user ? user.name : 'null'}</div>
      <div data-testid="auth-loading">{loading ? 'true' : 'false'}</div>
      <div data-testid="auth-loggedin">{isLoggedIn ? 'true' : 'false'}</div>
      <button data-testid="signup-btn" onClick={() => signup('testuser', 'test@email.com', 'password')}>Signup</button>
      <button data-testid="login-btn" onClick={() => login('test@email.com', 'password')}>Login</button>
      <button data-testid="login-wrong-btn" onClick={() => login('test@email.com', 'wrong')}>LoginWrong</button>
      <button data-testid="logout-btn" onClick={logout}>Logout</button>
    </div>
  );
}
