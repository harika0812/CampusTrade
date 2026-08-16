// // import Product from "../models/Product.js";

// // /**
// //  * POST /api/products
// //  * Protected ✅
// //  * Create a new product
// //  */
// // export const createProduct = async (req, res) => {
// //   try {
// //     // ✅ safety check
// //     if (!req.user || !req.user.userId) {
// //       return res.status(401).json({ message: "Unauthorized" });
// //     }

// //     const { title, description, price, category, images } = req.body;

// //     if (!title || !description || !price) {
// //       return res.status(400).json({
// //         message: "title, description, and price are required"
// //       });
// //     }

// //     const product = await Product.create({
// //       title,
// //       description,
// //       price,
// //       category: category || "Others",
// //       images: images || [],
// //       seller: req.user.userId
// //     });

// //     res.status(201).json({
// //       message: "Product created successfully",
// //       product
// //     });
// //   } catch (error) {
// //     console.error("CREATE PRODUCT ERROR:", error);
// //     res.status(500).json({ message: error.message });
// //   }
// // };

// // /**
// //  * GET /api/products
// //  * Public ✅
// //  * Get all available (unsold) products
// //  */
// // export const getAllProducts = async (req, res) => {
// //   try {
// //     const products = await Product.find({ isSold: false })
// //       .populate("seller", "name email") // 👈 THIS IS CRITICAL
// //       .sort({ createdAt: -1 });

// //     // Format response for frontend (clean & safe)
// //     const formattedProducts = products.map((product) => ({
// //       _id: product._id,
// //       title: product.title,
// //       description: product.description,
// //       price: product.price,
// //       category: product.category,
// //       images: product.images,
// //       isSold: product.isSold,
// //       sellerName: product.seller?.name || "Unknown",
// //       sellerEmail: product.seller?.email || ""
// //     }));

// //     res.status(200).json(formattedProducts);
// //   } catch (error) {
// //     console.error("GET PRODUCTS ERROR:", error);
// //     res.status(500).json({ message: error.message });
// //   }
// // };
// // /**
// //  * GET /api/products/:id
// //  * Public ✅
// //  * Get single product by ID
// //  */
// // /**
// //  * GET /api/products/:id
// //  * Public
// //  */
// // export const getProductById = async (req, res) => {
// //   try {
// //     const product = await Product.findById(req.params.id)
// //       .populate("seller", "name email");

// //     if (!product) {
// //       return res.status(404).json({ message: "Product not found" });
// //     }

// //     res.status(200).json({
// //       _id: product._id,
// //       title: product.title,
// //       description: product.description,
// //       price: product.price,
// //       category: product.category,
// //       images: product.images,
// //       isSold: product.isSold,
// //       sellerName: product.seller?.name || "Unknown",
// //       sellerEmail: product.seller?.email || ""
// //     });
// //   } catch (error) {
// //     console.error("GET PRODUCT ERROR:", error);
// //     res.status(500).json({ message: error.message });
// //   }
// // };

// // /**
// //  * GET /api/products/mine/me
// //  * Protected ✅
// //  * Get logged-in user's products
// //  */
// // export const getMyProducts = async (req, res) => {
// //   try {
// //     if (!req.user || !req.user.userId) {
// //       return res.status(401).json({ message: "Unauthorized" });
// //     }

// //     const products = await Product.find({
// //       seller: req.user.userId
// //     }).sort({ createdAt: -1 });

// //     res.status(200).json(products);
// //   } catch (error) {
// //     console.error("GET MY PRODUCTS ERROR:", error);
// //     res.status(500).json({ message: error.message });
// //   }
// // };

// // /**
// //  * PUT /api/products/:id/sold
// //  * Protected ✅ (owner only)
// //  * Mark product as sold
// //  */
// // export const markProductAsSold = async (req, res) => {
// //   try {
// //     if (!req.user || !req.user.userId) {
// //       return res.status(401).json({ message: "Unauthorized" });
// //     }

// //     const product = await Product.findById(req.params.id);

// //     if (!product) {
// //       return res.status(404).json({ message: "Product not found" });
// //     }

// //     if (product.seller.toString() !== req.user.userId) {
// //       return res.status(403).json({ message: "Not authorized" });
// //     }

// //     product.isSold = true;
// //     await product.save();

// //     res.status(200).json({
// //       message: "Product marked as sold",
// //       product
// //     });
// //   } catch (error) {
// //     console.error("MARK SOLD ERROR:", error);
// //     res.status(500).json({ message: error.message });
// //   }
// // };

// // /**
// //  * DELETE /api/products/:id
// //  * Protected ✅ (owner only)
// //  * Delete product
// //  */
// // export const deleteProduct = async (req, res) => {
// //   try {
// //     if (!req.user || !req.user.userId) {
// //       return res.status(401).json({ message: "Unauthorized" });
// //     }

// //     const product = await Product.findById(req.params.id);

// //     if (!product) {
// //       return res.status(404).json({ message: "Product not found" });
// //     }

// //     if (product.seller.toString() !== req.user.userId) {
// //       return res.status(403).json({ message: "Not authorized" });
// //     }

// //     await product.deleteOne();

// //     res.status(200).json({
// //       message: "Product deleted successfully"
// //     });
// //   } catch (error) {
// //     console.error("DELETE PRODUCT ERROR:", error);
// //     res.status(500).json({ message: error.message });
// //   }
// // };
// // // import Product from "../models/Product.js";

// // // /**
// // //  * Create product
// // //  * POST /api/products
// // //  */
// // // export const createProduct = async (req, res) => {
// // //   try {
// // //     const { title, description, price, category, images } = req.body;

// // //     if (!title || !description || !price) {
// // //       return res.status(400).json({ message: "Missing required fields" });
// // //     }

// // //     const product = await Product.create({
// // //       title,
// // //       description,
// // //       price,
// // //       category: category || "Others",
// // //       images: images || [],
// // //       seller: req.user.id, // 🔑 from JWT
// // //     });

// // //     res.status(201).json(product);
// // //   } catch (error) {
// // //     console.error("CREATE PRODUCT ERROR:", error);
// // //     res.status(500).json({ message: "Server error" });
// // //   }
// // // };

// // // /**
// // //  * Get all products
// // //  * GET /api/products
// // //  */
// // // export const getAllProducts = async (req, res) => {
// // //   try {
// // //     const products = await Product.find({ isSold: false })
// // //       .populate("seller", "name email")
// // //       .sort({ createdAt: -1 });

// // //     res.json(products);
// // //   } catch (error) {
// // //     res.status(500).json({ message: "Server error" });
// // //   }
// // // };

// // // /**
// // //  * Get product by ID
// // //  */
// // // export const getProductById = async (req, res) => {
// // //   try {
// // //     const product = await Product.findById(req.params.id)
// // //       .populate("seller", "name email");

// // //     if (!product) {
// // //       return res.status(404).json({ message: "Product not found" });
// // //     }

// // //     res.json(product);
// // //   } catch (error) {
// // //     res.status(500).json({ message: "Server error" });
// // //   }
// // // };

// // // /**
// // //  * Get my products
// // //  */
// // // export const getMyProducts = async (req, res) => {
// // //   try {
// // //     const products = await Product.find({ seller: req.user.id });
// // //     res.json(products);
// // //   } catch (error) {
// // //     res.status(500).json({ message: "Server error" });
// // //   }
// // // };

// // // /**
// // //  * Mark product as sold
// // //  */
// // // export const markProductAsSold = async (req, res) => {
// // //   try {
// // //     const product = await Product.findById(req.params.id);

// // //     if (!product) {
// // //       return res.status(404).json({ message: "Product not found" });
// // //     }

// // //     if (product.seller.toString() !== req.user.id) {
// // //       return res.status(403).json({ message: "Not authorized" });
// // //     }

// // //     product.isSold = true;
// // //     await product.save();

// // //     res.json(product);
// // //   } catch (error) {
// // //     res.status(500).json({ message: "Server error" });
// // //   }
// // // };

// // // /**
// // //  * Delete product
// // //  */
// // // export const deleteProduct = async (req, res) => {
// // //   try {
// // //     const product = await Product.findById(req.params.id);

// // //     if (!product) {
// // //       return res.status(404).json({ message: "Product not found" });
// // //     }

// // //     if (product.seller.toString() !== req.user.id) {
// // //       return res.status(403).json({ message: "Not authorized" });
// // //     }

// // //     await product.deleteOne();
// // //     res.json({ message: "Product deleted" });
// // //   } catch (error) {
// // //     res.status(500).json({ message: "Server error" });
// // //   }
// // // };
// import Product from "../models/Product.js";

// /**
//  * POST /api/products
//  * Protected ✅
//  * Create a new product
//  */
// export const createProduct = async (req, res) => {
//   try {
//     // ✅ safety check
//     if (!req.user || !req.user.userId) {
//       return res.status(401).json({ message: "Unauthorized" });
//     }

//     const { title, description, price, category } = req.body;

//     if (!title || !description || !price || !req.file) {
//       return res.status(400).json({
//         message: "title, description, price, and image are required"
//       });
//     }

//     // Save image path
//     const imagePath = req.file.path; // e.g., "uploads/123456789-image.jpg"

//     const product = await Product.create({
//       title,
//       description,
//       price,
//       category: category || "Others",
//       images: [imagePath], // Array with one image
//       seller: req.user.userId
//     });

//     res.status(201).json({
//       message: "Product created successfully",
//       product
//     });
//   } catch (error) {
//     console.error("CREATE PRODUCT ERROR:", error);
//     res.status(500).json({ message: error.message });
//   }
// };
import Product from "../models/Product.js";
import Order from "../models/Order.js";
import User from "../models/User.js";
import { uploadProductImage } from "../config/media.js";

const getMissingSellerProfileFields = (seller) => {
  const missing = [];
  if (!String(seller?.rollNo || "").trim()) missing.push("Roll No");
  if (!String(seller?.className || "").trim()) missing.push("Class");
  if (!String(seller?.branch || "").trim()) missing.push("Branch");
  if (!String(seller?.year || "").trim()) missing.push("Year");
  return missing;
};

const getReservedCopiesByProductIds = async (productIds = []) => {
  if (!Array.isArray(productIds) || productIds.length === 0) {
    return {};
  }

  let reservations = [];
  try {
    reservations = await Order.find({
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
  } catch {
    return {};
  }

  const reservedByProductId = {};

  for (const order of reservations) {
    for (const item of order.items || []) {
      const id = item?.productId?.toString?.();
      if (!id) continue;
      const qty = Number(item?.quantity || 1);
      reservedByProductId[id] = (reservedByProductId[id] || 0) + (Number.isFinite(qty) && qty > 0 ? qty : 1);
    }
  }

  return reservedByProductId;
};

const mapProductForResponse = (product, reservedCopies = 0) => {
  const availableCopies = Math.max(0, Number(product.availableCopies ?? 1));
  const safeReserved = Math.max(0, Number(reservedCopies || 0));
  const purchasableCopies = Math.max(0, availableCopies - safeReserved);

  let stockStatus = "available";
  if (product.isSold || availableCopies <= 0) {
    stockStatus = "sold_out";
  } else if (purchasableCopies <= 0) {
    stockStatus = "reserved";
  }

  return {
    _id: product._id,
    title: product.title,
    description: product.description,
    price: product.price,
    listingType: product.listingType || "sell",
    paymentOption: product.paymentOption || "both",
    paymentDetails: {
      upiQrUrl: "",
    },
    lendingDetails: {
      borrowFee: Number(product.lendingDetails?.borrowFee || 0),
      maxDurationDays: Number(product.lendingDetails?.maxDurationDays || 7),
      terms: product.lendingDetails?.terms || "",
    },
    availableCopies,
    reservedCopies: safeReserved,
    purchasableCopies,
    stockStatus,
    category: product.category,
    images: product.images,
    isSold: stockStatus === "sold_out",
    sellerId: product.seller?._id || product.seller,
    sellerName: product.seller?.name || "Unknown",
    sellerRollNo: product.seller?.rollNo || "",
    sellerEmail: product.seller?.email || "",
    seller: product.seller,
  };
};

/**
 * POST /api/products
 * Protected ✅
 * Create a new product
 */
export const createProduct = async (req, res) => {
  try {
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const {
      title,
      description,
      price,
      category,
      availableCopies,
      listingType,
      paymentOption,
      borrowFee,
      maxDurationDays,
      lendingTerms,
    } = req.body;

    if (!title || !description || !price || !req.file) {
      return res.status(400).json({
        message: "title, description, price, and image are required"
      });
    }

    if (paymentOption && String(paymentOption).toLowerCase() !== "cod") {
      return res.status(400).json({ message: "Only COD is supported on this platform." });
    }

    const seller = await User.findById(req.user.userId).select("rollNo className branch year");
    if (!seller) {
      return res.status(404).json({ message: "User not found" });
    }

    const missingProfileFields = getMissingSellerProfileFields(seller);
    if (missingProfileFields.length > 0) {
      return res.status(400).json({ message: "Update profile before listing item." });
    }

    let imageUrl;
    try {
      imageUrl = await uploadProductImage(req.file.path);
    } catch (uploadError) {
      const uploadMessage = String(uploadError?.message || "");
      console.error("📸 IMAGE UPLOAD FAILED:", uploadMessage);
      
      // Distinguish between config and upload failures
      if (uploadMessage.includes("not configured")) {
        return res.status(503).json({ message: "Image upload service is not available. Please try again later." });
      }
      if (uploadMessage.includes("authentication")) {
        return res.status(503).json({ message: "Image upload service authentication failed. Please try again later." });
      }
      
      return res.status(400).json({ message: uploadMessage || "Image upload failed. Please check the file and try again." });
    }

    if (!imageUrl || !/^https?:\/\//i.test(imageUrl)) {
      console.error("❌ INVALID IMAGE URL RETURNED:", imageUrl);
      return res.status(500).json({ message: "Image upload validation failed. Please try again." });
    }

    const parsedCopies = Number.parseInt(availableCopies, 10);
    const safeAvailableCopies = Number.isInteger(parsedCopies) && parsedCopies >= 0 ? parsedCopies : 1;
    const safeListingType = ["sell", "lend", "both"].includes(listingType) ? listingType : "sell";

    const parsedBorrowFee = Number(borrowFee);
    const safeBorrowFee = Number.isFinite(parsedBorrowFee) && parsedBorrowFee >= 0 ? parsedBorrowFee : 0;
    const parsedMaxDurationDays = Number.parseInt(maxDurationDays, 10);
    const safeMaxDurationDays = Number.isInteger(parsedMaxDurationDays) && parsedMaxDurationDays > 0
      ? parsedMaxDurationDays
      : 7;

    if (safeListingType === "both" && safeBorrowFee <= 0) {
      return res.status(400).json({ message: "borrowFee is required when listing type is both" });
    }

    const product = await Product.create({
      title,
      description,
      price,
      availableCopies: safeAvailableCopies,
      listingType: safeListingType,
      paymentOption: "cod",
      paymentDetails: { upiId: "", upiQrUrl: "" },
      lendingDetails: {
        borrowFee: safeListingType === "lend" ? (safeBorrowFee > 0 ? safeBorrowFee : Number(price)) : safeBorrowFee,
        maxDurationDays: safeMaxDurationDays,
        terms: typeof lendingTerms === "string" ? lendingTerms.trim() : "",
      },
      category: category || "Others",
      images: [imageUrl],
      seller: req.user.userId,
    });

    return res.status(201).json({
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    console.error("CREATE PRODUCT ERROR:", error);
    return res.status(500).json({ message: "Failed to create product. Please try again." });
  }
};

/**
 * GET /api/products
 * Public ✅
 * Get all available (unsold) products
 */
export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find({ isSold: false })
      .populate("seller", "name email rollNo className branch year") // 👈 Include all student details
      .sort({ createdAt: -1 });

    const reservedByProductId = await getReservedCopiesByProductIds(products.map((product) => product._id));

    // Format response for frontend (clean & safe)
    const formattedProducts = products.map((product) =>
      mapProductForResponse(product, reservedByProductId[product._id.toString()] || 0)
    );

    res.status(200).json(formattedProducts);
  } catch (error) {
    console.error("GET PRODUCTS ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};

    /**
     * GET /api/products/:id
 * Public ✅
 * Get single product by ID
 */
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate("seller", "name email rollNo className branch year");

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const reservedByProductId = await getReservedCopiesByProductIds([product._id]);

    res.status(200).json(
      mapProductForResponse(product, reservedByProductId[product._id.toString()] || 0)
    );
  } catch (error) {
    console.error("GET PRODUCT ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * GET /api/products/mine
 * Protected ✅
 * Get logged-in user's products
 */
export const getMyProducts = async (req, res) => {
  try {
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const products = await Product.find({
      seller: req.user.userId
    }).sort({ createdAt: -1 });

    const reservedByProductId = await getReservedCopiesByProductIds(products.map((product) => product._id));

    // Format response for frontend (clean & safe)
    const formattedProducts = products.map((product) => ({
      ...mapProductForResponse(product, reservedByProductId[product._id.toString()] || 0),
      seller: undefined,
    }));

    res.status(200).json(formattedProducts);
  } catch (error) {
    console.error("GET MY PRODUCTS ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * PUT /api/products/:id
 * Protected ✅ (owner only)
 * Update product listing
 */
export const updateProduct = async (req, res) => {
  try {
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (product.seller.toString() !== req.user.userId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (product.isSold) {
      return res.status(400).json({ message: "Sold products cannot be edited" });
    }

    const {
      title,
      description,
      price,
      category,
      availableCopies,
      listingType,
      paymentOption,
      borrowFee,
      maxDurationDays,
      lendingTerms,
    } = req.body;

    if (!title || !description || !price || !category) {
      return res.status(400).json({ message: "title, description, price, and category are required" });
    }

    product.title = title;
    product.description = description;
    product.price = price;
    product.category = category;
    if (listingType !== undefined) {
      if (!["sell", "lend", "both"].includes(listingType)) {
        return res.status(400).json({ message: "listingType must be sell, lend, or both" });
      }
      product.listingType = listingType;
    }

    if (paymentOption && String(paymentOption).toLowerCase() !== "cod") {
      return res.status(400).json({ message: "Only COD is supported on this platform." });
    }
    product.paymentOption = "cod";

    if (!product.paymentDetails) {
      product.paymentDetails = { upiId: "", upiQrUrl: "" };
    }

    const seller = await User.findById(req.user.userId).select("rollNo className branch year");
    if (!seller) {
      return res.status(404).json({ message: "User not found" });
    }

    const missingProfileFields = getMissingSellerProfileFields(seller);
    if (missingProfileFields.length > 0) {
      return res.status(400).json({
        message: "Update profile before listing item."
      });
    }

    product.paymentDetails.upiId = "";
    product.paymentDetails.upiQrUrl = "";

    const nextListingType = product.listingType || "sell";
    if (nextListingType === "lend" || nextListingType === "both") {
      if (!product.lendingDetails) {
        product.lendingDetails = {};
      }

      if (borrowFee !== undefined) {
        const parsedBorrowFee = Number(borrowFee);
        if (!Number.isFinite(parsedBorrowFee) || parsedBorrowFee < 0) {
          return res.status(400).json({ message: "borrowFee must be a non-negative number" });
        }
        product.lendingDetails.borrowFee = parsedBorrowFee;
      }

      if (maxDurationDays !== undefined) {
        const parsedDuration = Number.parseInt(maxDurationDays, 10);
        if (!Number.isInteger(parsedDuration) || parsedDuration < 1) {
          return res.status(400).json({ message: "maxDurationDays must be a positive integer" });
        }
        product.lendingDetails.maxDurationDays = parsedDuration;
      }

      if (lendingTerms !== undefined) {
        product.lendingDetails.terms = typeof lendingTerms === "string" ? lendingTerms.trim() : "";
      }

      if (nextListingType === "both" && Number(product.lendingDetails.borrowFee || 0) <= 0) {
        return res.status(400).json({ message: "borrowFee is required when listing type is both" });
      }

      if (nextListingType === "lend" && Number(product.lendingDetails.borrowFee || 0) <= 0) {
        product.lendingDetails.borrowFee = Number(price);
      }
    }

    if (availableCopies !== undefined) {
      const parsedCopies = Number.parseInt(availableCopies, 10);
      if (!Number.isInteger(parsedCopies) || parsedCopies < 0) {
        return res.status(400).json({ message: "availableCopies must be a non-negative integer" });
      }
      product.availableCopies = parsedCopies;
      if (parsedCopies === 0) {
        product.isSold = true;
      }
    }

    if (req.file?.path) {
      let imageUrl;
      try {
        imageUrl = await uploadProductImage(req.file.path);
      } catch (uploadError) {
        const uploadMessage = String(uploadError?.message || "");
        console.error("📸 IMAGE UPLOAD FAILED (UPDATE):", uploadMessage);
        
        if (uploadMessage.includes("not configured")) {
          return res.status(503).json({ message: "Image upload service is not available. Please try again later." });
        }
        if (uploadMessage.includes("authentication")) {
          return res.status(503).json({ message: "Image upload service authentication failed. Please try again later." });
        }
        
        return res.status(400).json({ message: uploadMessage || "Image upload failed. Please check the file and try again." });
      }

      if (!imageUrl || !/^https?:\/\//i.test(imageUrl)) {
        console.error("❌ INVALID IMAGE URL RETURNED (UPDATE):", imageUrl);
        return res.status(500).json({ message: "Image upload validation failed. Please try again." });
      }
      
      product.images = [imageUrl];
    }

    await product.save();

    return res.status(200).json({
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    console.error("UPDATE PRODUCT ERROR:", error);
    return res.status(500).json({ message: error.message });
  }
};

/**
 * PUT /api/products/:id/sold
 * Protected ✅ (owner only)
 * Mark product as sold
 */
export const markProductAsSold = async (req, res) => {
  try {
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (product.seller.toString() !== req.user.userId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    product.isSold = true;
    product.availableCopies = 0;
    await product.save();

    res.status(200).json({
      message: "Product marked as sold",
      product
    });
  } catch (error) {
    console.error("MARK SOLD ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * DELETE /api/products/:id
 * Protected ✅ (owner only)
 * Delete product
 */
export const deleteProduct = async (req, res) => {
  try {
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (product.seller.toString() !== req.user.userId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await product.deleteOne();

    res.status(200).json({
      message: "Product deleted successfully"
    });
  } catch (error) {
    console.error("DELETE PRODUCT ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};