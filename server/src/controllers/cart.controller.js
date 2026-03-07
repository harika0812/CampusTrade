import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import Order from "../models/Order.js";

const getReservedCopiesByProductId = async (productId) => {
  const orders = await Order.find({
    status: "pending",
    $or: [
      { paymentMode: "online" },
      {
        paymentMode: "offline",
        offlineStatus: { $in: ["placed", "accepted", "scheduled"] },
      },
    ],
    "items.productId": productId,
  }).select("items");

  let reserved = 0;
  for (const order of orders) {
    for (const item of order.items || []) {
      if (String(item?.productId) === String(productId)) {
        const quantity = Number(item?.quantity || 1);
        reserved += Number.isFinite(quantity) && quantity > 0 ? quantity : 1;
      }
    }
  }

  return reserved;
};

const mapCartItem = (item) => {
  const sellerObject = item.product?.seller;
  const sellerId = sellerObject?._id || sellerObject;
  const paymentOption = "cod";
  const canPayOnline = false;

  return {
    productId: item.product._id,
    title: item.product.title,
    price: item.product.price,
    image: item.product.images?.[0] || null,
    sellerId,
    quantity: item.quantity,
    isSold: item.product.isSold,
    paymentOption,
    canPayOnline,
    paymentType: "offline",
  };
};

const formatCart = (cart) => {
  if (!cart) {
    return { items: [], totalItems: 0, totalAmount: 0 };
  }

  const validItems = cart.items.filter((item) => item?.product && !item.product.isSold);
  const totalItems = validItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = validItems.reduce(
    (sum, item) => sum + Number(item.product.price || 0) * item.quantity,
    0
  );

  return {
    _id: cart._id,
    user: cart.user,
    items: validItems.map(mapCartItem),
    totalItems,
    totalAmount,
  };
};

export const getCart = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const cart = await Cart.findOne({ user: userId }).populate({
      path: "items.product",
      select: "title price images seller isSold paymentOption paymentDetails",
      populate: {
        path: "seller",
        select: "razorpayAccountId",
      },
    });

    return res.status(200).json(formatCart(cart));
  } catch (error) {
    console.error("GET CART ERROR:", error);
    return res.status(500).json({ message: "Failed to fetch cart" });
  }
};

export const addToCart = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const { productId, quantity = 1 } = req.body;

    if (!productId) {
      return res.status(400).json({ message: "Product ID is required" });
    }

    const product = await Product.findById(productId).select("seller isSold availableCopies title listingType");
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const availableCopies = Math.max(0, Number(product.availableCopies ?? 1));
    if (product.isSold || availableCopies <= 0) {
      return res.status(400).json({ message: "This product is already sold" });
    }

    if (String(product.seller) === String(userId)) {
      return res.status(400).json({ message: "You cannot add your own product to cart" });
    }

    if ((product.listingType || "sell") === "lend") {
      return res.status(400).json({ message: "Lend-only items cannot be added to cart. Use chat to borrow." });
    }

    const qty = Number(quantity);
    if (!Number.isFinite(qty) || qty < 1) {
      return res.status(400).json({ message: "Quantity must be at least 1" });
    }

    const cart = (await Cart.findOne({ user: userId })) || new Cart({ user: userId, items: [] });

    const existingIndex = cart.items.findIndex(
      (item) => String(item.product) === String(productId)
    );

    const existingQty = existingIndex >= 0 ? Number(cart.items[existingIndex].quantity || 0) : 0;
    const requestedTotalQty = existingQty + qty;

    const reservedCopies = await getReservedCopiesByProductId(productId);
    const purchasableCopies = Math.max(0, availableCopies - reservedCopies);

    if (requestedTotalQty > purchasableCopies) {
      return res.status(400).json({
        message: `${product.title} has only ${purchasableCopies} copy/copies available right now`,
      });
    }

    if (existingIndex >= 0) {
      cart.items[existingIndex].quantity = requestedTotalQty;
    } else {
      cart.items.push({ product: productId, quantity: qty });
    }

    await cart.save();

    const populated = await Cart.findById(cart._id).populate({
      path: "items.product",
      select: "title price images seller isSold paymentOption paymentDetails",
      populate: {
        path: "seller",
        select: "razorpayAccountId",
      },
    });

    return res.status(200).json({
      message: "Added to cart",
      cart: formatCart(populated),
    });
  } catch (error) {
    console.error("ADD TO CART ERROR:", error);
    return res.status(500).json({ message: "Failed to add to cart" });
  }
};

export const removeFromCart = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const { productId } = req.params;

    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    cart.items = cart.items.filter((item) => String(item.product) !== String(productId));
    await cart.save();

    const populated = await Cart.findById(cart._id).populate({
      path: "items.product",
      select: "title price images seller isSold paymentOption paymentDetails",
      populate: {
        path: "seller",
        select: "razorpayAccountId",
      },
    });

    return res.status(200).json({
      message: "Removed from cart",
      cart: formatCart(populated),
    });
  } catch (error) {
    console.error("REMOVE FROM CART ERROR:", error);
    return res.status(500).json({ message: "Failed to remove from cart" });
  }
};

export const clearCart = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const cart = (await Cart.findOne({ user: userId })) || new Cart({ user: userId, items: [] });
    cart.items = [];
    await cart.save();

    return res.status(200).json({
      message: "Cart cleared",
      cart: formatCart(cart),
    });
  } catch (error) {
    console.error("CLEAR CART ERROR:", error);
    return res.status(500).json({ message: "Failed to clear cart" });
  }
};
