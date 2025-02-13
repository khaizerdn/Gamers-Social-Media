import React from 'react';
import { NavLink } from 'react-router-dom';
import './UserProfile.css';

const ProfileMenu = () => {
  return (
    <nav className="horizontal-menu">
      {/* Use "." to keep the URL as /username and add the "end" prop for exact matching */}
      <NavLink to="." end className="menu-item">
        Posts
      </NavLink>
      <NavLink to="gallery" className="menu-item">
        Gallery
      </NavLink>
      <NavLink to="friends" className="menu-item">
        Friends
      </NavLink>
      <NavLink to="following" className="menu-item">
        Following
      </NavLink>
    </nav>
  );
};

export default ProfileMenu;
