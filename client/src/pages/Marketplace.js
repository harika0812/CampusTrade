import { useEffect, useMemo, useState } from "react";
import { fetchAllProducts } from "../api/product.api";
import "./MarketPlace.css";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../app/authContext";

export default function Marketplace() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  }, []);

  const firstName = useMemo(() => {
    const rawName = user?.firstName || user?.name || user?.fullName || user?.username;
    if (!rawName) return "there";
    return String(rawName).trim().split(" ")[0];
  }, [user]);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const data = await fetchAllProducts();
      setProducts(data);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = useMemo(() => {
    if (!user) return products;
    const userId = user?.id || user?._id || user?.userId;
    return products.filter((product) => {
      const sellerId = product?.sellerId?._id || product?.sellerId;
      return !sellerId || String(sellerId) !== String(userId);
    });
  }, [products, user]);

  if (loading) {
    return (
      <div className="marketplace page">
        <div className="marketplace-header">
          <div>
            <h1 className="marketplace-title">
              {greeting}, {firstName} 👋
            </h1>
            <p className="marketplace-subtitle">
              Trending in your college • Seniors are selling
            </p>
          </div>
          <div className="marketplace-pill">Campus picks</div>
        </div>

        <div className="product-grid skeleton-grid">
          {Array.from({ length: 8 }).map((_, index) => (
            <div className="product-card skeleton-card" key={`skeleton-${index}`}>
              <div className="skeleton skeleton-media" />
              <div className="product-info">
                <div className="skeleton skeleton-line" />
                <div className="skeleton skeleton-line short" />
                <div className="skeleton skeleton-line" />
                <div className="skeleton skeleton-line" />
                <div className="skeleton skeleton-button" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="marketplace page">
      <div className="marketplace-header">
        <div>
          <h1 className="marketplace-title">
            {greeting}, {firstName} 👋
          </h1>
          <p className="marketplace-subtitle">
            Trending in your college • Seniors are selling
          </p>
        </div>
        <div className="marketplace-pill">Campus picks</div>
      </div>

      {filteredProducts.length === 0 ? (
        <div className="empty-state">
          <img
            className="empty-illustration"
            src="https://raw.githubusercontent.com/undraw/undraw/master/svg/online_shopping_re_k1sv.svg"
            alt="Empty marketplace illustration"
            loading="lazy"
          />
          <div className="empty-content">
            <h3>Nothing listed yet</h3>
            <p>
              Be the first in your college to post. Your classmates are
              waiting for great deals.
            </p>
            <div className="empty-tags">
              <span>Trending in your college</span>
              <span>Seniors are selling</span>
              <span>Fresh listings daily</span>
            </div>
            <button className="btn btn-primary view-btn" onClick={() => navigate("/sell")}>
              Create the first listing
            </button>
          </div>
        </div>
      ) : (
        <div className="product-grid">
          {filteredProducts.map((product) => (
            <div className="product-card" key={product._id}>
              <div className="product-media">
                <img
                  src={`http://localhost:5000/${product.images[0]}`}
                  alt={product.title}
                  className="product-image"
                />
                <span className="condition-badge">
                  {product.condition || "Good"}
                </span>
              </div>

              <div className="product-info">
                <h3 className="product-title">{product.title}</h3>

                <p className="product-price">₹ {product.price}</p>

                <p className="product-desc">
                  {product.description?.slice(0, 80)}...
                </p>

                <div className="product-meta">
                  <span className="meta-chip">{product.category || "General"}</span>
                  <span className="seller-trust">
                    ✅ Verified student • {product.sellerName || "Student"}
                  </span>
                </div>

                <button
                  className="btn btn-primary view-btn"
                  onClick={() => navigate(`/products/${product._id}`)}
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
