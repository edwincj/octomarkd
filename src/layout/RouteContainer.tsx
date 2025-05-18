import Dashboard from "@/pages/dashboard";
import { type FC } from "react";
import { Navigate, Route, Routes } from "react-router";
import Layout from "./Layout";
import Login from "@/pages/login";
import Signup from "@/pages/signup";
import { useAuth } from "@/context/AuthProvider";
import ProtectedRoute from "./ProtectedRoute";

const RouteContainer: FC = () => {
  const { isLoggedIn } = useAuth();
  return (
    <Routes>
      <Route
        path="/login"
        element={isLoggedIn ? <Navigate to="/" replace /> : <Login />}
      />
      <Route
        path="/signup"
        element={isLoggedIn ? <Navigate to="/" replace /> : <Signup />}
      />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
      </Route>
    </Routes>
  );
};

export default RouteContainer;
