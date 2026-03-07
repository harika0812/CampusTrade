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

const SOLD_NOTIFICATION_KEY = "campustrade_sold_notifications";
const SALES_HUB_UPDATED_EVENT = "sales-hub-updated";

const MyListings = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

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
    try {
      await deleteProduct(id);
      await loadMyProducts();
    } catch (err) {
      alert("Delete failed. Please try again.");
    }
  };

  const handleSold = async (id) => {
    try {
      const soldProduct = products.find((item) => item._id === id);
      await markAsSold(id);

      const nextNotification = {
        id: `${Date.now()}-${id}`,
        productId: id,
        title: soldProduct?.title || "your product",
        createdAt: new Date().toISOString(),
      };

      const existingNotifications = JSON.parse(localStorage.getItem(SOLD_NOTIFICATION_KEY) || "[]");
      const merged = [nextNotification, ...existingNotifications].slice(0, 20);
      localStorage.setItem(SOLD_NOTIFICATION_KEY, JSON.stringify(merged));
      window.dispatchEvent(new Event(SALES_HUB_UPDATED_EVENT));

      alert(`Hooray! Congratulations on selling \"${nextNotification.title}\" successfully.`);
      await loadMyProducts();
    } catch (err) {
      alert("Update failed. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="container page listings-page">
        <h2>My Listings</h2>
        <p className="empty-text">Loading your listings...</p>
      </div>
    );
  }

  return (
    <div className="container page listings-page">
      <h2>My Listings</h2>

      {products.length === 0 ? (
        <p className="empty-text">No products listed yet.</p>
      ) : (
        <div className="listing-grid">
          {products.map((p) => (
            <div key={p._id} className="listing-card">
              {(() => {
                const availableCopies = Number(p.availableCopies ?? 1);
                const reservedCopies = Number(p.reservedCopies ?? 0);
                const purchasableCopies = Number(p.purchasableCopies ?? Math.max(0, availableCopies - reservedCopies));
                const stockStatus = p.stockStatus || (p.isSold || availableCopies <= 0
                  ? "sold_out"
                  : purchasableCopies <= 0
                  ? "reserved"
                  : "available");
                const listingType = p.listingType || "sell";
                const listingTypeLabel = listingType === "both" ? "Sell + Lend" : listingType === "lend" ? "Lend" : "Sell";
                const isSoldOut = stockStatus === "sold_out";
                const isReserved = stockStatus === "reserved";
                return (
                  <>
              <div>
                <h3>{p.title}</h3>
                <p className="listing-price">₹ {p.price}</p>
                <p className="listing-stock">
                  {listingTypeLabel} • Available {Math.max(0, purchasableCopies)}
                  {reservedCopies > 0 ? ` • Reserved ${reservedCopies}` : ""}
                </p>
                {listingType === "both" ? (
                  <p className="listing-stock">Borrow fee: ₹ {Number(p?.lendingDetails?.borrowFee || 0)}</p>
                ) : null}
              </div>
              <span className={`status-pill ${isSoldOut ? "sold" : isReserved ? "reserved" : "live"}`}>
                {isSoldOut ? "Sold Out" : isReserved ? "Reserved" : "Live"}
              </span>

              <div className="listing-actions">
                {!isSoldOut && !isReserved && (
                  <button className="btn btn-primary" onClick={() => handleSold(p._id)}>
                    Mark as Sold
                  </button>
                )}
                <button className="btn btn-outline" onClick={() => handleDelete(p._id)}>
                  Delete
                </button>
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
};

export default MyListings;
