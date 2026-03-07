import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { clearCart, getCart, removeFromCart } from "../api/cart.api";
import {
  createOfflineOrders,
} from "../api/payment.api";
import { resolveServerAssetUrl } from "../utils/runtimeConfig";

const Cart = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState({ items: [], totalItems: 0, totalAmount: 0 });
  const [loading, setLoading] = useState(true);
  const [workingProductId, setWorkingProductId] = useState(null);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [meetupPlace, setMeetupPlace] = useState("");
  const [notice, setNotice] = useState({ message: "", type: "success" });

  const cartItemsForOrder = cart.items.map((item) => ({
    productId: item.productId,
    quantity: item.quantity,
  }));

  const showNotice = (message, type = "success") => {
    setNotice({ message, type });
    setTimeout(() => {
      setNotice({ message: "", type: "success" });
    }, 1800);
  };

  const loadCart = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getCart();
      setCart(data || { items: [], totalItems: 0, totalAmount: 0 });
    } catch (error) {
      showNotice(error?.response?.data?.message || "Failed to load cart", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCart();
  }, [loadCart]);

  const handleRemove = async (productId) => {
    try {
      setWorkingProductId(productId);
      const response = await removeFromCart(productId);
      setCart(response?.cart || { items: [], totalItems: 0, totalAmount: 0 });
      showNotice("Removed from cart");
    } catch (error) {
      showNotice(error?.response?.data?.message || "Failed to remove item", "error");
    } finally {
      setWorkingProductId(null);
    }
  };

  const handleClear = async () => {
    try {
      const response = await clearCart();
      setCart(response?.cart || { items: [], totalItems: 0, totalAmount: 0 });
      showNotice("Cart cleared");
    } catch (error) {
      showNotice(error?.response?.data?.message || "Failed to clear cart", "error");
    }
  };

  const handlePlaceOrder = async () => {
    if (!meetupPlace.trim()) {
      showNotice("Please enter meetup place before payment", "error");
      return;
    }

    try {
      if (!cartItemsForOrder.length) {
        showNotice("No items in cart", "error");
        return;
      }

      setProcessingPayment(true);

      await createOfflineOrders(cartItemsForOrder, meetupPlace.trim(), "cod");

      try {
        const cleared = await clearCart();
        setCart(cleared?.cart || { items: [], totalItems: 0, totalAmount: 0 });
      } catch {
        // Fallback refresh if clear-cart response is unavailable.
        await loadCart();
      }

      showNotice("Order placed with Cash on Delivery.");

      setTimeout(() => {
        navigate("/orders");
      }, 500);
    } catch (error) {
      showNotice(error?.response?.data?.message || "Failed to place order", "error");
    } finally {
      setProcessingPayment(false);
    }
  };

  if (loading) {
    return (
      <div className="container page page-shell cart-page">
        <h1 className="cart-title">My Cart</h1>
        <p className="cart-muted">Loading cart...</p>
      </div>
    );
  }

  return (
    <div className="container page page-shell cart-page">
      {notice.message && (
        <div className={`cart-inline-notice ${notice.type}`} role="status" aria-live="polite">
          <span className="cart-inline-icon" aria-hidden="true">{notice.type === "error" ? "⚠️" : "✅"}</span>
          <span>{notice.message}</span>
        </div>
      )}

      <div className="cart-header">
        <h1 className="cart-title">My Cart</h1>
        <button className="btn btn-outline" onClick={() => navigate("/marketplace")}>Continue Shopping</button>
      </div>

      {cart.items.length === 0 ? (
        <div className="cart-empty">
          <p>Your cart is empty.</p>
          <button className="btn btn-primary" onClick={() => navigate("/marketplace")}>Browse Marketplace</button>
        </div>
      ) : (
        <>
          <div className="cart-grid">
            {cart.items.map((item) => (
              <div key={item.productId} className="cart-card">
                <img
                  src={item.image ? resolveServerAssetUrl(item.image) : "https://via.placeholder.com/120?text=Item"}
                  alt={item.title}
                  className="cart-image"
                />
                <div className="cart-content">
                  <h3>{item.title}</h3>
                  <p>₹ {item.price}</p>
                  <p className="cart-muted">Qty: {item.quantity}</p>
                  <p className="cart-muted">Payment: Cash on Delivery</p>
                </div>
                <button
                  className="btn btn-outline"
                  onClick={() => handleRemove(item.productId)}
                  disabled={workingProductId === item.productId}
                >
                  {workingProductId === item.productId ? "Removing..." : "Remove"}
                </button>
              </div>
            ))}
          </div>

          <div className="cart-summary">
            <div>
              <p>Total items: {cart.totalItems}</p>
              <h3>Total: ₹ {cart.totalAmount}</h3>
              <p className="cart-muted">Meet the seller and pay directly. Platform handles order coordination only.</p>
              <div className="cart-meetup-block">
                <label htmlFor="meetup-place" className="cart-meetup-label">
                  Meetup Place
                </label>
                <input
                  id="meetup-place"
                  type="text"
                  value={meetupPlace}
                  onChange={(event) => setMeetupPlace(event.target.value)}
                  placeholder="e.g. Library front gate, 4 PM"
                  className="cart-meetup-input"
                />
              </div>
            </div>
            <div className="cart-summary-actions">
              <button className="btn btn-outline" onClick={handleClear}>Clear Cart</button>
              <button
                className="btn btn-primary"
                onClick={handlePlaceOrder}
                disabled={processingPayment || cart.items.length === 0}
              >
                {processingPayment ? "Placing..." : "Place Order"}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Cart;
