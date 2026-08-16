import mongoose from "mongoose";
import razorpay from "../config/razorpay.js";
import Order from "../models/Order.js";
import User from "../models/User.js";
import Product from "../models/Product.js";
import crypto from "crypto";

export const normalizeCheckoutItems = (items = []) => {
  const qtyByProductId = {};

  for (const item of Array.isArray(items) ? items : []) {
    const productId = String(item?.productId || "").trim();
    if (!productId) continue;

    const quantity = Number(item?.quantity || 1);
    if (!Number.isFinite(quantity) || quantity < 1) continue;

    qtyByProductId[productId] = (qtyByProductId[productId] || 0) + quantity;
  }

  return Object.entries(qtyByProductId).map(([productId, quantity]) => ({
    productId,
    quantity,
  }));
};

export const buildCheckoutKey = (buyerId, items = [], meetupPlace = "") => {
  const normalizedItems = normalizeCheckoutItems(items)
    .map(({ productId, quantity }) => [String(productId), Number(quantity)])
    .sort(([left], [right]) => left.localeCompare(right));

  return crypto
    .createHash("sha256")
    .update(
      JSON.stringify({
        buyerId: String(buyerId || ""),
        meetupPlace: String(meetupPlace || "").trim().toLowerCase(),
        items: normalizedItems,
      })
    )
    .digest("hex");
};

export const reserveProductCopies = async ({
  ProductModel = Product,
  productId,
  quantity,
  session = null,
}) => {
  const normalizedProductId = String(productId || "").trim();
  const normalizedQuantity = Number(quantity || 1);

  if (!normalizedProductId) {
    throw Object.assign(new Error("Missing product id"), { statusCode: 400, code: "INVALID_PRODUCT" });
  }

  if (!Number.isFinite(normalizedQuantity) || normalizedQuantity < 1) {
    throw Object.assign(new Error("Quantity must be at least 1"), {
      statusCode: 400,
      code: "INVALID_QUANTITY",
    });
  }

  const reservedProduct = await ProductModel.findOneAndUpdate(
    {
      _id: normalizedProductId,
      isSold: false,
      availableCopies: { $gte: normalizedQuantity },
    },
    {
      $inc: { availableCopies: -normalizedQuantity },
      $set: { isSold: false },
    },
    {
      new: true,
      session,
    }
  );

  if (!reservedProduct) {
    const current = await ProductModel.findById(normalizedProductId, null, { session });
    const currentCopies = current ? Math.max(0, Number(current.availableCopies || 0)) : 0;

    throw Object.assign(new Error("Insufficient inventory"), {
      statusCode: 400,
      code: "INSUFFICIENT_INVENTORY",
      availableCopies: currentCopies,
      requestedQuantity: normalizedQuantity,
    });
  }

  if (Number(reservedProduct.availableCopies || 0) === 0) {
    await ProductModel.findByIdAndUpdate(
      normalizedProductId,
      { $set: { isSold: true } },
      { session, new: true }
    );

    reservedProduct.isSold = true;
  }

  return {
    ok: true,
    product: reservedProduct,
  };
};

export const restoreProductCopies = async ({
  ProductModel = Product,
  items = [],
  session = null,
}) => {
  const normalizedItems = normalizeCheckoutItems(items);
  const restored = [];

  for (const item of normalizedItems) {
    const productId = String(item.productId || "").trim();
    if (!productId) continue;

    const updated = await ProductModel.findOneAndUpdate(
      { _id: productId },
      {
        $inc: { availableCopies: item.quantity },
        $set: { isSold: false },
      },
      {
        new: true,
        session,
      }
    );

    if (!updated) {
      continue;
    }

    restored.push({
      productId,
      quantity: item.quantity,
      availableCopies: updated.availableCopies,
    });
  }

  return {
    ok: true,
    restored,
  };
};

const getReservedCopiesByProductIds = async (productIds = []) => {
  if (!Array.isArray(productIds) || productIds.length === 0) {
    return {};
  }

  const orders = await Order.find({
    status: "pending",
    $or: [
      { paymentMode: "online" },
      {
        paymentMode: "offline",
        offlineStatus: { $in: ["placed", "accepted", "scheduled"] },
      },
    ],
    "items.productId": { $in: productIds },
  }).select("items");

  const reservedByProductId = {};
  for (const order of orders) {
    for (const item of order.items || []) {
      const productId = item?.productId?.toString?.();
      if (!productId) continue;
      const quantity = Number(item?.quantity || 1);
      reservedByProductId[productId] =
        (reservedByProductId[productId] || 0) + (Number.isFinite(quantity) && quantity > 0 ? quantity : 1);
    }
  }

  return reservedByProductId;
};

const decrementProductCopies = async (items = []) => {
  const qtyByProductId = {};

  for (const item of items) {
    const productId = item?.productId?.toString?.();
    if (!productId) continue;
    const quantity = Number(item?.quantity || 1);
    qtyByProductId[productId] =
      (qtyByProductId[productId] || 0) + (Number.isFinite(quantity) && quantity > 0 ? quantity : 1);
  }

  for (const [productId, quantity] of Object.entries(qtyByProductId)) {
    const product = await Product.findById(productId);
    if (!product) continue;

    const currentCopies = Math.max(0, Number(product.availableCopies ?? 1));
    const nextCopies = Math.max(0, currentCopies - quantity);

    product.availableCopies = nextCopies;
    if (nextCopies === 0) {
      product.isSold = true;
    }

    await product.save();
  }
};

const getProductReservationSummary = async (productIds = []) => {
  if (!Array.isArray(productIds) || productIds.length === 0) {
    return {};
  }

  const orders = await Order.find({
    status: "pending",
    $or: [
      { paymentMode: "online" },
      {
        paymentMode: "offline",
        offlineStatus: { $in: ["placed", "accepted", "scheduled"] },
      },
    ],
    "items.productId": { $in: productIds },
  }).select("items");

  const reservedByProductId = {};
  for (const order of orders) {
    for (const item of order.items || []) {
      const productId = item?.productId?.toString?.();
      if (!productId) continue;

      const quantity = Number(item?.quantity || 1);
      reservedByProductId[productId] =
        (reservedByProductId[productId] || 0) + (Number.isFinite(quantity) && quantity > 0 ? quantity : 1);
    }
  }

  return reservedByProductId;
};

const getDuplicateCheckoutOrder = async ({ userId, checkoutKey, session = null }) => {
  return Order.findOne({
    buyer: userId,
    checkoutKey,
    status: { $ne: "cancelled" },
  }, null, { session });
};

const ensureRazorpayConfigured = (res) => {
  if (!razorpay || !process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    res.status(503).json({
      message: "Payment service is not configured. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.",
    });
    return false;
  }
  return true;
};

/**
 * GET /api/payment/config-status
 * Check whether payment gateway is configured
 */
export const getPaymentConfigStatus = async (req, res) => {
  const configured = !!(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);
  return res.status(200).json({ configured });
};

/**
 * POST /api/payment/setup-razorpay
 * Allow user to add their Razorpay Account ID
 */
export const setupRazorpayAccount = async (req, res) => {
  try {
    const { razorpayAccountId } = req.body;
    const userId = req.user.userId;

    if (!razorpayAccountId || razorpayAccountId.trim() === "") {
      return res.status(400).json({ message: "Razorpay Account ID is required" });
    }

    if (!razorpayAccountId.startsWith("acc_")) {
      return res.status(400).json({
        message: "Invalid Razorpay Account ID. Should start with 'acc_'",
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      {
        razorpayAccountId,
        isSeller: true,
      },
      { new: true }
    );

    res.status(200).json({
      message: "Razorpay account linked successfully",
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        razorpayAccountId: user.razorpayAccountId,
        isSeller: user.isSeller,
      },
    });
  } catch (error) {
    console.error("SETUP RAZORPAY ERROR:", error);
    res.status(500).json({ message: error.message || "Failed to setup Razorpay account" });
  }
};

/**
 * POST /api/payment/create-order
 * Online payment endpoint is intentionally disabled for COD-only flow.
 */
export const createOrder = async (req, res) => {
  return res.status(400).json({
    message: "Online payment is disabled. Use COD checkout.",
  });
};

/**
 * POST /api/payment/create-offline-orders
 * Create pending offline orders (pay on meetup)
 */
export const createOfflineOrders = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { cartItems, meetupPlace, paymentMethod } = req.body;

    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({ message: "No offline items provided" });
    }

    if (!meetupPlace || !String(meetupPlace).trim()) {
      return res.status(400).json({ message: "Meetup place is required" });
    }

    const normalizedPaymentMethod = String(paymentMethod || "").trim().toLowerCase();
    if (normalizedPaymentMethod !== "cod") {
      return res.status(400).json({ message: "Only COD is supported on this platform." });
    }

    const normalizedCartItems = normalizeCheckoutItems(cartItems);
    if (!normalizedCartItems.length) {
      return res.status(400).json({ message: "No offline items provided" });
    }

    const checkoutKey = buildCheckoutKey(userId, normalizedCartItems, meetupPlace);
    const session = await mongoose.startSession();
    let createdOrders = [];

    try {
      await session.withTransaction(async () => {
        const duplicateOrder = await getDuplicateCheckoutOrder({ userId, checkoutKey, session });
        if (duplicateOrder) {
          throw Object.assign(new Error("This checkout request has already been processed."), {
            statusCode: 409,
            code: "DUPLICATE_CHECKOUT",
            existingOrder: duplicateOrder._id,
          });
        }

        const groupedBySeller = {};

        for (const item of normalizedCartItems) {
          const product = await Product.findById(item.productId).populate("seller", "name razorpayAccountId").session(session);

          if (!product) {
            throw Object.assign(new Error(`Product ${item.productId} not found`), {
              statusCode: 404,
              code: "PRODUCT_NOT_FOUND",
            });
          }

          const sellerId = product.seller?._id?.toString?.() || product.seller?.toString?.();
          if (!sellerId) {
            throw Object.assign(new Error(`${product.title} seller not available`), {
              statusCode: 400,
              code: "SELLER_NOT_FOUND",
            });
          }

          const reservation = await reserveProductCopies({
            ProductModel: Product,
            productId: product._id,
            quantity: item.quantity,
            session,
          });

          if (!reservation?.ok) {
            throw Object.assign(new Error(`${product.title} has only ${Number(product.availableCopies || 0)} copy/copies available right now`), {
              statusCode: 400,
              code: "INSUFFICIENT_INVENTORY",
              availableCopies: Number(product.availableCopies || 0),
              requestedQuantity: item.quantity,
            });
          }

          if (!groupedBySeller[sellerId]) {
            groupedBySeller[sellerId] = {
              sellerId,
              sellerName: product.seller?.name || "Seller",
              items: [],
              amount: 0,
            };
          }

          const itemTotal = Number(product.price || 0) * item.quantity;

          groupedBySeller[sellerId].items.push({
            productId: product._id,
            title: product.title,
            price: product.price,
            quantity: item.quantity,
            imageUrl: Array.isArray(product.images) && product.images.length > 0 ? product.images[0] : "",
            category: product.category,
            description: product.description,
          });
          groupedBySeller[sellerId].amount += itemTotal;
        }

        const offlineOrders = [];

        for (const group of Object.values(groupedBySeller)) {
          const created = await Order.create(
            [{
              buyer: userId,
              amount: group.amount,
              meetupPlace: String(meetupPlace).trim(),
              status: "pending",
              checkoutKey,
              inventoryReservedAtCheckout: true,
              paymentMode: "offline",
              offlinePaymentMethod: normalizedPaymentMethod,
              offlineStatus: "placed",
              items: group.items.map((item) => ({
                productId: item.productId,
                quantity: item.quantity,
              })),
              sellerBreakdown: [
                {
                  seller: group.sellerId,
                  items: group.items,
                  amount: group.amount,
                  transferStatus: "pending",
                },
              ],
            }],
            { session }
          );

          offlineOrders.push({
            orderId: created[0]._id,
            sellerId: group.sellerId,
            sellerName: group.sellerName,
            amount: group.amount,
          });
        }

        createdOrders = offlineOrders;
        return offlineOrders;
      });

      return res.status(201).json({
        message: "Offline orders created successfully",
        orders: createdOrders,
      });
    } catch (error) {
      if (error?.statusCode === 409) {
        return res.status(409).json({
          message: error.message,
          duplicateCheckout: true,
          code: error.code,
        });
      }

      if (error?.statusCode === 400 || error?.code === "INSUFFICIENT_INVENTORY") {
        return res.status(400).json({
          message: error.message,
          code: error.code,
          availableCopies: error.availableCopies,
          requestedQuantity: error.requestedQuantity,
        });
      }

      console.error("CREATE OFFLINE ORDERS ERROR:", error);
      return res.status(500).json({ message: error.message || "Failed to create offline orders" });
    } finally {
      session.endSession();
    }

  } catch (error) {
    console.error("CREATE OFFLINE ORDERS ERROR:", error);
    return res.status(500).json({ message: error.message || "Failed to create offline orders" });
  }
};

/**
 * POST /api/payment/verify-payment
 * Verify payment and transfer to sellers
 */
export const verifyPayment = async (req, res) => {
  try {
    if (!ensureRazorpayConfigured(res)) return;

    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;
    const userId = req.user.userId;

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return res.status(400).json({ message: "Missing payment details" });
    }

    // Verify signature
    const body = razorpayOrderId + "|" + razorpayPaymentId;
    const signature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (signature !== razorpaySignature) {
      return res.status(400).json({ message: "Invalid payment signature" });
    }

    // Find and update order
    const order = await Order.findOne({ razorpayOrderId }).populate("sellerBreakdown.seller");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.status !== "pending") {
      return res.status(400).json({ message: "Order already processed" });
    }

    // Update order status
    order.paymentId = razorpayPaymentId;
    order.signature = razorpaySignature;
    order.status = "paid";
    order.paidAt = new Date();

    // Transfer money to each seller
    const transfers = [];

    for (const sellerItem of order.sellerBreakdown) {
      const seller = sellerItem.seller;

      if (!seller.razorpayAccountId) {
        console.error(`Seller ${seller._id} has no Razorpay account`);
        continue;
      }

      try {
        // Create transfer to seller's Razorpay account
        const transfer = await razorpay.transfers.create({
          account: seller.razorpayAccountId,
          amount: Math.round(sellerItem.amount * 100), // Convert to paise
          currency: "INR",
          receipt: `transfer_${order._id}_${seller._id}`
        });

        transfers.push({
          seller: seller._id,
          transferId: transfer.id,
          amount: sellerItem.amount,
          status: "completed"
        });

        // Update seller breakdown transfer status
        const sellerBreakdownItem = order.sellerBreakdown.find(
          (item) => item.seller._id.toString() === seller._id.toString()
        );
        if (sellerBreakdownItem) {
          sellerBreakdownItem.transferStatus = "completed";
          sellerBreakdownItem.transferId = transfer.id;
        }

      } catch (error) {
        console.error(`Transfer to seller ${seller._id} failed:`, error);
        transfers.push({
          seller: seller._id,
          amount: sellerItem.amount,
          status: "failed",
          error: error.message
        });
      }
    }

    await decrementProductCopies(order.items || []);

    order.transfers = transfers;
    await order.save();

    res.status(200).json({
      message: "Payment verified and transferred to sellers",
      order: {
        _id: order._id,
        status: order.status,
        amount: order.amount,
        transfers
      }
    });
  } catch (error) {
    console.error("VERIFY PAYMENT ERROR:", error);
    res.status(500).json({ message: error.message || "Payment verification failed" });
  }
};

/**
 * GET /api/payment/orders
 * Get all orders for logged-in user (as buyer)
 */
export const getMyOrders = async (req, res) => {
  try {
    const userId = req.user.userId;

    const orders = await Order.find({ buyer: userId })
      .populate("sellerBreakdown.seller", "name email")
      .sort({ createdAt: -1 });

    const productIds = [...new Set(
      (orders || []).flatMap((order) =>
        (order.sellerBreakdown || []).flatMap((group) =>
          (group.items || []).map((item) => item?.productId?.toString()).filter(Boolean)
        )
      )
    )];

    let productMap = {};
    if (productIds.length > 0) {
      const products = await Product.find({ _id: { $in: productIds } })
        .select("title description category images price")
        .lean();

      productMap = products.reduce((acc, product) => {
        acc[product._id.toString()] = product;
        return acc;
      }, {});
    }

    const enrichedOrders = (orders || []).map((order) => {
      const raw = order.toObject();

      raw.sellerBreakdown = (raw.sellerBreakdown || []).map((group) => ({
        ...group,
        items: (group.items || []).map((item) => {
          const product = productMap[item?.productId?.toString()] || {};
          return {
            ...item,
            title: item.title || product.title || "Product",
            price: item.price ?? product.price ?? 0,
            imageUrl: item.imageUrl || (Array.isArray(product.images) ? product.images[0] : "") || "",
            category: item.category || product.category || "",
            description: item.description || product.description || ""
          };
        })
      }));

      return raw;
    });

    res.status(200).json({
      message: "Orders retrieved successfully",
      orders: enrichedOrders
    });
  } catch (error) {
    console.error("GET ORDERS ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * GET /api/payment/seller-orders
 * Get all orders where logged-in user is a seller
 */
export const getSellerOrders = async (req, res) => {
  try {
    const userId = req.user.userId;

    const orders = await Order.find({ "sellerBreakdown.seller": userId })
      .populate("buyer", "name branch year")
      .sort({ createdAt: -1 });

    const productIds = [...new Set(
      (orders || []).flatMap((order) =>
        (order.sellerBreakdown || [])
          .filter((entry) => entry?.seller?.toString?.() === userId.toString())
          .flatMap((entry) =>
            (entry.items || []).map((item) => item?.productId?.toString()).filter(Boolean)
          )
      )
    )];

    let productMap = {};
    if (productIds.length > 0) {
      const products = await Product.find({ _id: { $in: productIds } })
        .select("title description category images price")
        .lean();

      productMap = products.reduce((acc, product) => {
        acc[product._id.toString()] = product;
        return acc;
      }, {});
    }

    const sellerOrders = orders
      .map((order) => {
        const breakdown = (order.sellerBreakdown || []).find(
          (entry) => entry?.seller?.toString?.() === userId.toString()
        );

        if (!breakdown) return null;

        return {
          _id: order._id,
          buyer: order.buyer,
          status: order.status,
          paymentMode: order.paymentMode,
          offlinePaymentMethod: order.offlinePaymentMethod || "",
          offlineStatus: order.offlineStatus || "",
          createdAt: order.createdAt,
          paidAt: order.paidAt,
          meetupPlace: order.meetupPlace || "",
          offlinePaymentConfirmation: {
            confirmedBy: order.offlinePaymentConfirmation?.confirmedBy || null,
            confirmedAt: order.offlinePaymentConfirmation?.confirmedAt || null,
            note: order.offlinePaymentConfirmation?.note || "",
          },
          sellerAmount: breakdown.amount,
          transferStatus: breakdown.transferStatus,
          transferId: breakdown.transferId,
          items: (breakdown.items || []).map((item) => {
            const product = productMap[item?.productId?.toString()] || {};
            return {
              ...item,
              title: item.title || product.title || "Product",
              price: item.price ?? product.price ?? 0,
              imageUrl: item.imageUrl || (Array.isArray(product.images) ? product.images[0] : "") || "",
              category: item.category || product.category || "",
              description: item.description || product.description || ""
            };
          })
        };
      })
      .filter(Boolean);

    res.status(200).json({
      message: "Seller orders retrieved successfully",
      orders: sellerOrders
    });
  } catch (error) {
    console.error("GET SELLER ORDERS ERROR:", error);
    res.status(500).json({ message: error.message || "Failed to retrieve seller orders" });
  }
};

/**
 * PATCH /api/payment/orders/:orderId/offline-status
 * Update offline order status by buyer/seller
 */
export const updateOfflineOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { offlineStatus, meetupPlace, paymentReceivedNote } = req.body;
    const userId = req.user.userId;

    const allowedStatuses = ["accepted", "scheduled", "completed", "cancelled"];
    if (!allowedStatuses.includes(offlineStatus)) {
      return res.status(400).json({ message: "Invalid offline status" });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.paymentMode !== "offline") {
      return res.status(400).json({ message: "Only offline orders can be updated" });
    }

    if (["completed", "cancelled"].includes(order.offlineStatus)) {
      return res.status(400).json({ message: "Order is already finalized" });
    }

    const isBuyer = order.buyer?.toString() === userId.toString();
    const isSeller = (order.sellerBreakdown || []).some(
      (entry) => entry?.seller?.toString() === userId.toString()
    );

    if (!isBuyer && !isSeller) {
      return res.status(403).json({ message: "Not authorized for this order" });
    }

    if (isBuyer && offlineStatus !== "cancelled") {
      return res.status(403).json({ message: "Buyer can only cancel order" });
    }

    if (
      isBuyer &&
      offlineStatus === "cancelled" &&
      ["accepted", "scheduled", "completed"].includes(order.offlineStatus || "placed")
    ) {
      return res.status(400).json({ message: "Order already accepted by seller. Cancellation is not allowed." });
    }

    const currentStatus = String(order.offlineStatus || "placed");
    const nextStatus = String(offlineStatus);
    const allowedTransitions = {
      placed: ["accepted", "cancelled"],
      accepted: ["completed", "cancelled"],
      scheduled: ["completed", "cancelled"],
      completed: [],
      cancelled: [],
    };

    if (currentStatus === nextStatus) {
      return res.status(200).json({
        message: "Offline order updated successfully",
        order: {
          _id: order._id,
          offlineStatus: order.offlineStatus,
          meetupPlace: order.meetupPlace,
        },
      });
    }

    const canTransition = (allowedTransitions[currentStatus] || []).includes(nextStatus);
    if (!canTransition) {
      return res.status(400).json({
        message: `Invalid offline status transition from ${currentStatus} to ${nextStatus}`,
      });
    }

    if (offlineStatus === "completed" && !isSeller) {
      return res.status(403).json({ message: "Only seller can mark payment as received" });
    }

    const normalizedPaymentReceivedNote = String(paymentReceivedNote || "").trim();
    if (offlineStatus === "completed" && !normalizedPaymentReceivedNote) {
      return res.status(400).json({
        message: "Payment received note is required for audit when completing offline order",
      });
    }

    order.offlineStatus = offlineStatus;

    if (typeof meetupPlace === "string" && meetupPlace.trim()) {
      order.meetupPlace = meetupPlace.trim();
    }

    if (offlineStatus === "completed") {
      if (!order.inventoryReservedAtCheckout) {
        await decrementProductCopies(order.items || []);
        order.inventoryReservedAtCheckout = true;
      }
      order.status = "paid";
      order.paidAt = new Date();
      order.offlinePaymentConfirmation = {
        confirmedBy: userId,
        confirmedAt: new Date(),
        note: normalizedPaymentReceivedNote,
      };
    }

    if (offlineStatus === "cancelled") {
      if (order.inventoryRestored) {
        return res.status(200).json({
          message: "Offline order already cancelled",
          order: {
            _id: order._id,
            offlineStatus: order.offlineStatus,
            meetupPlace: order.meetupPlace,
          },
        });
      }

      if (order.inventoryReservedAtCheckout) {
        await restoreProductCopies({
          items: order.items || [],
          session: null,
        });
      }
      order.inventoryRestored = true;
      order.status = "cancelled";
    }

    await order.save();

    return res.status(200).json({
      message: "Offline order updated successfully",
      order: {
        _id: order._id,
        offlineStatus: order.offlineStatus,
        meetupPlace: order.meetupPlace,
        offlinePaymentConfirmation: order.offlinePaymentConfirmation,
      },
    });
  } catch (error) {
    console.error("UPDATE OFFLINE ORDER STATUS ERROR:", error);
    return res.status(500).json({ message: error.message || "Failed to update offline order status" });
  }
};
