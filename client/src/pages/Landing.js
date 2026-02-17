import { Link } from "react-router-dom";
import { useAuth } from "../app/authContext";

const Landing = () => {
  const { user } = useAuth();
  const getStartedPath = user ? "/marketplace" : "/login";

  return (
    <div className="landing-page page">
      <section className="landing-hero">
        <div className="container">
          <h1 className="landing-title">
            Your Campus. <br />
            Your Marketplace.
          </h1>

          <p className="landing-subtitle">
            Buy and sell books, gadgets and essentials securely —
            only with verified students from your campus.
          </p>

          <div className="landing-cta">
            <Link to={getStartedPath} className="btn btn-primary">
              Get Started →
            </Link>
            <Link to="/marketplace" className="btn btn-outline">
              Explore Marketplace
            </Link>
          </div>
        </div>
      </section>

      <section className="landing-trust">
        <div>🎓 Campus-only users</div>
        <div>🔒 Safer student deals</div>
        <div>⚡ Quick listings</div>
      </section>

      <section className="landing-features">
        <div className="feature-card">
          <h3>Verified Students Only</h3>
          <p>Every user belongs to a campus. No outsiders. No spam.</p>
        </div>

        <div className="feature-card">
          <h3>Simple & Secure Trading</h3>
          <p>Connect directly with buyers or sellers without middlemen.</p>
        </div>

        <div className="feature-card">
          <h3>Post in Minutes</h3>
          <p>List your product quickly and reach genuine campus buyers.</p>
        </div>
      </section>

      <footer className="landing-footer">
        <p>Built for students, by students.</p>
        <span>© {new Date().getFullYear()} CampusTrade</span>
      </footer>
    </div>
  );
};

export default Landing;