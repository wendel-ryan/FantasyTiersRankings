import { Navigate, Outlet } from "react-router-dom";

export default function PublicRoute() {
  const token = localStorage.getItem("access_token");
  // if logged in, go to home; otherwise, show public route
  return token ? <Navigate to="/home" replace /> : <Outlet />;
}
