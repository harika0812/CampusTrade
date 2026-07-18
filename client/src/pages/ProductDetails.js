// import { useEffect, useState, useCallback } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import { fetchProductById } from "../api/product.api";

// export default function ProductDetails() {
//   const { id } = useParams();
//   const navigate = useNavigate();

//   const [product, setProduct] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [zoomLevel, setZoomLevel] = useState(1);

//   const contactSeller = () => {
//     const sellerId = product?.sellerId?._id || product?.sellerId;
//     if (!sellerId || !product?._id) return;
// navigate(`/chat?user=${sellerId}&product=${product._id}&name=${encodeURIComponent(product.sellerName || "Seller")}`);
//   };

//   const loadProduct = useCallback(async () => {
//     try {
//       const data = await fetchProductById(id);
//       setProduct(data);
//     } catch (err) {
//       console.error("Failed to load product", err);
//     } finally {
//       setLoading(false);
//     }
//   }, [id]);

//   useEffect(() => {
//     loadProduct();
//   }, [loadProduct]);

//   const handleWheel = (e) => {
//     e.preventDefault();
//     if (e.deltaY < 0) {
//       setZoomLevel((prev) => Math.min(prev + 0.1, 3));
//     } else {
//       setZoomLevel((prev) => Math.max(prev - 0.1, 0.5));
//     }
//   };

//   if (loading) return <p style={{ textAlign: "center" }}>Loading...</p>;
//   if (!product) return <p>Product not found 😕</p>;

//   return (
//     <div style={{ padding: "20px", maxWidth: "800px", margin: "auto" }}>
//       <div style={{ position: "relative", marginBottom: "20px", overflow: "hidden" }}>
//         <img
//           src={`http://localhost:5000/${product.images[0]}`}
//           alt={product.title}
//           style={{
//             width: "100%",
//             maxHeight: "400px",
//             objectFit: "contain",
//             transform: `scale(${zoomLevel})`,
//             transition: "transform 0.3s ease",
//             cursor: zoomLevel > 1 ? "zoom-out" : "zoom-in"
//           }}
//           onWheel={handleWheel}
//           loading="lazy"
//         />
//       </div>

//       <div>
//         <h1>{product.title}</h1>
//         <h2>₹ {product.price}</h2>
//         <p>{product.description}</p>
//         <p>Category: {product.category}</p>
//         <p>Seller: {product.sellerName || "Student"}</p>
//         <p>Status: {product.isSold ? "Sold" : "Available"}</p>
//         <button
//           style={{
//             padding: "10px 20px",
//             background: "#007bff",
//             color: "white",
//             border: "none",
//             borderRadius: "5px",
//             cursor: "pointer",
//             marginTop: "10px"
//           }}
//           onClick={contactSeller}
//         >
//           Contact Seller 💬
//         </button>
//       </div>
//     </div>
//   );
// }
import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchProductById } from "../api/product.api";
import { addToCart } from "../api/cart.api";
import { useAuth } from "../app/authContext";
import CartToast from "../components/CartToast";
import { resolveServerAssetUrl } from "../utils/runtimeConfig";

const FALLBACK_PRODUCT_IMAGE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='800' viewBox='0 0 600 800'%3E%3Crect width='600' height='800' fill='%230d1b3d'/%3E%3Ctext x='50%25' y='50%25' fill='%239fb3d9' font-family='Arial' font-size='32' text-anchor='middle' dominant-baseline='middle'%3ECampusTrade%3C/text%3E%3C/svg%3E";

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [toast, setToast] = useState({ message: "", type: "success" });
  const imageRef = useRef(null);

  const handleImageFallback = (event) => {
    if (event.currentTarget.dataset.fallbackApplied === "true") return;
    event.currentTarget.dataset.fallbackApplied = "true";
    event.currentTarget.src = FALLBACK_PRODUCT_IMAGE;
  };

  const sellerId = product?.sellerId?._id || product?.sellerId;
  const userId = user?._id || user?.id || user?.userId;
  const isOwner = !!sellerId && !!userId && String(sellerId) === String(userId);
  const availableCopies = Number(product?.availableCopies ?? 1);
  const purchasableCopies = Number(product?.purchasableCopies ?? availableCopies);
  const stockStatus = product?.stockStatus || (product?.isSold || availableCopies <= 0
    ? "sold_out"
    : purchasableCopies <= 0
    ? "reserved"
    : "available");
  const listingType = product?.listingType || "sell";
  const isBuyListing = listingType === "sell" || listingType === "both";
  const isUnavailable = !!product && (stockStatus !== "available" || purchasableCopies <= 0);

  const contactSeller = () => {
    if (isOwner) {
      return;
    }
    if (!sellerId) return;
    const rawName = String(product?.sellerName || "Seller").trim();
    const firstName = rawName.split(/\s+/)[0] || "Seller";
    const rollNo = String(product?.sellerRollNo || "").trim();
    const sellerName = rollNo ? `${rollNo} - ${firstName}` : firstName;
    navigate(
      `/chat?user=${sellerId}&name=${encodeURIComponent(sellerName)}`
    );
  };

  const loadProduct = useCallback(async () => {
    try {
      const data = await fetchProductById(id);
      setProduct(data);
    } catch (err) {
      console.error("Failed to load product", err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadProduct();
  }, [loadProduct]);

  useEffect(() => {
    if (!imageRef.current) return;
    imageRef.current.style.transform = `scale(${zoomLevel})`;
  }, [zoomLevel]);

  const handleWheel = (e) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      setZoomLevel((prev) => Math.min(prev + 0.1, 3));
    } else {
      setZoomLevel((prev) => Math.max(prev - 0.1, 0.5));
    }
  };

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast({ message: "", type: "success" });
    }, 1800);
  };

  const handleAddToCart = async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (!product?._id || isOwner || isUnavailable) {
      return;
    }

    try {
      setAddingToCart(true);
      await addToCart(product._id, 1);
      showToast("Added to cart");
    } catch (error) {
      showToast(error?.response?.data?.message || "Failed to add to cart", "error");
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading) return <p className="pd-loading">Loading...</p>;
  if (!product) return <p>Product not found 😕</p>;

  return (
    <div className="container page page-shell pd-wrap">
      <div className="product-details">
        <div className="pd-media">
          <img
            src={resolveServerAssetUrl(product.images?.[0])}
            alt={product.title}
            className="pd-image"
            ref={imageRef}
            onWheel={handleWheel}
            onError={handleImageFallback}
            loading="lazy"
          />
        </div>

        <div className="pd-info">
          <div className="pd-header">
            <h1 className="pd-title">{product.title}</h1>
            <div className="pd-price">₹ {product.price}</div>
          </div>

          <p className="pd-desc">{product.description || "No description provided."}</p>

          <div className="pd-meta">
            <p className="pd-meta-row">
              <span className="pd-meta-label">Category</span>
              <span className="pd-meta-value">{product.category || "General"}</span>
            </p>
            <p className="pd-meta-row">
              <span className="pd-meta-label">Available copies</span>
              <span className="pd-meta-value">{Math.max(0, purchasableCopies)}</span>
            </p>
          </div>

          {listingType === "lend" ? (
            <div className="pd-lending-note">
              <p>This item is available only for lending. Use Contact Seller to discuss duration, return date, and terms.</p>
            </div>
          ) : null}

          {listingType === "sell" ? (
            <div className="pd-lending-note">
              <p>This item is available only for purchase.</p>
            </div>
          ) : null}

          {listingType === "both" ? (
            <div className="pd-lending-note">
              <p>This item is available for both purchase and lending.</p>
              <p>Use Add to Cart for purchase. Use Contact Seller for lending details and coordination.</p>
            </div>
          ) : null}

          <div className="pd-seller">
            <p className="pd-seller-label">Seller</p>
            <p className="pd-seller-name">{product.sellerName || "Student"}</p>
            <p className="pd-seller-note">Verified student • {product.sellerRollNo || "N/A"}</p>
            <p className="pd-seller-details">
              {product.seller?.className || "N/A"} • {product.seller?.branch || product.seller?.department || "N/A"} • Year {product.seller?.year || "N/A"}
            </p>
          </div>

          <div className="pd-actions">
            <button className="btn btn-primary" onClick={contactSeller} disabled={isOwner}>
              {isOwner ? "Your listing" : "Contact Seller"}
            </button>

            {(!isOwner && isBuyListing && !isUnavailable) ? (
              <button className="btn btn-outline" onClick={handleAddToCart} disabled={addingToCart}>
                {addingToCart ? "Adding..." : "Add to Cart"}
              </button>
            ) : null}
          </div>
        </div>
      </div>

      <CartToast message={toast.message} type={toast.type} />
    </div>
  );
}