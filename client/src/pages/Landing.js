import { Link, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../app/authContext";
import { fetchAllProducts } from "../api/product.api";
import { resolveServerAssetUrl } from "../utils/runtimeConfig";

const FALLBACK_PRODUCT_IMAGE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='800' viewBox='0 0 600 800'%3E%3Crect width='600' height='800' fill='%230d1b3d'/%3E%3Ctext x='50%25' y='50%25' fill='%239fb3d9' font-family='Arial' font-size='32' text-anchor='middle' dominant-baseline='middle'%3ECampusTrade%3C/text%3E%3C/svg%3E";

const handleImageFallback = (event) => {
  if (event.currentTarget.dataset.fallbackApplied === "true") return;
  event.currentTarget.dataset.fallbackApplied = "true";
  event.currentTarget.src = FALLBACK_PRODUCT_IMAGE;
};

const Landing = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [searchInput, setSearchInput] = useState("");

  const serviceHighlights = [
    { title: "Free Delivery", subtitle: "on campus meetups" },
    { title: "Trusted Students", subtitle: "verified college users" },
    { title: "Secure Payments", subtitle: "online and offline" },

  ];

  useEffect(() => {
    let isMounted = true;

    const loadProducts = async () => {
      try {
        const data = await fetchAllProducts();
        if (isMounted) {
          setProducts(Array.isArray(data) ? data : []);
        }
      } catch {
        if (isMounted) setProducts([]);
      }
    };

    loadProducts();

    return () => {
      isMounted = false;
    };
  }, []);

  const currentUserId = useMemo(() => {
    const possibleIds = [user?.id, user?._id, user?.userId].filter(Boolean);
    return possibleIds.length ? String(possibleIds[0]) : null;
  }, [user]);

  const visibleProducts = useMemo(() => {
    if (!currentUserId) return products;

    return products.filter((item) => {
      const sellerId =
        item?.sellerId?._id ||
        item?.sellerId?.id ||
        item?.sellerId?.userId ||
        item?.seller?._id ||
        item?.seller?.id ||
        item?.userId ||
        item?.ownerId ||
        item?.postedBy ||
        item?.sellerId;

      return !sellerId || String(sellerId) !== currentUserId;
    });
  }, [products, currentUserId]);

  const categoryMenu = useMemo(() => {
    const campusDefaults = [
      "Books",
      "Project Components",
      "Calculators",
      "Lab Coats",
      "Electronics",
      "Notes",
      "Hostel Essentials",
    ];

    const genericLabels = new Set(["others", "other", "general", "misc", "miscellaneous"]);

    const counts = visibleProducts.reduce((acc, item) => {
      const category = String(item?.category || "").trim();
      if (!category) return acc;

      const lowered = category.toLowerCase();
      if (genericLabels.has(lowered)) return acc;

      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {});

    const rankedLive = Object.entries(counts)
      .sort((a, b) => {
        if (b[1] !== a[1]) return b[1] - a[1];
        return a[0].localeCompare(b[0]);
      })
      .slice(0, 10)
      .map(([category]) => category);

    // Keep the first view stable: always show campus defaults first,
    // then append live categories not already present.
    const merged = [...new Set([...campusDefaults, ...rankedLive])];
    return merged.slice(0, 8);
  }, [visibleProducts]);

  const newArrivals = useMemo(() => {
    return [...visibleProducts]
      .sort((a, b) => new Date(b?.createdAt || 0).getTime() - new Date(a?.createdAt || 0).getTime())
      .slice(0, 3)
      .map((item) => ({
        id: item?._id,
        title: item?.title || "Campus Listing",
        imageUrl: item?.images?.[0] ? resolveServerAssetUrl(item.images[0]) : "",
        price: `₹${Number(item?.price || 0)}`,
      }));
  }, [visibleProducts]);

  const campusContext = useMemo(() => {
    const rawEmail = String(user?.email || "").trim().toLowerCase();
    const domain = rawEmail.includes("@") ? rawEmail.split("@")[1] : "";
    const domainHead = domain ? domain.split(".")[0] : "";
    const nonCampusDomainHeads = new Set([
      "gmail",
      "yahoo",
      "outlook",
      "hotmail",
      "icloud",
      "protonmail",
      "aol",
      "live",
      "msn",
      "mail",
    ]);
    const hasCampusDomain = Boolean(domainHead) && !nonCampusDomainHeads.has(domainHead);

    const normalizedCampusName = domainHead
      ? domainHead
          .replace(/[-_]+/g, " ")
          .replace(/\b\w/g, (char) => char.toUpperCase())
      : "Your Campus";

    const academicParts = [user?.className, user?.branch, user?.year].filter(Boolean);
    const academicTag = academicParts.length > 0 ? academicParts.join(" • ") : "Verified student community";

    return {
      campusName: hasCampusDomain ? normalizedCampusName : "Your Campus",
      academicTag,
      hasCampusDomain,
    };
  }, [user]);

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    const query = searchInput.trim();
    navigate(query ? `/marketplace?q=${encodeURIComponent(query)}` : "/marketplace");
  };

  return (
    <div className="landing-page page">
      <section className="landing-top-strip">
        <div className="container landing-top-strip-inner">
          <span>Campus-only verified marketplace</span>
          <span>Student-to-student handoff friendly</span>
          <span>Realtime chat for faster closure</span>
          <span>{campusContext.hasCampusDomain ? `${campusContext.campusName} student network` : "No hidden platform fees"}</span>
        </div>
      </section>

      <section className="landing-showcase container">
        <form className="landing-toolbar" onSubmit={handleSearchSubmit}>
          <button className="landing-dept-btn" type="button">All Departments</button>
          <input
            type="text"
            className="landing-search"
            placeholder="Search campus listings"
            aria-label="Search campus listings"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
          />
          <button className="landing-category-btn" type="button">All Categories</button>
          <button type="submit" className="btn btn-primary landing-search-btn">Explore</button>
        </form>

        <div className="landing-hero-grid">
          <aside className="landing-sidebar">
            {categoryMenu.map((moment) => (
              <button key={moment} type="button" className="landing-side-item">
                {moment}
              </button>
            ))}
            <Link to="/marketplace" className="landing-side-viewall">
              View all categories
            </Link>
          </aside>

          <div className="landing-hero-card">
            <div className="landing-hero-content">
              <p className="landing-badge">CampusTrade</p>
              <h1 className="landing-title">The best student deals at {campusContext.campusName} are right here</h1>
              <p className="landing-subtitle">
                Buy, sell, and borrow essentials with fast chat, clear status, and trusted meetups - tailored for GNITS students.
              </p>

              <div className="landing-cta">
                <Link to="/marketplace" className="btn btn-primary landing-cta-btn">Go to Marketplace</Link>
                <Link to="/create-listing" className="btn btn-primary landing-cta-btn">Post a Listing</Link>
              </div>
            </div>
            <div className="landing-hero-art" aria-hidden="true">
              <div className="landing-hero-x">CT</div>
              <div className="landing-hero-device">📱</div>
            </div>
          </div>
        </div>
      </section>

      <section className="landing-services container">
        {serviceHighlights.map((item) => (
          <div key={item.title} className="landing-service-item">
            <strong>{item.title}</strong>
            <span>{item.subtitle}</span>
          </div>
        ))}
      </section>

      <section className="landing-deals container">
        <div className="landing-deal-card">
          <p className="landing-deal-eyebrow">Campus Snapshot</p>
          <h3>{visibleProducts.length} live listings from {campusContext.campusName}</h3>
          <p className="landing-deal-price">Student-to-student trade <span>verified users only</span></p>
          <p className="landing-deal-submetric">Books, gadgets, notes, and essentials - all in one place</p>
          <p className="landing-deal-note">
            Skip random public marketplaces and trade directly within your college network.
          </p>
          <Link to="/marketplace" className="btn btn-primary landing-explore-btn">Explore now</Link>
        </div>

        <div className="landing-arrivals">
          <div className="landing-arrivals-head">
            <h2>New Arrivals</h2>
            <Link to="/marketplace">Open Marketplace</Link>
          </div>
          <div className="landing-arrivals-grid">
            {newArrivals.length > 0 ? newArrivals.map((item) => (
              <Link
                key={item.id}
                to={item.id ? `/products/${item.id}` : "/marketplace"}
                className="landing-arrival-link"
              >
                <article className="landing-arrival-item">
                  <div className="landing-arrival-thumb" aria-hidden="true">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="landing-arrival-thumb-image"
                        loading="lazy"
                        onError={handleImageFallback}
                      />
                    ) : (
                      <img
                        src={FALLBACK_PRODUCT_IMAGE}
                        alt={item.title}
                        className="landing-arrival-thumb-image"
                        loading="lazy"
                      />
                    )}
                  </div>
                  <p className="landing-arrival-title">{item.title}</p>
                  <p className="landing-arrival-price">{item.price}</p>
                </article>
              </Link>
            )) : (
              <p className="landing-arrivals-empty">No live listings yet. New arrivals appear automatically.</p>
            )}
          </div>
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
