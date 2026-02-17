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
import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchProductById } from "../api/product.api";
import { useAuth } from "../app/authContext";

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(1);

  const contactSeller = () => {
    const sellerId = product?.sellerId?._id || product?.sellerId;
    const userId = user?._id || user?.id || user?.userId;
    if (sellerId && userId && String(sellerId) === String(userId)) {
      return;
    }
    if (!sellerId || !product?._id) return;
    const sellerName = product?.sellerName || "Seller";
    const productTitle = product?.title || "";
    navigate(
      `/chat?user=${sellerId}&product=${product._id}&name=${encodeURIComponent(
        sellerName
      )}&title=${encodeURIComponent(productTitle)}`
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

  const handleWheel = (e) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      setZoomLevel((prev) => Math.min(prev + 0.1, 3));
    } else {
      setZoomLevel((prev) => Math.max(prev - 0.1, 0.5));
    }
  };

  if (loading) return <p style={{ textAlign: "center" }}>Loading...</p>;
  if (!product) return <p>Product not found 😕</p>;

  return (
    <div className="product-details container page">
      <div className="pd-media">
        <img
          src={`http://localhost:5000/${product.images[0]}`}
          alt={product.title}
          className="pd-image"
          style={{
            transform: `scale(${zoomLevel})`,
            cursor: zoomLevel > 1 ? "zoom-out" : "zoom-in"
          }}
          onWheel={handleWheel}
        />
      </div>

      <div className="pd-info">
        <div className="pd-header">
          <h1 className="pd-title">{product.title}</h1>
          <div className="pd-price">₹ {product.price}</div>
        </div>

        <p className="pd-desc">{product.description}</p>

        <div className="pd-meta">
          <span className="meta-chip">{product.category || "General"}</span>
          <span className="meta-chip">{product.sellerName || "Student"}</span>
          <span className={`status-chip ${product.isSold ? "sold" : "available"}`}>
            {product.isSold ? "Sold" : "Available"}
          </span>
        </div>

        <div className="pd-actions">
          <button
            className="btn btn-primary"
            onClick={contactSeller}
            disabled={
              !!product?.sellerId &&
              !!user &&
              String(product?.sellerId?._id || product?.sellerId) ===
                String(user?._id || user?.id || user?.userId)
            }
          >
            {product?.sellerId &&
            user &&
            String(product?.sellerId?._id || product?.sellerId) ===
              String(user?._id || user?.id || user?.userId)
              ? "Your listing"
              : "Contact Seller 💬"}
          </button>
        </div>
      </div>
    </div>
  );
}