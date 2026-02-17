import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../app/authContext";
import "./Navbar.css";

const Navbar = () => {
  const auth = useAuth();
  const user = auth?.user;
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const { logout } = useAuth();

  const handleLoginClick = (event) => {
    event.preventDefault();
    setOpen(false);
    navigate("/login");
  };

  const handleRegisterClick = (event) => {
    event.preventDefault();
    setOpen(false);
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
          <div className="profile-wrapper">
            <div
              className="profile-circle"
              onClick={() => setOpen(!open)}
            >
              {user.name?.charAt(0).toUpperCase()}
            </div>

            {open && (
              <div className="dropdown">
                <button onClick={() => { setOpen(false); navigate("/my-listings"); }}>
                  My Listings
                </button>
                <button onClick={() => { setOpen(false); navigate("/create-listing"); }}>
                  Sell Product
                </button>
                <button onClick={() => { setOpen(false); navigate("/chat"); }}>
                  Chat
                </button>
                <button
                  className="logout"
                  onClick={() => {
                    setOpen(false);
                    logout();
                    navigate("/login");
                  }}
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;