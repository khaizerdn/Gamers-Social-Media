// src/hooks/useUserData.js
import { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosConfig';
import Cookies from 'js-cookie';

const API_URL = import.meta.env.VITE_API_URL;

export default function useUserData() {
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    async function fetchData() {
      const userId = Cookies.get("userId");
      if (!userId) return;
      try {
        const { data } = await axiosInstance.get(`${API_URL}/user-details`);
        setUserData(data);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    }
    fetchData();
  }, []);

  return userData;
}
