import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axiosInstance from '../../api/axiosConfig';

const ContentProfile = () => {
  const { username } = useParams();
  const [profileData, setProfileData] = useState(null);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const response = await axiosInstance.get(`/user/${username}`);
        setProfileData(response.data);
      } catch (error) {
        console.error("Failed to fetch profile data:", error);
      }
    };

    fetchProfileData();
  }, [username]);

  if (!profileData) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>{profileData.first_name} {profileData.last_name}</h1>
      <p>Username: {profileData.username}</p>
      {/* Add more profile details here */}
    </div>
  );
};

export default ContentProfile;