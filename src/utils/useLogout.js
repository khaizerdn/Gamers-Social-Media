// src/utils/useLogout.js
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosConfig';

const API_URL = import.meta.env.VITE_API_URL;

export default function useLogout() {
  const navigate = useNavigate();

  const logout = async () => {
    console.log("Attempting to log out...");
    try {
      await axiosInstance.post(`${API_URL}/logout`);
      navigate("/");
      window.location.reload();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return logout;
}
