import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Signup from './index';
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

const signupMock = vi.fn();
vi.mock('@/context/AuthProvider', () => ({
  useAuth: () => ({ signup: signupMock }),
}));

describe('Signup Page', () => {
  beforeEach(() => {
    signupMock.mockReset();
  });

  it('renders signup form', () => {
    render(<Signup />);
    expect(screen.getByRole('heading', { name: /create an account/i })).toBeInTheDocument();
    expect(screen.getByLabelText('Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByLabelText('Confirm Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
  });

  it('shows error if passwords do not match', async () => {
    render(<Signup />);
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Test User' } });
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password123' } });
    fireEvent.change(screen.getByLabelText('Confirm Password'), { target: { value: 'password456' } });
    fireEvent.click(screen.getByRole('button', { name: /create account/i }));
    await waitFor(() => {
      expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
    });
  });

  it('calls signup on valid submit', async () => {
    signupMock.mockResolvedValueOnce(undefined);
    render(<Signup />);
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Test User' } });
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password123' } });
    fireEvent.change(screen.getByLabelText('Confirm Password'), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /create account/i }));
    await waitFor(() => {
      expect(signupMock).toHaveBeenCalledWith('Test User', 'test@example.com', 'password123');
    });
  });

  it('shows error on signup failure', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    signupMock.mockRejectedValueOnce(new Error('fail'));
    render(<Signup />);
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Test User' } });
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'fail@example.com' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password123' } });
    fireEvent.change(screen.getByLabelText('Confirm Password'), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /create account/i }));
    await waitFor(() => {
      expect(screen.getByText('Failed to create account')).toBeInTheDocument();
    });
    errorSpy.mockRestore();
  });

  it('disables button and shows loader when loading', async () => {
    let resolveSignup: (value?: unknown) => void = () => {};
    signupMock.mockImplementation(
      () => new Promise((resolve) => { resolveSignup = resolve; })
    );
    render(<Signup />);
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Test User' } });
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'slow@example.com' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'slowpass' } });
    fireEvent.change(screen.getByLabelText('Confirm Password'), { target: { value: 'slowpass' } });
    fireEvent.click(screen.getByRole('button', { name: /create account/i }));
    expect(screen.getByRole('button', { name: /creating account/i })).toBeDisabled();
    resolveSignup();
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /create account/i })).not.toBeDisabled();
    });
  });
});
