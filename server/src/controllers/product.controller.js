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

/**
 * POST /api/products
 * Protected ✅
 * Create a new product
 */
export const createProduct = async (req, res) => {
  try {
    // ✅ safety check
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { title, description, price, category } = req.body;

    if (!title || !description || !price || !req.file) {
      return res.status(400).json({
        message: "title, description, price, and image are required"
      });
    }

    // Save image path
    const imagePath = req.file.path; // e.g., "uploads/123456789-image.jpg"

    const product = await Product.create({
      title,
      description,
      price,
      category: category || "Others",
      images: [imagePath], // Array with one image
      seller: req.user.userId
    });

    res.status(201).json({
      message: "Product created successfully",
      product
    });
  } catch (error) {
    console.error("CREATE PRODUCT ERROR:", error);
    res.status(500).json({ message: error.message });
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
      .populate("seller", "name email") // 👈 THIS IS CRITICAL
      .sort({ createdAt: -1 });

    // Format response for frontend (clean & safe)
    const formattedProducts = products.map((product) => ({
      _id: product._id,
      title: product.title,
      description: product.description,
      price: product.price,
      category: product.category,
      images: product.images,
      isSold: product.isSold,
        sellerId: product.seller?._id,
      sellerName: product.seller?.name || "Unknown",
      sellerEmail: product.seller?.email || ""
    }));

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
      .populate("seller", "name email");

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({
      _id: product._id,
      title: product.title,
      description: product.description,
      price: product.price,
      category: product.category,
      images: product.images,
      isSold: product.isSold,
      sellerId: product.seller?._id,
      sellerName: product.seller?.name || "Unknown",
      sellerEmail: product.seller?.email || ""
    });
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

    // Format response for frontend (clean & safe)
    const formattedProducts = products.map((product) => ({
      _id: product._id,
      title: product.title,
      description: product.description,
      price: product.price,
      category: product.category,
      images: product.images,
      isSold: product.isSold,
      sellerId: product.seller?._id,
      sellerName: product.seller?.name || "Unknown",
      sellerEmail: product.seller?.email || ""
    }));

    res.status(200).json(formattedProducts);
  } catch (error) {
    console.error("GET MY PRODUCTS ERROR:", error);
    res.status(500).json({ message: error.message });
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