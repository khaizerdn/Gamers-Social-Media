import axiosInstance from "./axiosConfig";
const API_URL = import.meta.env.VITE_API_URL;

const fetchProtectedData = async () => {
  try {
    const res = await axiosInstance.get(`${API_URL}/user`);
    console.log(res.data);
    return res.data; // Return the protected data if the request is successful
  } catch (error) {
    console.error("Error fetching protected data:", error.response || error);
    return null;
  }
};

export default fetchProtectedData;
