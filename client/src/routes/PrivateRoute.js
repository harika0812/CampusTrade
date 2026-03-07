import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../app/authContext";

const PrivateRoute = ({ children }) => {
  const { user } = useAuth();
  const location = useLocation();
  const token = localStorage.getItem("token");

  if (!user || !token) {
    const from = `${location.pathname}${location.search}${location.hash}`;
    return <Navigate to="/login" replace state={{ from }} />;
  }

  return children;
};

export default PrivateRoute;
