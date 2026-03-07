import axios from "../app/axiosConfig";

const SOLD_NOTIFICATION_KEY = "campustrade_sold_notifications";

export const setupRazorpayAccount = async (razorpayAccountId) => {
	const response = await axios.post("/payment/setup-razorpay", { razorpayAccountId });
	return response.data;
};

export const getPaymentConfigStatus = async () => {
	const response = await axios.get("/payment/config-status");
	return response.data;
};

export const createPaymentOrder = async (cartItems, meetupPlace) => {
	const response = await axios.post("/payment/create-order", { cartItems, meetupPlace });
	return response.data;
};

export const createOfflineOrders = async (cartItems, meetupPlace, paymentMethod) => {
	const response = await axios.post("/payment/create-offline-orders", { cartItems, meetupPlace, paymentMethod });
	return response.data;
};

export const verifyPayment = async (payload) => {
	const response = await axios.post("/payment/verify-payment", payload);
	return response.data;
};

export const getMyOrders = async () => {
	const response = await axios.get("/payment/orders");
	return response.data;
};

export const getSellerOrders = async () => {
	const response = await axios.get("/payment/seller-orders");
	return response.data;
};

export const updateOfflineOrderStatus = async (orderId, payload) => {
	const response = await axios.patch(`/payment/orders/${orderId}/offline-status`, payload);
	return response.data;
};

export const getOrderNotifications = async () => {
	const [buyerResult, sellerResult] = await Promise.allSettled([
		axios.get("/payment/orders"),
		axios.get("/payment/seller-orders"),
	]);

	const buyerOrders =
		buyerResult.status === "fulfilled" ? buyerResult.value.data?.orders || [] : [];
	const sellerOrders =
		sellerResult.status === "fulfilled" ? sellerResult.value.data?.orders || [] : [];

	const notifications = [];
	const soldNotifications = (() => {
		try {
			const parsed = JSON.parse(localStorage.getItem(SOLD_NOTIFICATION_KEY) || "[]");
			return Array.isArray(parsed) ? parsed : [];
		} catch {
			return [];
		}
	})();

	buyerOrders.forEach((order) => {
		const offlineStatus = order.offlineStatus || "";
		const isOffline = order.paymentMode === "offline";
		const sellerNames = [...new Set(
			(order.sellerBreakdown || [])
				.map((group) => String(group?.seller?.name || "").trim())
				.filter(Boolean)
		)];
		const sellerLabel = sellerNames.length > 1
			? `${sellerNames[0]} +${sellerNames.length - 1}`
			: (sellerNames[0] || "Seller");

		let title = "Order created";
		let message = `Your order #${String(order._id).slice(-6).toUpperCase()} is ${order.status}.`;
		let timestamp = order.createdAt;

		if (isOffline && offlineStatus === "accepted") {
			title = `Order accepted by ${sellerLabel}`;
			message = `${sellerLabel} accepted your order #${String(order._id).slice(-6).toUpperCase()}.`;
			timestamp = order.updatedAt || order.createdAt;
		} else if (isOffline && offlineStatus === "scheduled") {
			title = "Meetup scheduled";
			message = `${sellerLabel} scheduled meetup for order #${String(order._id).slice(-6).toUpperCase()}.`;
			timestamp = order.updatedAt || order.createdAt;
		} else if (isOffline && offlineStatus === "cancelled") {
			title = "Order cancelled";
			message = `Your order #${String(order._id).slice(-6).toUpperCase()} was cancelled.`;
			timestamp = order.updatedAt || order.createdAt;
		} else if (isOffline && offlineStatus === "completed") {
			title = "Your product has been delivered";
			message = `Your order #${String(order._id).slice(-6).toUpperCase()} is delivered. Enjoy your product!`;
			timestamp = order.updatedAt || order.createdAt;
		} else if (order.paymentMode === "offline") {
			title = "Offline order placed";
			message = `Your order #${String(order._id).slice(-6).toUpperCase()} is placed.`;
		} else if (String(order.status || "").toLowerCase() === "paid") {
			title = "Your order is confirmed";
			message = `Payment received for #${String(order._id).slice(-6).toUpperCase()}. Enjoy your product!`;
			timestamp = order.paidAt || order.updatedAt || order.createdAt;
		}

		notifications.push({
			id: `buyer-${order._id}`,
			type: "buyer",
			title,
			message,
			createdAt: timestamp,
			orderId: order._id,
		});
	});

	sellerOrders.forEach((order) => {
		const itemsCount = (order.items || []).reduce((sum, item) => {
			const qty = Number(item?.quantity);
			if (Number.isFinite(qty) && qty > 0) return sum + qty;
			return sum + 1;
		}, 0);
		const safeItemsCount = itemsCount > 0 ? itemsCount : (order.items || []).length || 1;
		const buyerName = String(order?.buyer?.name || "A buyer").trim() || "A buyer";
		notifications.push({
			id: `seller-${order._id}`,
			type: "seller",
			title: "Great news! You received a new order",
			message: `${safeItemsCount} item(s) ordered in #${String(order._id).slice(-6).toUpperCase()} by ${buyerName}.`,
			createdAt: order.createdAt,
			orderId: order._id,
			buyerName,
			status: order.status,
		});
	});

	soldNotifications.forEach((entry) => {
		notifications.push({
			id: `sold-${entry?.id || entry?.productId || Date.now()}`,
			type: "sold",
			title: "Listing marked as sold",
			message: `Congratulations! ${String(entry?.title || "Your listing")} was marked as sold.`,
			createdAt: entry?.createdAt || new Date().toISOString(),
			productId: entry?.productId,
		});
	});

	notifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
	const pendingSellerCount = sellerOrders.filter((order) => {
		if (order?.paymentMode === "offline") {
			const offlineStatus = String(order?.offlineStatus || "placed");
			return ["placed", "accepted"].includes(offlineStatus);
		}
		return String(order?.status || "") === "pending";
	}).length;

	return {
		notifications,
		buyerCount: buyerOrders.length,
		sellerCount: sellerOrders.length,
		pendingSellerCount,
	};
};
