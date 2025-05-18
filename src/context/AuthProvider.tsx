import type { User } from "@/types";
import type React from "react";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";

type AuthContextType = {
  user: Omit<User, "password"> | null;
  loading: boolean;
  isLoggedIn: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Omit<User, "password"> | null>(null);
  const userList = useRef<Map<string, Omit<User, "email">>>(new Map());
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const users = localStorage.getItem("users");
    if (users) {
      userList.current = new Map(JSON.parse(users));
    }
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      if (!userList.current.has(email)) {
        navigate("/signup");
        throw new Error("User does not exit");
      }

      if (userList.current.get(email)?.password !== btoa(password))
        throw new Error("Incorrect password");

      const userToken = JSON.stringify({ ...user, email });
      localStorage.setItem("user", userToken);
      setUser({ name: userList.current.get(email)?.name ?? "", email });
      const pathname = window.location.pathname;
      if (pathname === "/login" || pathname === "/signup") {
        navigate("/");
      } else {
        navigate(0);
      }
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (name: string, email: string, password: string) => {
    setLoading(true);
    try {
      if (userList.current.has(email)) throw new Error("User already exists");

      const user = { name, password: btoa(password) };
      console.log(userList.current)
      const updatedUsers = new Map(userList.current);
      updatedUsers.set(email, user);
      localStorage.setItem("users", JSON.stringify(Array.from(updatedUsers.entries())));
      userList.current = updatedUsers;
      const userToken = JSON.stringify({ ...user, email });
      localStorage.setItem("user", userToken);
      setUser({ name, email });

      const pathname = window.location.pathname;
      if (pathname === "/login" || pathname === "/signup") {
        navigate("/");
      } else {
        navigate(0);
      }
    } catch (error) {
      console.error("Signup failed:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("user");
    setUser(null);
    navigate("/");
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, isLoggedIn: Boolean(user) }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
