// // import { useState } from "react";
// // import { createProduct } from "../api/product.api";
// // import "../styles/CreateListing.css";

// // const CreateListing = () => {
// //   const [formData, setFormData] = useState({
// //     title: "",
// //     description: "",
// //     price: "",
// //     category: "Others",
// //   });
// //   const [image, setImage] = useState(null);
// //   const [loading, setLoading] = useState(false);

// //   // Handle input change
// //   const handleChange = (e) => {
// //     setFormData({ ...formData, [e.target.name]: e.target.value });
// //   };

// //   // Submit product
// //   const handleSubmit = async (e) => {
// //     e.preventDefault();
// //     setLoading(true);

// //     try {
// //       await createProduct(formData);
// //       alert("🎉 Product listed successfully!");
// //       setFormData({
// //         title: "",
// //         description: "",
// //         price: "",
// //         category: "Others",
// //       });
// //     } catch (error) {
// //       alert(error.response?.data?.message || "Something went wrong");
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   return (
// //     <div className="sell-container">
// //       <h2>Sell a Product</h2>

// //       <form className="sell-form" onSubmit={handleSubmit}>
// //         <input
// //           type="text"
// //           name="title"
// //           placeholder="Product title"
// //           value={formData.title}
// //           onChange={handleChange}
// //           required
// //         />

// //         <textarea
// //           name="description"
// //           placeholder="Product description"
// //           value={formData.description}
// //           onChange={handleChange}
// //           required
// //         />

// //         <input
// //           type="number"
// //           name="price"
// //           placeholder="Price (₹)"
// //           value={formData.price}
// //           onChange={handleChange}
// //           required
// //         />

// //         <select name="category" value={formData.category} onChange={handleChange}>
// //           <option>Books</option>
// //           <option>Electronics</option>
// //           <option>Lab Equipment</option>
// //           <option>Notes</option>
// //           <option>Others</option>
// //         </select>

// //         <button disabled={loading}>
// //           {loading ? "Listing..." : "Create Listing"}
// //         </button>
// //       </form>
// //     </div>
// //   );
// // };

// // export default CreateListing;
// // // import { useState } from "react";
// // // import { createProduct } from "../api/product.api";
// // // import { useNavigate } from "react-router-dom";

// // // const CreateListing = () => {
// // //   const navigate = useNavigate();

// // //   const [form, setForm] = useState({
// // //     title: "",
// // //     description: "",
// // //     price: "",
// // //     category: "Others"
// // //   });

// // //   const handleChange = (e) => {
// // //     setForm({ ...form, [e.target.name]: e.target.value });
// // //   };

// // //   const handleSubmit = async (e) => {
// // //     e.preventDefault();

// // //     try {
// // //       await createProduct(form);
// // //       alert("Product listed successfully!");
// // //       navigate("/my-listings");
// // //     } catch (err) {
// // //       alert("Failed to create listing");
// // //     }
// // //   };

// // //   return (
// // //     <div style={styles.container}>
// // //       <h2>Sell a Product</h2>

// // //       <form onSubmit={handleSubmit} style={styles.form}>
// // //         <input name="title" placeholder="Title" onChange={handleChange} />
// // //         <textarea name="description" placeholder="Description" onChange={handleChange} />
// // //         <input name="price" type="number" placeholder="Price" onChange={handleChange} />

// // //         <select name="category" onChange={handleChange}>
// // //           <option>Books</option>
// // //           <option>Electronics</option>
// // //           <option>Notes</option>
// // //           <option>Others</option>
// // //         </select>

// // //         <button type="submit">List Product</button>
// // //       </form>
// // //     </div>
// // //   );
// // // };

// // // export default CreateListing;

// // // const styles = {
// // //   container: {
// // //     maxWidth: "500px",
// // //     margin: "60px auto",
// // //     fontFamily: "Arial"
// // //   },
// // //   form: {
// // //     display: "flex",
// // //     flexDirection: "column",
// // //     gap: "15px"
// // //   }
// // // };
// import { useState } from "react";
// import { createProduct } from "../api/product.api";
// import "../styles/CreateListing.css";

// const CreateListing = () => {
//   const [formData, setFormData] = useState({
//     title: "",
//     description: "",
//     price: "",
//     category: "Others",
//   });

//   const [image, setImage] = useState(null);
//   const [loading, setLoading] = useState(false);

//   // Handle text inputs
//   const handleChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   // Handle image input
//   const handleImageChange = (e) => {
//     setImage(e.target.files[0]);
//   };

//   // Submit product
//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (!image) {
//       alert("Please upload a product image 📸");
//       return;
//     }

//     setLoading(true);

//     try {
//       // 👇 IMPORTANT: use FormData
//       const data = new FormData();
//       data.append("title", formData.title);
//       data.append("description", formData.description);
//       data.append("price", formData.price);
//       data.append("category", formData.category);
//       data.append("image", image);

//       await createProduct(data);

//       alert("🎉 Product listed successfully!");

//       setFormData({
//         title: "",
//         description: "",
//         price: "",
//         category: "Others",
//       });
//       setImage(null);
//     } catch (error) {
//       alert(error.response?.data?.message || "Something went wrong");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="sell-container">
//       <h2>Sell a Product 🛒</h2>

//       <form className="sell-form" onSubmit={handleSubmit}>
//         <input
//           type="text"
//           name="title"
//           placeholder="Product title"
//           value={formData.title}
//           onChange={handleChange}
//           required
//         />

//         <textarea
//           name="description"
//           placeholder="Product description"
//           value={formData.description}
//           onChange={handleChange}
//           required
//         />

//         <input
//           type="number"
//           name="price"
//           placeholder="Price (₹)"
//           value={formData.price}
//           onChange={handleChange}
//           required
//         />

//         <select
//           name="category"
//           value={formData.category}
//           onChange={handleChange}
//         >
//           <option>Books</option>
//           <option>Electronics</option>
//           <option>Lab Equipment</option>
//           <option>Notes</option>
//           <option>Others</option>
//         </select>

//         {/* ✅ IMAGE INPUT */}
//         <input
//           type="file"
//           accept="image/*"
//           onChange={handleImageChange}
//           required
//         />

//         <button disabled={loading}>
//           {loading ? "Listing..." : "Create Listing"}
//         </button>
//       </form>
//     </div>
//   );
// };

// export default CreateListing;
import { useState } from "react";
import { createProduct } from "../api/product.api";
import "../styles/CreateListing.css";
import { useNavigate } from "react-router-dom"; // Add this import

const CreateListing = () => {
  const navigate = useNavigate(); // Add this
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    category: "Others",
  });

  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPostedCelebration, setShowPostedCelebration] = useState(false);

  // Handle text inputs
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle image input
  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  // Submit product
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!image) {
      alert("Please upload a product image 📸");
      return;
    }

    setLoading(true);

    try {
      // 👇 IMPORTANT: use FormData
      const data = new FormData();
      data.append("title", formData.title);
      data.append("description", formData.description);
      data.append("price", formData.price);
      data.append("category", formData.category);
      data.append("image", image);

      await createProduct(data);

      setShowPostedCelebration(true);
      setTimeout(() => setShowPostedCelebration(false), 2500);

      setFormData({
        title: "",
        description: "",
        price: "",
        category: "Others",
      });
      setImage(null);
      navigate("/my-listings"); // Add this to navigate to my listings
    } catch (error) {
      alert(error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="sell-container">
      <div className={`celebration-overlay ${showPostedCelebration ? "active" : ""}`} aria-hidden={!showPostedCelebration}>
        <div className="celebration-card">
          <div className="confetti confetti-1" />
          <div className="confetti confetti-2" />
          <div className="confetti confetti-3" />
          <div className="confetti confetti-4" />
          <div className="confetti confetti-5" />
          <h3 className="celebration-title">Item posted 🎉</h3>
          <p className="celebration-subtitle">Your campus is about to find a great deal.</p>
        </div>
      </div>
      <h2>Sell a Product 🛒</h2>

      <form className="sell-form" onSubmit={handleSubmit}>
        <input
          type="text"
          name="title"
          placeholder="Product title"
          value={formData.title}
          onChange={handleChange}
          required
        />

        <textarea
          name="description"
          placeholder="Product description"
          value={formData.description}
          onChange={handleChange}
          required
        />

        <input
          type="number"
          name="price"
          placeholder="Price (₹)"
          value={formData.price}
          onChange={handleChange}
          required
        />

        <select
          name="category"
          value={formData.category}
          onChange={handleChange}
        >
          <option>Books</option>
          <option>Electronics</option>
          <option>Lab Equipment</option>
          <option>Notes</option>
          <option>Others</option>
        </select>

        {/* ✅ IMAGE INPUT */}
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          required
        />

        <button disabled={loading}>
          {loading ? "Listing..." : "Create Listing"}
        </button>
      </form>
    </div>
  );
};

export default CreateListing;