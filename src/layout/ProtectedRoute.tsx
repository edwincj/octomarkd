import { useAuth } from "@/context/AuthProvider";
import { useBookMarks } from "@/context/BookMarkProvider";
import { Loader2 } from "lucide-react";
import type { JSX } from "react";
import { Navigate } from "react-router";

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { isLoggedIn, loading } = useAuth();
  const { isLoading } = useBookMarks();
  console.log(isLoggedIn, loading);
  if (loading || isLoading)
    return (
      <div className="w-screen h-screen flex items-center justify-center">
        <Loader2 className="h-20 w-20 animate-spin" />
      </div>
    );
  return isLoggedIn ? children : <Navigate to="/login" />;
};

export default ProtectedRoute;
