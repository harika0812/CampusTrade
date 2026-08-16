import { Link, useNavigate } from "react-router-dom";
import { useContext, useEffect, useRef, useState } from "react";
import { useAuth } from "../app/authContext";
import { ChatContext } from "../features/chat/ChatContext";
import { logoutUser } from "../api/auth.api";
import { CART_UPDATED_EVENT, getCart } from "../api/cart.api";
import { getOrderNotifications } from "../api/payment.api";
import { ShoppingBag, Plus, Package, MessageCircle, ShoppingCart, LogOut, Settings, Bell } from "lucide-react";
import "./Navbar.css";

const NOTIFICATION_READ_EVENT = "notification-read-updated";

const getNotificationReadKey = (userId) => `campustrade_notifications_last_read_${userId}`;

const markNotificationsAsRead = (userId) => {
  if (!userId) return;
  localStorage.setItem(getNotificationReadKey(userId), String(Date.now()));
  window.dispatchEvent(new Event(NOTIFICATION_READ_EVENT));
};

const Navbar = () => {
  const auth = useAuth();
  const user = auth?.user;
  const navigate = useNavigate();
  const chatContext = useContext(ChatContext);
  const [cartCount, setCartCount] = useState(0);
  const [notificationCount, setNotificationCount] = useState(0);
  const [profileOpen, setProfileOpen] = useState(false);
  const { logout } = auth;
  const userId = user?.id || user?._id || user?.userId;
  const profileMenuRef = useRef(null);

  // Get chat count from ChatContext (replaces polling)
  const chatCount = chatContext?.unreadTotalCount || 0;

  useEffect(() => {
    let isMounted = true;

    const loadCartCount = async () => {
      if (!userId) {
        if (isMounted) setCartCount(0);
        return;
      }

      try {
        const cart = await getCart();
        if (isMounted) setCartCount(cart?.totalItems || 0);
      } catch {
        if (isMounted) setCartCount(0);
      }
    };

    const loadNotificationCount = async () => {
      if (!userId) {
        if (isMounted) setNotificationCount(0);
        return;
      }

      try {
        const notifications = await getOrderNotifications();
        const allNotifications = (notifications?.notifications || []).filter((item) => item?.type !== "chat");
        const lastRead = Number(localStorage.getItem(getNotificationReadKey(userId)) || 0);

        const unreadCount = allNotifications.filter((item) => {
          const createdAt = new Date(item?.createdAt || 0).getTime();
          return createdAt > lastRead;
        }).length;

        if (isMounted) {
          setNotificationCount(unreadCount);
        }
      } catch {
        if (isMounted) setNotificationCount(0);
      }
    };

    const handleCartUpdated = (event) => {
      const nextCount = event?.detail?.totalItems;
      if (typeof nextCount === "number") {
        setCartCount(nextCount);
      } else {
        loadCartCount();
      }
    };

    const handleNotificationRead = () => {
      loadNotificationCount();
    };

    const loadAllBadges = () => {
      loadCartCount();
      loadNotificationCount();
    };

    loadAllBadges();

    // Keep polling modest on production to reduce request bursts and UI jank.
    const notificationInterval = setInterval(() => {
      if (document.visibilityState === "visible") loadNotificationCount();
    }, 45000);

    window.addEventListener(CART_UPDATED_EVENT, handleCartUpdated);
    window.addEventListener(NOTIFICATION_READ_EVENT, handleNotificationRead);

    return () => {
      isMounted = false;
      clearInterval(notificationInterval);
      window.removeEventListener(CART_UPDATED_EVENT, handleCartUpdated);
      window.removeEventListener(NOTIFICATION_READ_EVENT, handleNotificationRead);
    };
  }, [userId]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!profileOpen) return;
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [profileOpen]);

  const handleLoginClick = (event) => {
    event.preventDefault();
    navigate("/login");
  };

  const handleRegisterClick = (event) => {
    event.preventDefault();
    navigate("/register");
  };

  return (
    <nav className="navbar">
      <Link to="/" className="logo">CampusTrade</Link>

      <div className="nav-right">
        {!user ? (
          <>
            <a href="/login" onClick={handleLoginClick} className="btn btn-outline">Login</a>
            <a href="/register" onClick={handleRegisterClick} className="btn btn-primary">Register</a>
          </>
        ) : (
          <div className="nav-auth-links">
            <button className="nav-link-btn" onClick={() => navigate("/marketplace")} title="Marketplace">
              <ShoppingBag size={20} />
            </button>
            <button className="nav-link-btn" onClick={() => navigate("/create-listing")} title="Sell">
              <Plus size={20} />
            </button>
            <button className="nav-link-btn" onClick={() => navigate("/my-listings")} title="My Listings">
              <Package size={20} />
            </button>
            <button className="nav-link-btn" onClick={() => navigate("/chat")} title="Chat">
              <MessageCircle size={20} />
              {chatCount > 0 && <span className="cart-count">{chatCount}</span>}
            </button>

            <button
              className="cart-icon-btn"
              onClick={() => {
                markNotificationsAsRead(userId);
                setNotificationCount(0);
                navigate("/notifications");
              }}
              aria-label="Open notifications"
              title="Notifications"
            >
              <Bell size={20} />
              {notificationCount > 0 && <span className="cart-count">{notificationCount}</span>}
            </button>

            <button className="cart-icon-btn" onClick={() => navigate("/cart")} aria-label="Open cart" title="Cart">
              <ShoppingCart size={20} />
              {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
            </button>

            <div
              className="profile-menu-wrap"
              ref={profileMenuRef}
            >
              <button
                className="profile-circle"
                onClick={() => setProfileOpen((prev) => !prev)}
                aria-label="Open profile menu"
              >
                {user.name?.charAt(0).toUpperCase()}
              </button>

              {profileOpen && (
                <div className="profile-menu">
                  <button
                    onClick={() => {
                      setProfileOpen(false);
                      markNotificationsAsRead(userId);
                      setNotificationCount(0);
                      navigate("/notifications");
                    }}
                  >
                    <Bell size={16} /> Notifications
                  </button>

                  <button
                    onClick={() => {
                      setProfileOpen(false);
                      navigate("/orders");
                    }}
                  >
                    <Package size={16} /> My Orders
                  </button>

                  <button
                    onClick={() => {
                      setProfileOpen(false);
                      navigate("/seller-orders");
                    }}
                  >
                    <Package size={16} /> Sales
                  </button>

                  <button
                    onClick={() => {
                      setProfileOpen(false);
                      navigate("/profile");
                    }}
                  >
                    <Settings size={16} /> Edit Profile
                  </button>

                  <button
                    className="logout"
                    onClick={async () => {
                      setProfileOpen(false);
                      try {
                        await logoutUser();
                      } catch {
                        // Ignore server-side logout failures so the client still clears local session state.
                      } finally {
                        logout();
                        navigate("/login");
                      }
                    }}
                  >
                    <LogOut size={16} /> Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;