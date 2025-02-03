import axiosInstance from "./axiosConfig";

const fetchProtectedData = async () => {
  try {
    const res = await axiosInstance.get("http://localhost:8081/user");
    console.log(res.data);
    return res.data; // Return the protected data if the request is successful
  } catch (error) {
    console.error("Error fetching protected data:", error.response || error);
    return null;
  }
};

export default fetchProtectedData;
