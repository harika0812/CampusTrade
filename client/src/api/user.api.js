import axios from "../app/axiosConfig";

export const getMyProfile = async () => {
  const response = await axios.get("/users/me");
  return response.data;
};

export const updateMyProfile = async (payload) => {
  const response = await axios.put("/users/profile", payload);
  return response.data;
};
