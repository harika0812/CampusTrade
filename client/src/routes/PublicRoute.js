import { Navigate, Outlet } from "react-router-dom";

const PublicRoute = () => {
  const token = localStorage.getItem("token");

  // If logged in, redirect to marketplace
  return token ? <Navigate to="/marketplace" /> : <Outlet />;
};

export default PublicRoute;
