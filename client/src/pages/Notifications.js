import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../app/authContext";
import { getOrderNotifications } from "../api/payment.api";

const NOTIFICATION_READ_EVENT = "notification-read-updated";
const SOLD_NOTIFICATION_KEY = "campustrade_sold_notifications";

const getNotificationReadKey = (userId) => `campustrade_notifications_last_read_${userId}`;
const getHiddenNotificationsKey = (userId) => `campustrade_hidden_notifications_${userId}`;

const notificationFilters = [
  { key: "all", label: "All" },
  { key: "orders", label: "Orders" },
  { key: "sales", label: "Sales" },
];

const formatDate = (value) => {
  if (!value) return "-";
  try {
    return new Date(value).toLocaleString([], {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "-";
  }
};

const formatRelativeTime = (value, nowTimestamp) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  const diffMs = Math.max(0, nowTimestamp - date.getTime());
  const diffMinutes = Math.floor(diffMs / (60 * 1000));
  const diffHours = Math.floor(diffMs / (60 * 60 * 1000));
  const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000));

  if (diffMinutes < 1) return "Just now";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;

  return formatDate(value);
};

const matchesFilter = (notification, activeFilter) => {
  if (activeFilter === "all") return true;
  if (activeFilter === "orders") return notification?.type === "buyer";
  if (activeFilter === "sales") return ["seller", "sold"].includes(notification?.type);
  return true;
};

const getDayGroupLabel = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Earlier";

  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const sameDate = (a, b) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  if (sameDate(date, today)) return "Today";
  if (sameDate(date, yesterday)) return "Yesterday";
  return "Earlier";
};

const notificationTypeMeta = {
  buyer: {
    tone: "is-buyer",
    actionLabel: "My Orders",
    getPath: () => "/orders",
  },
  seller: {
    tone: "is-seller",
    actionLabel: "Sales",
    getPath: () => "/seller-orders",
  },
  sold: {
    tone: "is-sold",
    actionLabel: "Sales",
    getPath: () => "/seller-orders",
  },
  chat: {
    tone: "is-chat",
    actionLabel: "Open Chat",
    getPath: (notification) =>
      `/chat?user=${notification.otherUserId || ""}&name=${encodeURIComponent(notification.otherUserName || "User")}`,
  },
  default: {
    tone: "is-default",
    actionLabel: "My Orders",
    getPath: () => "/orders",
  },
};

const Notifications = () => {
  const navigate = useNavigate();
  const auth = useAuth();
  const userId = auth?.user?.id || auth?.user?._id || auth?.user?.userId;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [nowTimestamp, setNowTimestamp] = useState(Date.now());
  const [hiddenNotificationIds, setHiddenNotificationIds] = useState(() => {
    if (!userId) return new Set();
    try {
      const raw = localStorage.getItem(getHiddenNotificationsKey(userId));
      const parsed = JSON.parse(raw || "[]");
      return new Set(Array.isArray(parsed) ? parsed : []);
    } catch {
      return new Set();
    }
  });
  const [data, setData] = useState({
    notifications: [],
    buyerCount: 0,
    sellerCount: 0,
    pendingSellerCount: 0,
  });
  const [contextMenu, setContextMenu] = useState({
    visible: false,
    notificationId: "",
    openKey: 0,
  });

  useEffect(() => {
    if (!userId) {
      setHiddenNotificationIds(new Set());
      return;
    }
    try {
      const raw = localStorage.getItem(getHiddenNotificationsKey(userId));
      const parsed = JSON.parse(raw || "[]");
      setHiddenNotificationIds(new Set(Array.isArray(parsed) ? parsed : []));
    } catch {
      setHiddenNotificationIds(new Set());
    }
  }, [userId]);

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        setLoading(true);
        const response = await getOrderNotifications();
        setData(response);

        if (userId) {
          localStorage.setItem(getNotificationReadKey(userId), String(Date.now()));
          window.dispatchEvent(new Event(NOTIFICATION_READ_EVENT));
        }
      } catch (err) {
        setError(err?.response?.data?.message || "Failed to load notifications");
      } finally {
        setLoading(false);
      }
    };

    loadNotifications();
  }, [userId]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNowTimestamp(Date.now());
    }, 60 * 1000);

    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const closeContextMenu = () => {
      setContextMenu((prev) => (prev.visible ? { ...prev, visible: false, notificationId: "", openKey: 0 } : prev));
    };

    window.addEventListener("click", closeContextMenu);
    window.addEventListener("scroll", closeContextMenu);

    return () => {
      window.removeEventListener("click", closeContextMenu);
      window.removeEventListener("scroll", closeContextMenu);
    };
  }, []);

  const filteredNotifications = useMemo(
    () => (data.notifications || []).filter((notification) => {
      const notificationId = String(notification?.id || "");
      return !hiddenNotificationIds.has(notificationId) && matchesFilter(notification, activeFilter);
    }),
    [data.notifications, activeFilter, hiddenNotificationIds]
  );

  const groupedNotifications = useMemo(() => {
    const grouped = { Today: [], Yesterday: [], Earlier: [] };
    filteredNotifications.forEach((notification) => {
      const bucket = getDayGroupLabel(notification.createdAt);
      grouped[bucket].push(notification);
    });
    return grouped;
  }, [filteredNotifications]);

  const handleOpenNotification = (notification) => {
    const typeMeta = notificationTypeMeta[notification.type] || notificationTypeMeta.default;
    navigate(typeMeta.getPath(notification));
  };

  const persistHiddenNotifications = (nextSet) => {
    if (!userId) return;
    localStorage.setItem(getHiddenNotificationsKey(userId), JSON.stringify(Array.from(nextSet)));
  };

  const handleDeleteNotification = (notification) => {
    if (!userId) return;
    const notificationId = String(notification?.id || "");
    if (!notificationId) return;

    const next = new Set(hiddenNotificationIds);
    next.add(notificationId);
    setHiddenNotificationIds(next);
    persistHiddenNotifications(next);

    if (notification?.type === "sold") {
      try {
        const list = JSON.parse(localStorage.getItem(SOLD_NOTIFICATION_KEY) || "[]");
        const safeList = Array.isArray(list) ? list : [];
        const cleaned = safeList.filter((entry) => {
          if (notification?.productId && entry?.productId) {
            return String(entry.productId) !== String(notification.productId);
          }
          return true;
        });
        localStorage.setItem(SOLD_NOTIFICATION_KEY, JSON.stringify(cleaned));
      } catch {
        // ignore malformed storage
      }
    }

    localStorage.setItem(getNotificationReadKey(userId), String(Date.now()));
    window.dispatchEvent(new Event(NOTIFICATION_READ_EVENT));
  };

  const handleNotificationContextMenu = (event, notificationId) => {
    event.preventDefault();
    setContextMenu({
      visible: true,
      notificationId: String(notificationId || ""),
      openKey: Date.now(),
    });
  };

  const handleContextDelete = () => {
    const target = (data.notifications || []).find(
      (notification) => String(notification?.id || "") === String(contextMenu.notificationId || "")
    );
    if (!target) return;
    handleDeleteNotification(target);
    setContextMenu((prev) => ({ ...prev, visible: false, notificationId: "", openKey: 0 }));
  };

  return (
    <div className="container page page-shell cart-page notifications-page">
      <div className="cart-header notifications-header">
        <h1 className="cart-title">Notifications</h1>
        <div className="cart-summary-actions">
          <button className="btn btn-outline" onClick={() => navigate("/marketplace")}>Continue Shopping</button>
        </div>
      </div>

      {loading ? (
        <p className="cart-muted">Loading notifications...</p>
      ) : error ? (
        <div className="cart-inline-notice error" role="status" aria-live="polite">
          <span className="cart-inline-icon" aria-hidden="true">⚠️</span>
          <span>{error}</span>
        </div>
      ) : (
        <>
          <div className="notifications-filter-row" role="tablist" aria-label="Notification filters">
            {notificationFilters.map((filter) => (
              <button
                key={filter.key}
                type="button"
                role="tab"
                className={`btn notifications-filter-btn ${activeFilter === filter.key ? "active" : ""}`}
                aria-selected={activeFilter === filter.key}
                data-testid={`notifications-filter-${filter.key}`}
                onClick={() => setActiveFilter(filter.key)}
              >
                {filter.label}
              </button>
            ))}
          </div>

          {filteredNotifications.length === 0 ? (
            <div className="cart-empty">
              <p>No notifications found for this filter.</p>
            </div>
          ) : (
            <div className="notifications-timeline">
              {Object.entries(groupedNotifications).map(([groupLabel, notifications]) => {
                if (!notifications.length) return null;

                return (
                  <section key={groupLabel} className="notifications-group" aria-label={groupLabel}>
                    <div className="notifications-group-header">{groupLabel}</div>

                    <div className="notifications-list">
                      {notifications.map((notification) => {
                        const typeMeta = notificationTypeMeta[notification.type] || notificationTypeMeta.default;
                        return (
                          <article
                            key={notification.id}
                            className={`notifications-card ${typeMeta.tone} card-context-host`}
                            data-testid="notification-card"
                            onContextMenu={(event) => handleNotificationContextMenu(event, notification.id)}
                            title="Right click to manage notification"
                          >
                            <div className="notifications-main">
                              <p className="notifications-title">{notification.title}</p>

                              <p className="notifications-message">{notification.message}</p>

                              <div className="notifications-meta-grid">
                                <p
                                  className="notifications-time"
                                  title={formatDate(notification.createdAt)}
                                  data-testid="notification-time"
                                >
                                  {formatRelativeTime(notification.createdAt, nowTimestamp)}
                                </p>
                                {notification.type === "seller" && notification.buyerName ? (
                                  <p className="notifications-meta-line">Ordered by {notification.buyerName}</p>
                                ) : null}
                              </div>
                            </div>

                            <div className="notifications-actions">
                              <button
                                className="btn btn-outline"
                                onClick={() => handleOpenNotification(notification)}
                              >
                                {typeMeta.actionLabel}
                              </button>
                            </div>

                            {contextMenu.visible && contextMenu.notificationId === String(notification.id) ? (
                              <div
                                key={`bin-${contextMenu.openKey}`}
                                className="card-bin-menu card-bin-menu--card"
                                role="menu"
                                onClick={(event) => event.stopPropagation()}
                              >
                                <button className="card-bin-button" onClick={handleContextDelete} aria-label="Delete notification" title="Delete notification">
                                  🗑
                                </button>
                              </div>
                            ) : null}
                          </article>
                        );
                      })}
                    </div>
                  </section>
                );
              })}
            </div>
          )}
        </>
      )}

    </div>
  );
};

export default Notifications;
