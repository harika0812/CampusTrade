// // import { useEffect, useState } from "react";
// // import { fetchMyProducts } from "../api/product.api";

// // /**
// //  * Displays products created by logged-in user
// //  */
// // const MyListings = () => {
// //   const [products, setProducts] = useState([]);

// //   useEffect(() => {
// //     fetchMyProducts()
// //       .then(setProducts)
// //       .catch((err) => console.error(err));
// //   }, []);

// //   return (
// //     <div style={{ padding: "40px" }}>
// //       <h2>My Listings</h2>

// //       {products.length === 0 && <p>No products listed yet.</p>}

// //       {products.map((product) => (
// //         <div key={product._id} style={{ marginBottom: "20px" }}>
// //           <h3>{product.title}</h3>
// //           <p>₹ {product.price}</p>
// //           <p>{product.category}</p>
// //         </div>
// //       ))}
// //     </div>
// //   );
// // };

// // export default MyListings;
// import { useEffect, useState } from "react";
// import {
//   fetchMyProducts,
//   deleteProduct,
//   markAsSold,
// } from "../api/product.api";

// const MyListings = () => {
//   const [products, setProducts] = useState([]);
//   const [loading, setLoading] = useState(true);

//   // Fetch user's products
//   const loadMyProducts = async () => {
//     try {
//       const data = await fetchMyProducts();
//       setProducts(data);
//     } catch (err) {
//       console.error("Failed to load my products", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     loadMyProducts();
//   }, []);

//   const handleDelete = async (id) => {
//     if (!window.confirm("Delete this product?")) return;
//     await deleteProduct(id);
//     loadMyProducts();
//   };

//   const handleSold = async (id) => {
//     await markAsSold(id);
//     loadMyProducts();
//   };

//   if (loading) return <p>Loading...</p>;

//   return (
//     <div style={{ padding: "2rem" }}>
//       <h2>My Listings</h2>

//       {products.length === 0 && <p>No products listed yet.</p>}

//       <div style={{ display: "grid", gap: "1.5rem" }}>
//         {products.map((p) => (
//           <div
//             key={p._id}
//             style={{
//               background: "#fff",
//               padding: "1.5rem",
//               borderRadius: "12px",
//               boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
//             }}
//           >
//             <h3>{p.title}</h3>
//             <p>₹ {p.price}</p>
//             <p>Status: {p.isSold ? "SOLD" : "Available"}</p>

//             <div style={{ marginTop: "1rem", display: "flex", gap: "1rem" }}>
//               {!p.isSold && (
//                 <button onClick={() => handleSold(p._id)}>
//                   Mark as Sold
//                 </button>
//               )}
//               <button onClick={() => handleDelete(p._id)}>Delete</button>
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default MyListings;
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  fetchMyProducts,
  deleteProduct,
  markAsSold,
} from "../api/product.api";
import { getSellerOrders } from "../api/payment.api";
import { resolveServerAssetUrl } from "../utils/runtimeConfig";

const FALLBACK_PRODUCT_IMAGE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='800' viewBox='0 0 600 800'%3E%3Crect width='600' height='800' fill='%230d1b3d'/%3E%3Ctext x='50%25' y='50%25' fill='%239fb3d9' font-family='Arial' font-size='32' text-anchor='middle' dominant-baseline='middle'%3ECampusTrade%3C/text%3E%3C/svg%3E";

const resolveImageUrl = (imagePath) => {
  if (!imagePath) return "";
  return resolveServerAssetUrl(imagePath);
};

const handleImageFallback = (event) => {
  if (event.currentTarget.dataset.fallbackApplied === "true") return;
  event.currentTarget.dataset.fallbackApplied = "true";
  event.currentTarget.src = FALLBACK_PRODUCT_IMAGE;
};

const MyListings = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [orderCounts, setOrderCounts] = useState({});
  const [pendingOrderCounts, setPendingOrderCounts] = useState({});
  const [loading, setLoading] = useState(true);

  // Fetch user's products
  const loadMyProducts = async () => {
    try {
      const data = await fetchMyProducts();
      setProducts(data);
    } catch (err) {
      alert("Failed to load my products: " + (err.response?.data?.message || err.message));
      console.error("Failed to load my products", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      await loadMyProducts();

      try {
        const response = await getSellerOrders();
        const orders = response?.orders || [];

        const totalByProduct = {};
        const pendingByProduct = {};

        orders.forEach((order) => {
          (order.items || []).forEach((item) => {
            const productId = item?.productId;
            if (!productId) return;

            totalByProduct[productId] = (totalByProduct[productId] || 0) + Number(item.quantity || 1);

            if (order.status === "pending") {
              pendingByProduct[productId] = (pendingByProduct[productId] || 0) + Number(item.quantity || 1);
            }
          });
        });

        setOrderCounts(totalByProduct);
        setPendingOrderCounts(pendingByProduct);
      } catch {
        setOrderCounts({});
        setPendingOrderCounts({});
      }
    };

    loadData();
  }, []);

  const totalIncomingQty = Object.values(orderCounts).reduce((sum, value) => sum + value, 0);
  const pendingIncomingQty = Object.values(pendingOrderCounts).reduce((sum, value) => sum + value, 0);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    await deleteProduct(id);
    loadMyProducts();
  };

  const handleSold = async (id) => {
    await markAsSold(id);
    loadMyProducts();
  };

  if (loading) return <p className="container page listings-page">Loading...</p>;

  return (
    <div className="container page page-shell listings-page">
      <h1 className="cart-title">My Listings</h1>

      {totalIncomingQty > 0 && (
        <div className="cart-inline-notice" role="status" aria-live="polite" style={{ marginBottom: "16px" }}>
          <span>
            🔔 You got orders for {Object.keys(orderCounts).length} listing{Object.keys(orderCounts).length > 1 ? "s" : ""}
            {pendingIncomingQty > 0 ? ` • ${pendingIncomingQty} pending item(s)` : ""}
          </span>
          <button className="btn btn-outline" onClick={() => navigate("/seller-orders")}>View Sales</button>
        </div>
      )}

      {products.length === 0 && <p>No products listed yet.</p>}

      <div className="listing-grid">
        {products.map((p) => (
          <div key={p._id} className="listing-card">
            {Array.isArray(p.images) && p.images.length > 0 ? (
              <img
                src={resolveImageUrl(p.images[0])}
                alt={p.title}
                onError={handleImageFallback}
                style={{
                  width: "100%",
                  height: "160px",
                  objectFit: "contain",
                  borderRadius: "10px",
                  marginBottom: "10px",
                  border: "1px solid rgba(125, 211, 252, 0.26)",
                  background: "rgba(12, 25, 62, 0.76)",
                }}
                loading="lazy"
              />
            ) : (
              <div
                style={{
                  width: "100%",
                  height: "160px",
                  borderRadius: "10px",
                  marginBottom: "10px",
                  border: "1px solid rgba(125, 211, 252, 0.26)",
                  display: "grid",
                  placeItems: "center",
                  color: "#9bb0d4",
                  background: "rgba(12, 25, 62, 0.76)",
                }}
              >
                No Image
              </div>
            )}

            <h3>{p.title}</h3>
            <p>₹ {p.price}</p>
            <p>Category: {p.category || "Others"}</p>
            <p style={{ marginTop: "4px", color: "#9bb0d4" }}>
              {p.description ? (p.description.length > 90 ? `${p.description.slice(0, 90)}...` : p.description) : "No description"}
            </p>
            <p>Status: {p.isSold ? "SOLD" : "Available"}</p>
            {orderCounts[p._id] ? (
              <p style={{ fontWeight: 600, color: "#cfe0ff" }}>
                🔔 Ordered Qty: {orderCounts[p._id]}
                {pendingOrderCounts[p._id] ? ` (Pending: ${pendingOrderCounts[p._id]})` : ""}
              </p>
            ) : null}

            <div style={{ marginTop: "1rem", display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
              {!p.isSold && (
                <button className="btn btn-outline" onClick={() => navigate(`/edit-listing/${p._id}`)}>
                  Edit
                </button>
              )}
              {!p.isSold && (
                <button className="btn btn-outline" onClick={() => handleSold(p._id)}>
                  Mark as Sold
                </button>
              )}
              <button className="btn btn-outline" onClick={() => handleDelete(p._id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyListings;