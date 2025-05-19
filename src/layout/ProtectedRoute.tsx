import { useAuth } from "@/context/AuthProvider";
import type { JSX } from "react";
import { Navigate } from "react-router";

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { isLoggedIn, loading } = useAuth();
  console.log(isLoggedIn, loading)
  if(loading) return <>Loading.......</>
  return  isLoggedIn ? children : <Navigate to="/login" />;
};

export default ProtectedRoute;
