import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../app/authContext";

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated || !user) {
    const from = `${location.pathname}${location.search}${location.hash}`;
    return <Navigate to="/login" replace state={{ from }} />;
  }

  return children;
};

export default PrivateRoute;
