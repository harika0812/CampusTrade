import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { fetchProductById, updateProduct } from "../api/product.api";
import { getMyProfile } from "../api/user.api";
import { resolveServerAssetUrl } from "../utils/runtimeConfig";
import "../styles/CreateListing.css";

const resolveImageUrl = (imagePath) => {
  if (!imagePath) return "";
  return resolveServerAssetUrl(imagePath);
};

const EditListing = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    availableCopies: 1,
    listingType: "sell",
    paymentOption: "cod",
    borrowFee: "",
    maxDurationDays: 7,
    lendingTerms: "",
    category: "",
  });
  const [existingImage, setExistingImage] = useState("");
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasRequiredProfileDetails, setHasRequiredProfileDetails] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", message: "" });

  useEffect(() => {
    let active = true;
    const loadProduct = async () => {
      try {
        const [product, profileData] = await Promise.all([fetchProductById(id), getMyProfile()]);
        setFormData({
          title: product?.title || "",
          description: product?.description || "",
          price: product?.price || "",
          availableCopies: product?.availableCopies ?? 1,
          listingType: product?.listingType || "sell",
          paymentOption: "cod",
          borrowFee: product?.lendingDetails?.borrowFee ?? "",
          maxDurationDays: product?.lendingDetails?.maxDurationDays ?? 7,
          lendingTerms: product?.lendingDetails?.terms || "",
          category: String(product?.category || "").replace(/\s+/g, ""),
        });
        const rollNo = String(profileData?.user?.rollNo || "").trim();
        const className = String(profileData?.user?.className || "").trim();
        const branch = String(profileData?.user?.branch || "").trim();
        const year = String(profileData?.user?.year || "").trim();
        if (active) setHasRequiredProfileDetails(Boolean(rollNo && className && branch && year));
        setExistingImage(Array.isArray(product?.images) && product.images.length > 0 ? product.images[0] : "");
      } catch (error) {
        setFeedback({ type: "error", message: error?.response?.data?.message || "Failed to load listing" });
        navigate("/my-listings");
      } finally {
        if (active) setLoading(false);
      }
    };

    loadProduct();
    return () => {
      active = false;
    };
  }, [id, navigate]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    const nextValue = name === "category" ? value.replace(/\s+/g, "") : value;
    setFormData((prev) => ({ ...prev, [name]: nextValue }));
    if (feedback.message) setFeedback({ type: "", message: "" });
  };

  const handleImageChange = (event) => {
    setImage(event.target.files?.[0] || null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!hasRequiredProfileDetails) {
      setFeedback({ type: "error", message: "Update profile before listing item." });
      navigate("/profile");
      return;
    }

    setSaving(true);

    try {
      const payload = new FormData();
      payload.append("title", formData.title);
      payload.append("description", formData.description);
      payload.append("price", formData.price);
      payload.append("availableCopies", formData.availableCopies);
      payload.append("listingType", formData.listingType);
      payload.append("paymentOption", "cod");

      if (formData.listingType === "both") {
        payload.append("borrowFee", formData.borrowFee);
      }

      if (formData.listingType === "lend" || formData.listingType === "both") {
        payload.append("maxDurationDays", formData.maxDurationDays);
        payload.append("lendingTerms", formData.lendingTerms);
      }

      payload.append("category", formData.category);
      if (image) payload.append("image", image);

      await updateProduct(id, payload);
      setFeedback({ type: "success", message: "Listing updated successfully." });
      navigate("/my-listings");
    } catch (error) {
      const details = error?.response?.data?.details;
      const message = error?.response?.data?.message;
      setFeedback({ type: "error", message: details || message || "Failed to update listing" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="sell-container">
        <h2 className="sell-heading">Edit Listing</h2>
        <p className="sell-subcopy">Loading your listing details...</p>
        <p>Loading listing details...</p>
      </div>
    );
  }

  return (
    <div className="sell-container">
      <h2 className="sell-heading">Edit Listing</h2>
      <p className="sell-subcopy">Update details below and keep your listing accurate for campus buyers.</p>

      {feedback.message ? (
        <div className={`sell-feedback ${feedback.type === "error" ? "error" : "success"}`} role="status" aria-live="polite">
          {feedback.message}
        </div>
      ) : null}

      {!hasRequiredProfileDetails ? (
        <div className="sell-blocker" role="alert">
          <p>Update profile before listing item.</p>
          <button type="button" className="btn btn-outline sell-blocker-btn" onClick={() => navigate("/profile")}>Go to Edit Profile</button>
        </div>
      ) : null}

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
          placeholder={formData.listingType === "lend" ? "Borrowing fee (₹)" : "Selling price (₹)"}
          value={formData.price}
          onChange={handleChange}
          required
        />

        <select
          name="listingType"
          value={formData.listingType}
          onChange={handleChange}
        >
          <option value="sell">Sell</option>
          <option value="lend">Lend</option>
          <option value="both">Both</option>
        </select>

        <label className="field-label" htmlFor="paymentOptionEdit">
          Accepted payment mode
        </label>
        <p className="field-help">Platform supports COD only.</p>
        <select
          id="paymentOptionEdit"
          name="paymentOption"
          value={formData.paymentOption}
          onChange={handleChange}
          disabled
        >
          <option value="cod">COD only</option>
        </select>

        {formData.listingType === "both" ? (
          <input
            type="number"
            name="borrowFee"
            placeholder="Borrowing fee (₹)"
            value={formData.borrowFee}
            min={0}
            onChange={handleChange}
            required
          />
        ) : null}

        {formData.listingType === "lend" || formData.listingType === "both" ? (
          <>
            <input
              type="number"
              name="maxDurationDays"
              placeholder="Maximum borrow duration (days)"
              value={formData.maxDurationDays}
              min={1}
              onChange={handleChange}
              required
            />

            <textarea
              name="lendingTerms"
              placeholder="Optional lending terms"
              value={formData.lendingTerms}
              onChange={handleChange}
              rows={3}
            />
          </>
        ) : null}

        <input
          type="number"
          name="availableCopies"
          placeholder="Available copies"
          value={formData.availableCopies}
          min={0}
          onChange={handleChange}
          required
        />

        <input
          name="category"
          type="text"
          placeholder="Example: Books"
          value={formData.category}
          onChange={handleChange}
          autoComplete="off"
          required
        />

        {existingImage ? (
          <img
            src={resolveImageUrl(existingImage)}
            alt={formData.title || "Current listing"}
            className="edit-existing-image"
          />
        ) : null}

        <label className="field-label" htmlFor="listingImageUpdate">
          Replace image (optional)
        </label>
        <input
          id="listingImageUpdate"
          className="sell-file-input"
          type="file"
          accept="image/*"
          onChange={handleImageChange}
        />

        <div className="edit-actions">
          <button type="button" className="btn btn-outline" onClick={() => navigate("/my-listings")} disabled={saving}>
            Cancel
          </button>
          <button className="btn btn-primary" disabled={saving}>
            {saving ? "Updating..." : "Update Listing"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditListing;
