import Dashboard from "@/pages/Dashboard";
import { type FC } from "react";
import { BrowserRouter, Route, Routes } from "react-router";
import Layout from "./Layout";

const RouteContainer: FC = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
      </Route>
    </Routes>
  </BrowserRouter>
);

export default RouteContainer;
