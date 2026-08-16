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
import { useEffect, useState } from "react";
import { createProduct } from "../api/product.api";
import "../styles/CreateListing.css";
import { useNavigate } from "react-router-dom"; // Add this import
import { getMyProfile } from "../api/user.api";

const DRAFT_STORAGE_KEY = "campustrade_create_listing_draft";
const EMPTY_FORM_DATA = {
  title: "",
  description: "",
  price: "",
  availableCopies: 1,
  listingType: "sell",
  borrowFee: "",
  maxDurationDays: 7,
  lendingTerms: "",
  category: "Others",
};
const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

const validateSelectedImage = (file) => {
  if (!file) {
    return { ok: false, message: "Please choose a product image." };
  }

  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    return { ok: false, message: "Only JPG, PNG, and WEBP images are allowed." };
  }

  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    return { ok: false, message: "Image must be smaller than 5MB." };
  }

  return { ok: true, message: "" };
};

const CreateListing = () => {
  const navigate = useNavigate(); // Add this
  const [formData, setFormData] = useState(EMPTY_FORM_DATA);

  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPostedCelebration, setShowPostedCelebration] = useState(false);
  const [hasRequiredProfileDetails, setHasRequiredProfileDetails] = useState(false);
  const [isProfileCheckLoading, setIsProfileCheckLoading] = useState(true);
  const [feedback, setFeedback] = useState({ type: "", message: "" });
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [draftImageName, setDraftImageName] = useState("");
  const [imagePreviewUrl, setImagePreviewUrl] = useState("");

  useEffect(() => {
    let active = true;
    const loadProfile = async () => {
      if (active) setIsProfileCheckLoading(true);
      try {
        const data = await getMyProfile();
        const rollNo = String(data?.user?.rollNo || "").trim();
        const className = String(data?.user?.className || "").trim();
        const branch = String(data?.user?.branch || "").trim();
        const year = String(data?.user?.year || "").trim();
        if (active) setHasRequiredProfileDetails(Boolean(rollNo && className && branch && year));
      } catch {
        if (active) setHasRequiredProfileDetails(false);
      } finally {
        if (active) setIsProfileCheckLoading(false);
      }
    };
    loadProfile();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    try {
      const savedDraft = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (!savedDraft) return;

      const parsedDraft = JSON.parse(savedDraft);
      if (!parsedDraft?.formData) return;

      setFormData((previous) => ({ ...previous, ...parsedDraft.formData }));
      if (parsedDraft.imageName) {
        setDraftImageName(parsedDraft.imageName);
      }

      setFeedback({
        type: "success",
        message: "Draft restored. Your unfinished listing has been recovered.",
      });
    } catch {
      localStorage.removeItem(DRAFT_STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    const handleConnectionStatus = () => {
      setIsOffline(!navigator.onLine);
      if (navigator.onLine) {
        setFeedback({ type: "success", message: "Connection restored. Your draft is still saved." });
      }
    };

    window.addEventListener("online", handleConnectionStatus);
    window.addEventListener("offline", handleConnectionStatus);

    return () => {
      window.removeEventListener("online", handleConnectionStatus);
      window.removeEventListener("offline", handleConnectionStatus);
    };
  }, []);

  useEffect(() => {
    return () => {
      if (imagePreviewUrl) {
        URL.revokeObjectURL(imagePreviewUrl);
      }
    };
  }, [imagePreviewUrl]);

  useEffect(() => {
    const hasAnyDraftContent = Object.values(formData).some((value) => {
      if (typeof value === "string") return value.trim().length > 0;
      if (typeof value === "number") return value !== 0 && value !== 1;
      return Boolean(value);
    });

    if (!hasAnyDraftContent && !draftImageName && !image) {
      localStorage.removeItem(DRAFT_STORAGE_KEY);
      return;
    }

    localStorage.setItem(
      DRAFT_STORAGE_KEY,
      JSON.stringify({
        formData,
        imageName: image?.name || draftImageName || "",
        savedAt: Date.now(),
      })
    );
  }, [formData, image, draftImageName]);

  // Handle text inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    const nextValue = name === "category" ? value.replace(/\s+/g, "") : value;
    setFormData((previous) => ({ ...previous, [name]: nextValue }));
    if (feedback.message) setFeedback({ type: "", message: "" });
  };

  // Handle image input
  const handleImageChange = (e) => {
    const nextImage = e.target.files?.[0] || null;
    const validation = validateSelectedImage(nextImage);

    if (!nextImage) {
      setImage(null);
      setDraftImageName("");
      if (imagePreviewUrl) {
        URL.revokeObjectURL(imagePreviewUrl);
      }
      setImagePreviewUrl("");
      return;
    }

    if (!validation.ok) {
      setImage(null);
      setDraftImageName("");
      setFeedback({ type: "error", message: validation.message });
      e.target.value = "";
      if (imagePreviewUrl) {
        URL.revokeObjectURL(imagePreviewUrl);
      }
      setImagePreviewUrl("");
      return;
    }

    if (imagePreviewUrl) {
      URL.revokeObjectURL(imagePreviewUrl);
    }

    const nextPreviewUrl = URL.createObjectURL(nextImage);
    setImage(nextImage);
    setDraftImageName(nextImage.name);
    setImagePreviewUrl(nextPreviewUrl);
    if (feedback.message) setFeedback({ type: "", message: "" });
  };

  // Submit product
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!image) {
      setFeedback({ type: "error", message: "Please upload a product image." });
      return;
    }

    const validation = validateSelectedImage(image);
    if (!validation.ok) {
      setFeedback({ type: "error", message: validation.message });
      return;
    }

    if (isProfileCheckLoading) {
      setFeedback({ type: "info", message: "Checking your profile. Please try again in a moment." });
      return;
    }

    if (!hasRequiredProfileDetails) {
      setFeedback({ type: "error", message: "Update profile before listing item." });
      navigate("/profile");
      return;
    }

    setLoading(true);

    try {
      // 👇 IMPORTANT: use FormData
      const data = new FormData();
      data.append("title", formData.title);
      data.append("description", formData.description);
      data.append("price", formData.price);
      data.append("availableCopies", formData.availableCopies);
      data.append("listingType", formData.listingType);
      data.append("paymentOption", "cod");

      if (formData.listingType === "both") {
        data.append("borrowFee", formData.borrowFee);
      }

      if (formData.listingType === "lend" || formData.listingType === "both") {
        data.append("maxDurationDays", formData.maxDurationDays);
        data.append("lendingTerms", formData.lendingTerms);
      }

      data.append("category", formData.category);
      data.append("image", image);

      await createProduct(data);

      setShowPostedCelebration(true);
      setTimeout(() => setShowPostedCelebration(false), 2500);
      setFeedback({ type: "success", message: "Listing created successfully." });

      setFormData(EMPTY_FORM_DATA);
      setImage(null);
      setDraftImageName("");
      localStorage.removeItem(DRAFT_STORAGE_KEY);
      navigate("/my-listings"); // Add this to navigate to my listings
    } catch (error) {
      console.error("PRODUCT CREATE ERROR:", error);
      console.error("Response data:", error?.response?.data);
      console.error("Response status:", error?.response?.status);
      const details = error?.response?.data?.details;
      const message = error?.response?.data?.message;
      const errorMsg = details || message || error?.message || "Something went wrong";
      setFeedback({ type: "error", message: errorMsg });
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
      <h2 className="sell-heading">{formData.listingType === "lend" ? "Lend a Product" : "Sell a Product"}</h2>
      <p className="sell-subcopy">Post clear details so buyers and borrowers can trust your listing quickly.</p>

      {feedback.message ? (
        <div className={`sell-feedback ${feedback.type === "error" ? "error" : "success"}`} role="status" aria-live="polite">
          {feedback.message}
        </div>
      ) : null}

      {isOffline ? (
        <div className="sell-feedback info" role="status" aria-live="polite">
          You are offline. Your draft is being saved locally so you can continue later.
        </div>
      ) : null}

      {draftImageName ? (
        <div className="sell-feedback info" role="status" aria-live="polite">
          Saved image: {draftImageName}. Please re-select it if needed before submitting.
        </div>
      ) : null}

      {isProfileCheckLoading ? (
        <div className="sell-blocker" role="status" aria-live="polite">
          <p>Checking profile details...</p>
        </div>
      ) : !hasRequiredProfileDetails ? (
        <div className="sell-blocker" role="alert">
          <p>Update profile before listing item.</p>
          <button type="button" className="btn btn-outline sell-blocker-btn" onClick={() => navigate("/profile")}>Go to Edit Profile</button>
        </div>
      ) : null}

      <form className="sell-form" onSubmit={handleSubmit}>
        <label className="field-label" htmlFor="listingType">
          What do you want to do?
        </label>
        <p className="field-help">
          Choose <strong>Sell</strong> if ownership transfers. Choose <strong>Lend</strong> if you expect the item back.
        </p>
        <select
          id="listingType"
          name="listingType"
          value={formData.listingType}
          onChange={handleChange}
        >
          <option value="sell">Sell (one-time purchase)</option>
          <option value="lend">Lend (temporary borrowing)</option>
          <option value="both">Both (sell or lend)</option>
        </select>

        <label className="field-label" htmlFor="title">
          Item name
        </label>

        <input
          id="title"
          type="text"
          name="title"
          placeholder="Example: Scientific Calculator"
          value={formData.title}
          onChange={handleChange}
          required
        />

        <label className="field-label" htmlFor="description">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          placeholder="Condition, brand, model, and anything buyer/borrower should know"
          value={formData.description}
          onChange={handleChange}
          required
        />

        <label className="field-label" htmlFor="price">
          {formData.listingType === "lend" ? "Borrowing fee (₹)" : "Selling price (₹)"}
        </label>
        <input
          id="price"
          type="number"
          name="price"
          placeholder={formData.listingType === "lend" ? "Example: 50" : "Example: 2500"}
          value={formData.price}
          onChange={handleChange}
          required
        />

        {formData.listingType === "both" ? (
          <>
            <label className="field-label" htmlFor="borrowFee">
              Borrowing fee (₹)
            </label>
            <input
              id="borrowFee"
              type="number"
              name="borrowFee"
              placeholder="Example: 50"
              value={formData.borrowFee}
              min={0}
              onChange={handleChange}
              required
            />
          </>
        ) : null}

        <label className="field-label" htmlFor="availableCopies">
          How many copies are available?
        </label>
        <p className="field-help">If only 1 copy exists, enter 1.</p>
        <input
          id="availableCopies"
          type="number"
          name="availableCopies"
          placeholder="Available copies"
          value={formData.availableCopies}
          min={1}
          onChange={handleChange}
          required
        />

        {formData.listingType === "lend" || formData.listingType === "both" ? (
          <>
            <label className="field-label" htmlFor="maxDurationDays">
              Maximum borrow duration (days)
            </label>
            <input
              id="maxDurationDays"
              type="number"
              name="maxDurationDays"
              placeholder="Max lending duration (days)"
              value={formData.maxDurationDays}
              min={1}
              onChange={handleChange}
              required
            />

            <label className="field-label" htmlFor="lendingTerms">
              Lending terms (optional)
            </label>
            <textarea
              id="lendingTerms"
              name="lendingTerms"
              placeholder="Optional: write your lending rules here. Example: Return within 7 days, return in good condition, no damage, include charger, late return fee ₹50/day."
              value={formData.lendingTerms}
              onChange={handleChange}
              rows={3}
            />
          </>
        ) : null}

        <label className="field-label" htmlFor="category">
          Category
        </label>
        <input
          id="category"
          type="text"
          name="category"
          placeholder="Example: Books"
          value={formData.category}
          onChange={handleChange}
          autoComplete="off"
          required
        />

        <label className="field-label" htmlFor="listingImage">
          Product image
        </label>
        <p className="field-help">Upload a clear JPG, PNG, or WEBP image under 5MB for faster responses.</p>
        <input
          id="listingImage"
          className="sell-file-input"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleImageChange}
          required
        />

        {imagePreviewUrl ? (
          <div className="image-preview-wrap">
            <img src={imagePreviewUrl} alt="Selected product preview" className="image-preview" />
            <span className="image-preview-name">{draftImageName}</span>
          </div>
        ) : null}

        <button className="btn btn-primary sell-submit-btn" disabled={loading}>
          {loading ? "Listing..." : "Create Listing"}
        </button>
      </form>
    </div>
  );
};

export default CreateListing;