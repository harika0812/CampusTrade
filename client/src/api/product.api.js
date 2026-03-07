// // import API from "../app/axiosConfig";

// // // Axios instance for backend communication
// // // const API = axios.create({
// // //   baseURL: "http://localhost:5000/api",
// // // });

// // /**
// //  * Fetch all products
// //  */
// // export const fetchAllProducts = async () => {
// //   const response = await API.get("/products");
// //   return response.data;
// // };

// // /**
// //  * Fetch single product by ID
// //  * @param {string} id - product ID
// //  */
// // export const fetchProductById = async (id) => {
// //   const response = await API.get(`/products/${id}`);
// //   return response.data;
// // };
// // import axios from "../app/axiosConfig";

// // /**
// //  * Create a new product listing
// //  * JWT token is attached automatically via axiosConfig
// //  */
// // export const createProduct = async (productData) => {
// //   const response = await API.post("/products", productData);
// //   return response.data;
// // };

// // ✅ IMPORTS MUST BE AT TOP
// import API from "../app/axiosConfig";

// /**
//  * Get all products (Public)
//  */
// export const fetchAllProducts = async () => {
//   const response = await API.get("/products");
//   return response.data;
// };

// /**
//  * Get single product by ID (Public)
//  */
// export const fetchProductById = async (id) => {
//   const response = await API.get(`/products/${id}`);
//   return response.data;
// };

// /**
//  * Create new product (Protected - JWT required)
//  */
// export const createProduct = async (productData) => {
//   const response = await API.post("/products", productData);
//   return response.data;
// };

// /**
//  * Get logged-in user's products (Protected)
//  */
// export const fetchMyProducts = async () => {
//   const response = await API.get("/products/mine");
//   return response.data;
// };
// export const markAsSold = async (id) => {
//   const res = await API.put(`/products/${id}/sold`);
//   return res.data;
// };
// export const deleteProduct = async (id) => {
//   const res = await API.delete(`/products/${id}`);
//   return res.data;
// };
import API from "../app/axiosConfig";
/**
 * Fetch all products
 */     
export const fetchAllProducts = async () => {
  const response = await API.get("/products");
  return response.data;
}
/**
 * Fetch product by ID
 */     
export const fetchProductById = async (id) => {
  const response = await API.get(`/products/${id}`);
  return response.data;
}


/** * Create a new product listing
 * JWT token is attached automatically via axiosConfig
 */
export const createProduct = async (productData) => {
  const response = await API.post("/products", productData);
  return response.data;
}
  
export const fetchMyListings = async () => {
  const response = await API.get("/products/mine");
  return response.data;
}
export const markAsSold = async (id) => {
  const res = await API.put(`/products/${id}/sold`);
  return res.data;
}
export const deleteProduct = async (id) => {
  const res = await API.delete(`/products/${id}`);
  return res.data;
}
export const updateProduct = async (id, productData) => {
  const res = await API.put(`/products/${id}`, productData);
  return res.data;
}
export const fetchMyProducts = async () => {
  const response = await API.get("/products/mine");
  return response.data;
};