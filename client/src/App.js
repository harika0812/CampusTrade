import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Marketplace from "./pages/Marketplace";
import ProductDetails from "./pages/ProductDetails";
import MyListings from "./pages/MyListings";
import CreateListing from "./pages/CreateListing";
import EditListing from "./pages/EditListing";
import Chat from "./pages/Chat";
import VerifyEmail from "./pages/VerifyEmail";
import Cart from "./pages/Cart";
import Profile from "./pages/Profile";
import MyOrders from "./pages/MyOrders";
import SellerOrders from "./pages/SellerOrders";
import Notifications from "./pages/Notifications";
import PrivateRoute from "./routes/PrivateRoute";
import { useEffect, useState } from "react";
import GlobalLoader from "./components/Loader/GlobalLoader";
import GlobalToast from "./components/Modal/GlobalToast";
import { setSessionExpiredHandler } from "./api/axios";
import SessionExpiredModal from "./components/Modal/SessionExpiredModal";
import { useAuth } from "./app/authContext";
import { refreshToken as refreshTokenApi } from "./api/auth.api";

function useScrollAndTitle() {
  const location = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
    // Dynamic title logic
    const routeTitles = {
      "/": "CampusTrade – Home",
      "/login": "CampusTrade – Login",
      "/register": "CampusTrade – Register",
      "/forgot-password": "CampusTrade – Forgot Password",
      "/reset-password": "CampusTrade – Reset Password",
      "/marketplace": "CampusTrade – Marketplace",
      "/cart": "CampusTrade – Cart",
      "/profile": "CampusTrade – Profile",
      "/orders": "CampusTrade – My Orders",
      "/seller-orders": "CampusTrade – Seller Orders",
      "/notifications": "CampusTrade – Notifications",
      "/my-listings": "CampusTrade – My Listings",
      "/create-listing": "CampusTrade – Create Listing",
      "/edit-listing": "CampusTrade – Edit Listing",
      "/chat": "CampusTrade – Chat",
      "/verify": "CampusTrade – Verify Email"
    };
    let title = routeTitles[location.pathname] || "CampusTrade";
    if (location.pathname.startsWith("/products/")) title = "CampusTrade – Product Details";
    document.title = title;
  }, [location]);
}

function App() {
    useScrollAndTitle();
  const [sessionExpired, setSessionExpired] = useState(false);
  const [globalLoading, setGlobalLoading] = useState(false);
  const [toast, setToast] = useState({ open: false, message: "", type: "info" });
  const navigate = useNavigate();
  const { logout } = useAuth();

  useEffect(() => {
    setSessionExpiredHandler(() => {
      logout();
      setSessionExpired(true);
    });
  }, [logout]);

  useEffect(() => {
    let cancelled = false;

    const bootstrapSession = async () => {
      const hasStoredUser = Boolean(localStorage.getItem("user"));
      const hasStoredToken = Boolean(localStorage.getItem("token"));

      if (!hasStoredUser || !hasStoredToken) return;

      setGlobalLoading(true);
      try {
        const data = await refreshTokenApi();
        if (!cancelled && data?.token) {
          localStorage.setItem("token", data.token);
        }
      } catch {
        if (!cancelled) {
          logout();
        }
      } finally {
        if (!cancelled) {
          setGlobalLoading(false);
        }
      }
    };

    bootstrapSession();

    return () => {
      cancelled = true;
    };
  }, [logout]);

  const handleLogin = () => {
    setSessionExpired(false);
    navigate("/login");
  };


  // Expose setGlobalLoading and showGlobalToast globally for use in child components
  window.setGlobalLoading = setGlobalLoading;
  window.showGlobalToast = (message, type = "info") => {
    setToast({ open: true, message, type });
  };

  return (
    <>
      <GlobalLoader open={globalLoading} />
      <GlobalToast
        open={toast.open}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ ...toast, open: false })}
      />
      <SessionExpiredModal open={sessionExpired} onLogin={handleLogin} />
      <Navbar />
      <main className="app-main">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/marketplace" element={<PrivateRoute><Marketplace /></PrivateRoute>} />
          <Route path="/products/:id" element={<PrivateRoute><ProductDetails /></PrivateRoute>} />
          <Route path="/my-listings" element={<PrivateRoute><MyListings /></PrivateRoute>} />
          <Route path="/create-listing" element={<PrivateRoute><CreateListing /></PrivateRoute>} />
          <Route path="/edit-listing/:id" element={<PrivateRoute><EditListing /></PrivateRoute>} />
          <Route path="/chat" element={<PrivateRoute><Chat /></PrivateRoute>} />
          <Route path="/cart" element={<PrivateRoute><Cart /></PrivateRoute>} />
          <Route path="/orders" element={<PrivateRoute><MyOrders /></PrivateRoute>} />
          <Route path="/seller-orders" element={<PrivateRoute><SellerOrders /></PrivateRoute>} />
          <Route path="/notifications" element={<PrivateRoute><Notifications /></PrivateRoute>} />
          <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
          <Route path="/verify" element={<VerifyEmail />} />
        </Routes>
      </main>
    </>
  );
}

export default App;
