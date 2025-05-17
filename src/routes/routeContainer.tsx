import Dashboard from "@/pages/Dashboard";
import { type FC } from "react";
import { BrowserRouter, Route, Routes } from "react-router";

const RouteContainer: FC = () => (
  <BrowserRouter>
    <Routes>
      <Route index element={<Dashboard />} />
    </Routes>
  </BrowserRouter>
);

export default RouteContainer;
