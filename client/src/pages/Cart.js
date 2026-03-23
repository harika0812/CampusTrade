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
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [orderSnapshot, setOrderSnapshot] = useState({ totalItems: 0, totalAmount: 0 });

  const cartItemsForOrder = cart.items.map((item) => ({
    productId: item.productId,
    quantity: item.quantity,
  }));

  const fallbackTotalItems = Number(cart?.totalItems) || cart.items.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
  const fallbackTotalAmount = Number(cart?.totalAmount) || cart.items.reduce((sum, item) => {
    return sum + (Number(item.price) || 0) * (Number(item.quantity) || 0);
  }, 0);
  const displayTotalItems = Math.max(0, fallbackTotalItems);
  const displayTotalAmount = Math.max(0, fallbackTotalAmount);
  const formattedTotalAmount = displayTotalAmount.toLocaleString("en-IN");

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

  const handlePlaceOrder = () => {
    if (!meetupPlace.trim()) {
      showNotice("Please enter meetup place before payment", "error");
      return;
    }

    if (!cartItemsForOrder.length) {
      showNotice("No items in cart", "error");
      return;
    }

    setShowConfirmModal(true);
  };

  const handleConfirmPlaceOrder = async () => {
    setShowConfirmModal(false);

    try {
      setProcessingPayment(true);
      const currentOrderSnapshot = {
        totalItems: displayTotalItems,
        totalAmount: displayTotalAmount,
      };
      setOrderSnapshot(currentOrderSnapshot);

      await createOfflineOrders(cartItemsForOrder, meetupPlace.trim(), "cod");

      try {
        const cleared = await clearCart();
        setCart(cleared?.cart || { items: [], totalItems: 0, totalAmount: 0 });
      } catch {
        // Fallback refresh if clear-cart response is unavailable.
        await loadCart();
      }

      setMeetupPlace("");
      setShowCelebration(true);
      showNotice("Order placed with Cash on Delivery.");

      setTimeout(() => {
        setShowCelebration(false);
        navigate("/orders");
      }, 2200);
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
                  loading="lazy"
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

      {showConfirmModal ? (
        <div className="cart-payment-modal-backdrop" role="presentation" onClick={() => setShowConfirmModal(false)}>
          <div className="cart-payment-modal" role="dialog" aria-modal="true" aria-labelledby="order-confirm-title" onClick={(event) => event.stopPropagation()}>
            <h3 id="order-confirm-title">Confirm your order</h3>
            <p className="cart-payment-subtitle">Please verify details before you place the order.</p>
            <div className="cart-payment-summary">
              <div className="cart-payment-row">
                <span>Items</span>
                <strong>{displayTotalItems}</strong>
              </div>
              <div className="cart-payment-row">
                <span>Total</span>
                <strong>Rs. {formattedTotalAmount}</strong>
              </div>
              <div className="cart-payment-row">
                <span>Meetup place</span>
                <strong>{meetupPlace.trim()}</strong>
              </div>
              <div className="cart-payment-row">
                <span>Payment</span>
                <strong>Cash on Delivery</strong>
              </div>
            </div>
            <div className="cart-payment-modal-actions">
              <button className="btn btn-outline" onClick={() => setShowConfirmModal(false)}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleConfirmPlaceOrder} disabled={processingPayment}>
                {processingPayment ? "Placing..." : "Confirm Order"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {showCelebration ? (
        <div className="cart-celebration-backdrop" role="status" aria-live="polite">
          <div className="cart-celebration-modal">
            <div className="cart-confetti" aria-hidden="true">
              <span className="cart-confetti-piece" />
              <span className="cart-confetti-piece" />
              <span className="cart-confetti-piece" />
              <span className="cart-confetti-piece" />
              <span className="cart-confetti-piece" />
              <span className="cart-confetti-piece" />
            </div>
            <h3>Order placed successfully!</h3>
            <p>
              {orderSnapshot.totalItems} item(s) confirmed for Rs. {Number(orderSnapshot.totalAmount || 0).toLocaleString("en-IN")}.
            </p>
            <p className="cart-payment-hint">Taking you to your Orders page...</p>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default Cart;
