import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Login from './index';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom';

vi.mock('@/components/ui/button', () => ({
  Button: (props: any) => <button {...props} />,
}));
vi.mock('@/components/ui/input', () => ({
  Input: (props: any) => <input {...props} />,
}));
vi.mock('@/components/ui/label', () => ({
  Label: (props: any) => <label {...props} />,
}));
vi.mock('@/components/ui/card', () => ({
  Card: (props: any) => <div>{props.children}</div>,
  CardContent: (props: any) => <div>{props.children}</div>,
  CardDescription: (props: any) => <div>{props.children}</div>,
  CardFooter: (props: any) => <div>{props.children}</div>,
  CardHeader: (props: any) => <div>{props.children}</div>,
  CardTitle: (props: any) => <h2>{props.children}</h2>,
}));
vi.mock('lucide-react', () => ({
  FolderGit: () => <div>FolderGit</div>,
  Loader2: () => <div>Loader2</div>,
}));
vi.mock('react-router', () => ({
  NavLink: (props: any) => <a {...props} />,
}));

const loginMock = vi.fn();
vi.mock('@/context/AuthProvider', () => ({
  useAuth: () => ({ login: loginMock }),
}));

describe('Login Page', () => {
  beforeEach(() => {
    loginMock.mockReset();
  });

  it('renders login form', () => {
    render(<Login />);
    expect(screen.getByRole('heading', { name: /login/i })).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  it('calls login on submit', async () => {
    loginMock.mockResolvedValueOnce(undefined);
    render(<Login />);
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));
    await waitFor(() => {
      expect(loginMock).toHaveBeenCalledWith('test@example.com', 'password123');
    });
  });

  it('shows error on login failure', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    loginMock.mockRejectedValueOnce(new Error('fail'));
    render(<Login />);
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'fail@example.com' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'badpass' } });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));
    await waitFor(() => {
      expect(screen.getByText('Invalid email or password')).toBeInTheDocument();
    });
    errorSpy.mockRestore();
  });

  it('disables button and shows loader when loading', async () => {
    let resolveLogin: (value?: unknown) => void = () => {};
    loginMock.mockImplementation(
      () => new Promise((resolve) => { resolveLogin = resolve; })
    );
    render(<Login />);
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'slow@example.com' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'slowpass' } });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));
    expect(screen.getByRole('button', { name: /logging in/i })).toBeDisabled();
    resolveLogin();
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /login/i })).not.toBeDisabled();
    });
  });
});
