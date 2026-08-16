import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../app/authContext";

const PublicRoute = () => {
  const { isAuthenticated } = useAuth();

  return isAuthenticated ? <Navigate to="/marketplace" replace /> : <Outlet />;
};

export default PublicRoute;
