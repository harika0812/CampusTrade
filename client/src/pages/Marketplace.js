import { useEffect, useMemo, useState } from "react";
import { fetchAllProducts } from "../api/product.api";
import "./MarketPlace.css";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../app/authContext";
import { resolveServerAssetUrl } from "../utils/runtimeConfig";

export default function Marketplace() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const navigate = useNavigate();
  const location = useLocation();
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
    const loadProducts = async () => {
      try {
        const data = await fetchAllProducts();
        setProducts(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const queryFromUrl = params.get("q") || "";
    setSearchQuery(queryFromUrl);
  }, [location.search]);

  const categories = useMemo(() => {
    const dynamicCategories = Array.from(
      new Set(
        products
          .map((product) => (product.category || "General").trim())
          .filter(Boolean)
      )
    ).sort((a, b) => a.localeCompare(b));

    return ["All", ...dynamicCategories];
  }, [products]);

  const filteredProducts = useMemo(() => {
    const source = !user
      ? products
      : products.filter((product) => {
          const userId = String(user?.id || user?._id || user?.userId || "");
          const sellerId =
            product?.sellerId?._id ||
            product?.sellerId?.id ||
            product?.sellerId?.userId ||
            product?.seller?._id ||
            product?.seller?.id ||
            product?.userId ||
            product?.ownerId ||
            product?.postedBy ||
            product?.sellerId;
          return !sellerId || String(sellerId) !== String(userId);
        });

    const query = searchQuery.trim().toLowerCase();

    return source.filter((product) => {
      const matchesCategory =
        activeCategory === "All" ||
        (product.category || "General") === activeCategory;
      const searchableText = [
        product.title,
        product.description,
        product.category,
        product.sellerName,
        product.sellerRollNo,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      const matchesQuery = !query || searchableText.includes(query);

      return matchesCategory && matchesQuery;
    });
  }, [products, user, activeCategory, searchQuery]);

  if (loading) {
    return (
      <div className="marketplace page page-shell">
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
    <div className="marketplace page page-shell">
      <div className="marketplace-header">
        <div>
          <h1 className="marketplace-title">
            {greeting}, {firstName} 
          </h1>
          <p className="marketplace-subtitle">
            Discover quality campus listings in one place
          </p>
        </div>
        <div className="marketplace-pill">{filteredProducts.length} live listings</div>
      </div>

      <div className="marketplace-controls">
        <input
          type="text"
          placeholder="Search by title, category, seller..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="marketplace-search"
        />
        <div className="marketplace-categories" role="tablist" aria-label="Filter listings by category">
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              className={`marketplace-category ${activeCategory === category ? "active" : ""}`}
              onClick={() => setActiveCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {filteredProducts.length === 0 ? (
        <div className="empty-state">
          <div className="empty-illustration" aria-hidden="true">
            <div className="empty-illustration-icon">🛍️</div>
            <div className="empty-illustration-line" />
            <div className="empty-illustration-line short" />
            <div className="empty-illustration-chip-row">
              <span />
              <span />
            </div>
          </div>
          <div className="empty-content">
            <h3>No listings match your search</h3>
            <p>
              Try another keyword or category, or create the first listing for
              your campus.
            </p>
            <div className="empty-tags">
              <span>Books</span>
              <span>Electronics</span>
              <span>Notes</span>
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
              {(() => {
                return (
                  <>
              <div className="product-media">
                <img
                  src={
                    product.images?.[0]
                      ? resolveServerAssetUrl(product.images[0])
                      : "https://via.placeholder.com/600x800?text=CampusTrade"
                  }
                  alt={product.title}
                  className="product-image"
                />
              </div>

              <div className="product-info">
                <h3 className="product-title">{product.title}</h3>

                <p className="product-price">₹ {product.price}</p>

                <p className="product-desc">
                  {product.description || "No description provided."}
                </p>

                <div className="product-footer">
                  <p className="seller-trust">
                    {product.sellerRollNo || "N/A"}
                  </p>

                  <div className="product-actions">
                  <button
                    className="btn btn-primary view-btn"
                    onClick={() => navigate(`/products/${product._id}`)}
                  >
                    View Details
                  </button>
                  </div>
                </div>
              </div>
                  </>
                );
              })()}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
