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
import {
  fetchMyProducts,
  deleteProduct,
  markAsSold,
} from "../api/product.api";

const MyListings = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch user's products
  const loadMyProducts = async () => {
    try {
      const data = await fetchMyProducts();
      setProducts(data);
    } catch (err) {
      alert("Failed to load my products: " + (err.response?.data?.message || err.message)); // Updated to alert
      console.error("Failed to load my products", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMyProducts();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    await deleteProduct(id);
    loadMyProducts();
  };

  const handleSold = async (id) => {
    await markAsSold(id);
    loadMyProducts();
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div style={{ padding: "2rem" }}>
      <h2>My Listings</h2>

      {products.length === 0 && <p>No products listed yet.</p>}

      <div style={{ display: "grid", gap: "1.5rem" }}>
        {products.map((p) => (
          <div
            key={p._id}
            style={{
              background: "#fff",
              padding: "1.5rem",
              borderRadius: "12px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
            }}
          >
            <h3>{p.title}</h3>
            <p>₹ {p.price}</p>
            <p>Status: {p.isSold ? "SOLD" : "Available"}</p>

            <div style={{ marginTop: "1rem", display: "flex", gap: "1rem" }}>
              {!p.isSold && (
                <button onClick={() => handleSold(p._id)}>
                  Mark as Sold
                </button>
              )}
              <button onClick={() => handleDelete(p._id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyListings;