import API from "../app/axiosConfig";

export const CART_UPDATED_EVENT = "cart:updated";

const emitCartUpdated = (totalItems = 0) => {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent(CART_UPDATED_EVENT, {
      detail: { totalItems },
    })
  );
};

export const getCart = async () => {
  const response = await API.get("/cart");
  return response.data;
};

export const addToCart = async (productId, quantity = 1) => {
  const response = await API.post("/cart/items", { productId, quantity });
  emitCartUpdated(response?.data?.cart?.totalItems || 0);
  return response.data;
};

export const removeFromCart = async (productId) => {
  const response = await API.delete(`/cart/items/${productId}`);
  emitCartUpdated(response?.data?.cart?.totalItems || 0);
  return response.data;
};

export const clearCart = async () => {
  const response = await API.delete("/cart");
  emitCartUpdated(response?.data?.cart?.totalItems || 0);
  return response.data;
};
