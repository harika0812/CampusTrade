// import { useEffect, useState } from "react";
// import {
//   fetchMyProducts,
//   deleteProduct,
//   markAsSold,
// } from "../../api/product.api";

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
import { fetchMyListings, deleteProduct, markAsSold } from "../../api/product.api";

const MyListings = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFirstSaleCelebration, setShowFirstSaleCelebration] = useState(false);

  useEffect(() => {
    loadMyProducts();
  }, []);

  const loadMyProducts = async () => {
    try {
      setLoading(true);
      const data = await fetchMyListings();
      setProducts(data);
    } catch (err) {
      alert("Failed to load your listings.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    const previous = products;
    setProducts((prev) => prev.filter((p) => p._id !== id));
    try {
      await deleteProduct(id);
    } catch (err) {
      setProducts(previous);
      alert("Delete failed. Please try again.");
    }
  };

  const handleSold = async (id) => {
    const previous = products;
    const soldCount = previous.filter((p) => p.isSold).length;
    setProducts((prev) =>
      prev.map((p) => (p._id === id ? { ...p, isSold: true } : p))
    );
    try {
      await markAsSold(id);
      const alreadyCelebrated = localStorage.getItem("firstSaleCelebrated") === "true";
      if (soldCount === 0 && !alreadyCelebrated) {
        localStorage.setItem("firstSaleCelebrated", "true");
        setShowFirstSaleCelebration(true);
        setTimeout(() => setShowFirstSaleCelebration(false), 3000);
      }
    } catch (err) {
      setProducts(previous);
      alert("Update failed. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="page listings-page">
        <h2>My Listings</h2>
        <div className="listing-grid">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={`listing-skeleton-${index}`} className="listing-card">
              <div className="skeleton skeleton-line" />
              <div className="skeleton skeleton-line short" />
              <div className="skeleton skeleton-line" />
              <div className="skeleton skeleton-button" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="page listings-page">
      <div className={`celebration-overlay ${showFirstSaleCelebration ? "active" : ""}`} aria-hidden={!showFirstSaleCelebration}>
        <div className="celebration-card">
          <div className="confetti confetti-1" />
          <div className="confetti confetti-2" />
          <div className="confetti confetti-3" />
          <div className="confetti confetti-4" />
          <div className="confetti confetti-5" />
          <h3 className="celebration-title">First sale! 🎊</h3>
          <p className="celebration-subtitle">You just made your first campus sale.</p>
        </div>
      </div>

      <h2>My Listings</h2>

      {products.length === 0 ? (
        <p className="empty-text">No products listed yet. Your campus is waiting!</p>
      ) : (
        <div className="listing-grid">
          {products.map((p) => (
            <div key={p._id} className="listing-card">
              <div>
                <h3>{p.title}</h3>
                <p className="listing-price">₹ {p.price}</p>
              </div>
              <span className={`status-pill ${p.isSold ? "sold" : "live"}`}>
                {p.isSold ? "Sold" : "Live"}
              </span>

              <div className="listing-actions">
                {!p.isSold && (
                  <button className="btn btn-primary" onClick={() => handleSold(p._id)}>
                    Mark as Sold
                  </button>
                )}
                <button className="btn btn-outline" onClick={() => handleDelete(p._id)}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyListings;
