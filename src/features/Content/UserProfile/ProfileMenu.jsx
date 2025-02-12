import React from 'react';
import { NavLink } from 'react-router-dom';
import './UserProfile.css';

const ProfileMenu = () => {
  return (
    <nav className="horizontal-menu">
      <NavLink to="posts" end className="menu-item">
        Posts
      </NavLink>
      <NavLink to="about" className="menu-item">
        About
      </NavLink>
      <NavLink to="photos" className="menu-item">
        Photos
      </NavLink>
      <NavLink to="videos" className="menu-item">
        Videos
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
