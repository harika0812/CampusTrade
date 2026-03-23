import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMyOrders, updateOfflineOrderStatus } from "../api/payment.api";
import { resolveServerAssetUrl } from "../utils/runtimeConfig";

const HIDDEN_ORDER_IDS_KEY = "campustrade_hidden_order_cards";

const resolveImageUrl = (imagePath) => {
  if (!imagePath) return "";
  return resolveServerAssetUrl(imagePath);
};

const formatDate = (value) => {
  if (!value) return "-";
  try {
    return new Date(value).toLocaleString();
  } catch {
    return "-";
  }
};

const formatStatus = (order) => {
  if (order.paymentMode === "offline") {
    const offlineStatus = order.offlineStatus || "placed";
    if (offlineStatus === "accepted") return "Seller accepted";
    if (offlineStatus === "scheduled") return "Meetup scheduled";
    if (offlineStatus === "completed") return "Completed";
    if (offlineStatus === "cancelled") return "Cancelled";
    return "Offline order placed";
  }
  if (order.status === "paid") return "Paid";
  return "Pending payment";
};

const getOfflineStatusNotice = (offlineStatus) => {
  if (offlineStatus === "scheduled") {
    return "Seller scheduled the order. Please coordinate meetup details in chat.";
  }
  return "Seller accepted your order. Cancellation is disabled.";
};

const MyOrders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingOrderId, setUpdatingOrderId] = useState("");
  const [hiddenOrderIds, setHiddenOrderIds] = useState(() => {
    try {
      const raw = localStorage.getItem(HIDDEN_ORDER_IDS_KEY);
      const parsed = JSON.parse(raw || "[]");
      return new Set(Array.isArray(parsed) ? parsed : []);
    } catch {
      return new Set();
    }
  });
  const [contextMenu, setContextMenu] = useState({
    visible: false,
    orderId: "",
    openKey: 0,
  });

  const loadOrders = async () => {
    try {
      setLoading(true);
      const response = await getMyOrders();
      setOrders(response?.orders || []);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  useEffect(() => {
    const closeContextMenu = () => {
      setContextMenu((prev) => (prev.visible ? { ...prev, visible: false, orderId: "" } : prev));
    };

    window.addEventListener("click", closeContextMenu);
    window.addEventListener("scroll", closeContextMenu);

    return () => {
      window.removeEventListener("click", closeContextMenu);
      window.removeEventListener("scroll", closeContextMenu);
    };
  }, []);

  const handleUpdateStatus = async (orderId, offlineStatus) => {
    try {
      setUpdatingOrderId(orderId);
      await updateOfflineOrderStatus(orderId, { offlineStatus });
      await loadOrders();
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to update order status");
    } finally {
      setUpdatingOrderId("");
    }
  };

  const persistHiddenOrderIds = (nextSet) => {
    localStorage.setItem(HIDDEN_ORDER_IDS_KEY, JSON.stringify(Array.from(nextSet)));
  };

  const visibleOrders = (orders || []).filter((order) => !hiddenOrderIds.has(String(order?._id || "")));

  const handleHideOrderCard = (orderId) => {
    const safeId = String(orderId || "");
    if (!safeId) return;
    const next = new Set(hiddenOrderIds);
    next.add(safeId);
    setHiddenOrderIds(next);
    persistHiddenOrderIds(next);
  };

  const handleOrderCardContextMenu = (event, orderId) => {
    event.preventDefault();
    setContextMenu({
      visible: true,
      orderId: String(orderId || ""),
      openKey: Date.now(),
    });
  };

  const handleContextDelete = () => {
    if (!contextMenu.orderId) return;
    handleHideOrderCard(contextMenu.orderId);
    setContextMenu((prev) => ({ ...prev, visible: false, orderId: "", openKey: 0 }));
  };

  return (
    <div className="container page page-shell cart-page">
      <div className="cart-header">
        <h1 className="cart-title">My Orders</h1>
        <div className="cart-summary-actions">
          <button className="btn btn-outline" onClick={() => navigate("/marketplace")}>Continue Shopping</button>
        </div>
      </div>

      {loading ? (
        <p className="cart-muted">Loading orders...</p>
      ) : error ? (
        <div className="cart-inline-notice error" role="status" aria-live="polite">
          <span className="cart-inline-icon" aria-hidden="true">⚠️</span>
          <span>{error}</span>
        </div>
      ) : visibleOrders.length === 0 ? (
        <div className="cart-empty">
          <p>No visible orders right now.</p>
          <button className="btn btn-primary" onClick={() => navigate("/marketplace")}>Browse Marketplace</button>
        </div>
      ) : (
        <div className="cart-grid purchase-orders-grid">
          {visibleOrders.map((order) => (
            <div
              key={order._id}
              className="cart-card purchase-order-card card-context-host"
              onContextMenu={(event) => handleOrderCardContextMenu(event, order._id)}
              title="Right click to manage card"
            >
              <div className="cart-content">
                <div className="purchase-order-top">
                  <h3>Order #{String(order._id).slice(-6).toUpperCase()}</h3>
                  <span className="purchase-status-chip">{formatStatus(order)}</span>
                </div>

                <div className="purchase-order-meta">
                  <p>Placed: {formatDate(order.createdAt)}</p>
                  <p>Mode: {order.paymentMode === "offline"
                    ? "Pay on Meetup"
                    : "Online"}
                  </p>
                  {order.paymentMode === "offline" ? (
                    <p>Offline Status: {order.offlineStatus || "placed"}</p>
                  ) : null}
                  {order.paymentMode === "offline" ? (
                    <p>Meetup Place: {order.meetupPlace || "Not shared"}</p>
                  ) : null}
                  {order?.offlinePaymentConfirmation?.note ? (
                    <p>Seller Payment Note: {order.offlinePaymentConfirmation.note}</p>
                  ) : null}
                  {order?.offlinePaymentConfirmation?.confirmedAt ? (
                    <p>Payment Confirmed At: {formatDate(order.offlinePaymentConfirmation.confirmedAt)}</p>
                  ) : null}
                  <p>Total: ₹ {order.amount}</p>
                </div>

                {order.paymentMode === "offline" && ["accepted", "scheduled"].includes(order.offlineStatus || "placed") ? (
                  <div className="cart-inline-notice success purchase-offline-notice" role="status" aria-live="polite">
                    <span className="cart-inline-icon" aria-hidden="true">✅</span>
                    <span>{getOfflineStatusNotice(order.offlineStatus || "placed")}</span>
                  </div>
                ) : null}

                {order.paymentMode === "offline" && (order.offlineStatus || "placed") === "placed" ? (
                  <div className="purchase-action-row">
                    <button
                      className="btn btn-outline"
                      onClick={() => handleUpdateStatus(order._id, "cancelled")}
                      disabled={updatingOrderId === order._id}
                    >
                      {updatingOrderId === order._id ? "Updating..." : "Cancel Order"}
                    </button>
                  </div>
                ) : null}

                {(order.sellerBreakdown || []).map((group, index) => (
                  <div key={`${order._id}-${index}`} className="purchase-seller-block">
                    <p className="purchase-seller-name">
                      Seller: {group?.seller?.name || "Seller"}
                    </p>
                    <div className="purchase-seller-action">
                      <button
                        className="btn btn-outline purchase-seller-contact-btn"
                        onClick={() =>
                          navigate(
                            `/chat?user=${group?.seller?._id || ""}&name=${encodeURIComponent(group?.seller?.name || "Seller")}`
                          )
                        }
                        disabled={!group?.seller?._id}
                      >
                        Message Seller
                      </button>
                    </div>
                    <div className="purchase-items-grid">
                      {(group.items || []).map((item, itemIndex) => (
                        <div
                          key={`${order._id}-${item.productId || itemIndex}`}
                          className="purchase-item-card"
                        >
                          {item.imageUrl ? (
                            <img
                              src={resolveImageUrl(item.imageUrl)}
                              alt={item.title || "Ordered product"}
                              className="purchase-item-image"
                              loading="lazy"
                            />
                          ) : (
                            <div className="purchase-item-image purchase-item-image-empty">
                              No Image
                            </div>
                          )}

                          <div className="purchase-item-content">
                            <p className="purchase-item-title">{item.title || "Product"}</p>
                            {item.category ? <p>Category: {item.category}</p> : null}
                            {item.description ? (
                              <p className="purchase-item-description">
                                {item.description.length > 100 ? `${item.description.slice(0, 100)}...` : item.description}
                              </p>
                            ) : null}
                            <p className="purchase-item-price">
                              Qty {item.quantity} • ₹ {item.price}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {contextMenu.visible && contextMenu.orderId === String(order._id) ? (
                <div
                  key={`bin-${contextMenu.openKey}`}
                  className="card-bin-menu card-bin-menu--card"
                  role="menu"
                  onClick={(event) => event.stopPropagation()}
                >
                  <button className="card-bin-button" onClick={handleContextDelete} aria-label="Delete card" title="Delete card">
                    🗑
                  </button>
                </div>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyOrders;
