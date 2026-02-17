import { Routes, Route } from "react-router-dom";
import Landing from "../pages/Landing";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Marketplace from "../pages/Marketplace";
import ProductDetails from "../pages/ProductDetails";
import CreateListing from "../pages/CreateListing";
import MyListings from "../features/profile/MyListings";
import PrivateRoute from "./PrivateRoute";
import VerifyEmail from "../pages/VerifyEmail";

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/marketplace" element={<Marketplace />} />
      <Route path="/products/:id" element={<ProductDetails />} />

      {/* Protected */}
      <Route
        path="/sell"
        element={
          <PrivateRoute>
            <CreateListing />
          </PrivateRoute>
        }
      />

      <Route
        path="/my-listings"
        element={
          <PrivateRoute>
            <MyListings />
          </PrivateRoute>
        }
      />
      <Route path="/verify" element={<VerifyEmail />} />
    </Routes>
  );
};

export default AppRoutes;
