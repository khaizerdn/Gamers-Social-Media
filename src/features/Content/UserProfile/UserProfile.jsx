// UserProfile.jsx
import React, { lazy, Suspense } from 'react';
import useUserData from '../../../utils/useUserData';
import './UserProfile.css';

// Lazy load the menu and content components
const ProfileMenu = lazy(() => import('./ProfileMenu'));
const ProfileContent = lazy(() => import('./ProfileContent'));

const UserProfile = () => {
  const userData = useUserData();

  if (!userData) {
    return <div>Loading user data...</div>;
  }

  return (
    <div className="userprofile">
      <div className="userprofile-coverphoto">
        <div className="userprofile-innercontainer">
          <div className="userprofile-profilephoto">
            {/* Optionally, insert the user's profile photo */}
          </div>
          <div className="userprofile-info">
            <div className="userprofile-firstandlast">
              <div className="userprofile-firstname">{userData.first_name}</div>
              <div className="userprofile-lastname">{userData.last_name}</div>
            </div>
            <div className="userprofile-username">{userData.username}</div>
          </div>
          <div className="userprofile-other">
            {/* Additional details */}
          </div>
        </div>
      </div>
      <div className="userprofile-main">
        <div className="userprofile-sidebar">
          <Suspense fallback={<div>Loading menu...</div>}>
            <ProfileMenu />
          </Suspense>
        </div>
        <div className="hr-vertical"></div>
        <div className="userprofile-content-container">
          <Suspense fallback={<div>Loading content...</div>}>
            <ProfileContent />
          </Suspense>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
