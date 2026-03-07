
import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/marketplace.css";

const ProductCard = ({ product }) => {
  const navigate = useNavigate();

  /**
   * Navigate to product details page
   */
  const handleViewDetails = () => {
    navigate(`/products/${product._id}`);
  };

  return (
    <div className="product-card">
      <h3 className="product-title">{product.title}</h3>
      <p className="product-category">{product.category}</p>
      <p className="product-price">₹ {product.price}</p>
      
      <div className="product-seller-info">
        <p className="seller-name">{product.sellerName}</p>
        <p className="seller-trust">
          {product.sellerRollNo || "N/A"}
        </p>
        <p className="seller-details">
          {product.seller?.className || "N/A"} • {product.seller?.branch || "N/A"} • Year {product.seller?.year || "N/A"}
        </p>
      </div>

      {/* Clicking this opens details page */}
      <button className="view-btn" onClick={handleViewDetails}>
        View Details
      </button>
    </div>
  );
};

export default ProductCard;
