import { Navigate } from "react-router-dom";
import { useAuth } from "../app/authContext";

const PrivateRoute = ({ children }) => {
  const { user } = useAuth();
  const token = localStorage.getItem("token");

  if (!user || !token) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default PrivateRoute;
