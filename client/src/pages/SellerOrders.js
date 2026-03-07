import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getSellerOrders, updateOfflineOrderStatus } from "../api/payment.api";
import { fetchMyListings } from "../api/product.api";
import { resolveServerAssetUrl } from "../utils/runtimeConfig";

const SOLD_NOTIFICATION_KEY = "campustrade_sold_notifications";
const SALES_HUB_UPDATED_EVENT = "sales-hub-updated";
const HIDDEN_SALES_ORDER_IDS_KEY = "campustrade_hidden_sales_order_cards";

const resolveImageUrl = (imagePath) => {
  if (!imagePath) return "";
  return resolveServerAssetUrl(imagePath);
};

const getDisplayStatus = (order) => {
  if (order?.paymentMode !== "offline") {
    const paid = String(order?.status || "pending").toLowerCase() === "paid";
    return paid ? "Paid" : "Pending";
  }

  const offlineStatus = String(order?.offlineStatus || "placed");
  if (offlineStatus === "placed") return "Pending";
  if (offlineStatus === "accepted") return "Accepted";
  if (offlineStatus === "scheduled") return "Scheduled";
  if (offlineStatus === "completed") return "Completed";
  if (offlineStatus === "cancelled") return "Cancelled";
  return "Pending";
};

const SellerOrders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [soldListings, setSoldListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingOrderId, setUpdatingOrderId] = useState("");
  const [soldAlert, setSoldAlert] = useState(null);
  const [hiddenOrderIds, setHiddenOrderIds] = useState(() => {
    try {
      const raw = localStorage.getItem(HIDDEN_SALES_ORDER_IDS_KEY);
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

  const loadSoldListings = useCallback(async () => {
    try {
      const listings = await fetchMyListings();
      const soldItems = (listings || []).filter((item) => {
        const stockStatus = item?.stockStatus;
        const isSold = Boolean(item?.isSold);
        return isSold || stockStatus === "sold_out";
      });
      setSoldListings(soldItems);
    } catch {
      setSoldListings([]);
    }
  }, []);

  const loadSoldAlert = useCallback(() => {
    const items = JSON.parse(localStorage.getItem(SOLD_NOTIFICATION_KEY) || "[]");
    if (!Array.isArray(items) || items.length === 0) {
      setSoldAlert(null);
      return;
    }

    const latest = items[0];
    setSoldAlert(latest);
  }, []);

  const loadOrders = useCallback(async () => {
    try {
      setLoading(true);
      const [ordersResponse] = await Promise.all([
        getSellerOrders(),
        loadSoldListings(),
      ]);
      setOrders(ordersResponse?.orders || []);
      setError("");
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load sales");
    } finally {
      setLoading(false);
    }
  }, [loadSoldListings]);

  useEffect(() => {
    loadSoldAlert();
    loadOrders();

    const handleSalesHubUpdate = () => {
      loadSoldAlert();
      loadOrders();
    };

    window.addEventListener(SALES_HUB_UPDATED_EVENT, handleSalesHubUpdate);

    return () => {
      window.removeEventListener(SALES_HUB_UPDATED_EVENT, handleSalesHubUpdate);
    };
  }, [loadOrders, loadSoldAlert]);

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

  const persistHiddenOrderIds = (nextSet) => {
    localStorage.setItem(HIDDEN_SALES_ORDER_IDS_KEY, JSON.stringify(Array.from(nextSet)));
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

  const handleUpdateStatus = async (orderId, offlineStatus) => {
    try {
      setUpdatingOrderId(orderId);
      setError("");

      let payload = { offlineStatus };

      if (offlineStatus === "completed") {
        payload = {
          offlineStatus,
          paymentReceivedNote: "Payment received at meetup.",
        };
      }

      await updateOfflineOrderStatus(orderId, payload);
      await loadOrders();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to update order status");
    } finally {
      setUpdatingOrderId("");
    }
  };

  if (loading) {
    return (
      <div className="container page page-shell cart-page sales-page">
        <div className="cart-header">
          <h1 className="cart-title">Sales</h1>
        </div>
        <p className="cart-muted">Loading sales...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container page page-shell cart-page sales-page">
        <div className="cart-header">
          <h1 className="cart-title">Sales</h1>
        </div>
        <div className="cart-inline-notice error" role="status" aria-live="polite">
          <span className="cart-inline-icon" aria-hidden="true">⚠️</span>
          <span>{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container page page-shell cart-page sales-page">
      <div className="cart-header">
        <h1 className="cart-title">Sales</h1>
        <button className="btn btn-outline" onClick={() => navigate("/marketplace")}>Continue Shopping</button>
      </div>

      {soldAlert ? (
        <div className="cart-inline-notice success sales-success" role="status" aria-live="polite">
          Hooray! Congratulations on selling your product successfully: {soldAlert?.title || "Product"}.
        </div>
      ) : null}

      {soldListings.length > 0 ? (
        <div className="sales-sold-section">
          <h3 className="sales-section-title">Sold Listings</h3>
          <div className="sales-sold-grid">
            {soldListings.slice(0, 6).map((item) => (
              <div key={item._id} className="sales-sold-card">
                <div className="sales-sold-meta">
                  <p className="sales-sold-title">{item.title}</p>
                  <p className="sales-sold-price">₹{item.price}</p>
                </div>
                <span className="sales-badge">SOLD</span>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {visibleOrders.length === 0 ? (
        <p className="cart-muted">No orders yet.</p>
      ) : (
        <div className="cart-grid sales-orders-grid">
          {visibleOrders.map((order) => (
            <div
              key={order._id}
              className="cart-card sales-order-card card-context-host"
              onContextMenu={(event) => handleOrderCardContextMenu(event, order._id)}
              title="Right click to manage card"
            >
              {(() => {
                const offlineStatus = String(order.offlineStatus || "placed");
                const canUpdateOffline =
                  order.paymentMode === "offline" && !["completed", "cancelled"].includes(offlineStatus);
                const displayStatus = getDisplayStatus(order);
                return (
                  <>
              <div className="sales-order-top">
                <h3 className="sales-order-id">Order #{String(order._id).slice(-6).toUpperCase()}</h3>
                <span className="sales-order-status">{displayStatus}</span>
              </div>

              <div className="sales-order-meta-grid">
                <p><strong>Buyer Name:</strong> {order.buyer?.name || "Unknown"}</p>
                <p><strong>Payment Mode:</strong> {order.paymentMode}</p>
                {order.paymentMode === "offline" ? (
                  <p><strong>Offline Status:</strong> {order.offlineStatus || "placed"}</p>
                ) : null}
                <p><strong>Meetup Place:</strong> {order.meetupPlace || "Not shared"}</p>
                {order?.offlinePaymentConfirmation?.note ? (
                  <p><strong>Payment Note:</strong> {order.offlinePaymentConfirmation.note}</p>
                ) : null}
                {order?.offlinePaymentConfirmation?.confirmedAt ? (
                  <p><strong>Payment Confirmed At:</strong> {new Date(order.offlinePaymentConfirmation.confirmedAt).toLocaleString()}</p>
                ) : null}
                <p><strong>Your Amount:</strong> ₹{order.sellerAmount}</p>
                <p><strong>Placed:</strong> {new Date(order.createdAt).toLocaleString()}</p>
              </div>

              {!order.meetupPlace && ["placed", "accepted", ""].includes(order.offlineStatus || "") ? (
                <div className="cart-inline-notice sales-warning" role="status" aria-live="polite">
                  <div className="sales-warning-text">
                    <p className="sales-warning-title">Meetup place is not shared yet.</p>
                    <p>Ask the buyer in chat to confirm where to meet.</p>
                  </div>
                  <button
                    className="btn btn-outline"
                    onClick={() =>
                      navigate(
                        `/chat?user=${order?.buyer?._id || ""}&name=${encodeURIComponent(order?.buyer?.name || "Buyer")}`
                      )
                    }
                    disabled={!order?.buyer?._id}
                  >
                    Ask via Chat for Meetup Place
                  </button>
                </div>
              ) : null}

              {canUpdateOffline ? (
                <div className="sales-actions-row">
                  {offlineStatus === "placed" ? (
                    <button
                      className="btn btn-outline"
                      onClick={() => handleUpdateStatus(order._id, "accepted")}
                      disabled={updatingOrderId === order._id}
                    >
                      {updatingOrderId === order._id ? "Updating..." : "Accept Order"}
                    </button>
                  ) : null}

                  {["accepted", "scheduled"].includes(offlineStatus) ? (
                    <button
                      className="btn btn-outline"
                      onClick={() => handleUpdateStatus(order._id, "completed")}
                      disabled={updatingOrderId === order._id}
                    >
                      {updatingOrderId === order._id ? "Updating..." : "Mark Completed"}
                    </button>
                  ) : null}

                  {["placed", "accepted", "scheduled"].includes(offlineStatus) ? (
                    <button
                      className="btn btn-outline"
                      onClick={() => handleUpdateStatus(order._id, "cancelled")}
                      disabled={updatingOrderId === order._id}
                    >
                      {updatingOrderId === order._id ? "Updating..." : "Cancel Order"}
                    </button>
                  ) : null}
                </div>
              ) : null}

              <div className="sales-items-block">
                <strong>Items</strong>
                <div className="sales-items-grid">
                  {(order.items || []).map((item, index) => (
                    <div key={`${item.productId}-${index}`} className="sales-item-card">
                      {item.imageUrl ? (
                        <img
                          src={resolveImageUrl(item.imageUrl)}
                          alt={item.title || "Ordered product"}
                          className="sales-item-image"
                        />
                      ) : (
                        <div
                          className="sales-item-image sales-item-image--empty"
                        >
                          No Image
                        </div>
                      )}

                      <div className="sales-item-content">
                        <p className="sales-item-title">{item.title || "Product"}</p>
                        {item.category ? <p>Category: {item.category}</p> : null}
                        {item.description ? (
                          <p className="sales-item-description">
                            {item.description.length > 100 ? `${item.description.slice(0, 100)}...` : item.description}
                          </p>
                        ) : null}
                        <p className="sales-item-price">Qty {item.quantity} • ₹{Number(item.price ?? 0)}</p>
                      </div>
                    </div>
                  ))}
                </div>
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

export default SellerOrders;
