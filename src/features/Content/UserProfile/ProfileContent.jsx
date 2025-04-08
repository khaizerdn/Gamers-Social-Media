// ProfileContent.jsx
import React from 'react';
import { useLocation } from 'react-router-dom';
import './UserProfile.css';

const ProfileContent = () => {
  const location = useLocation();
  // Assuming URL is like "/username/about"
  const segments = location.pathname.split('/');
  // segments[0] is empty, segments[1] is the username, segments[2] is the sub-route (active tab)
  const activeTab = segments[2] || 'posts'; // Default to "posts" if no sub-route

  let content;
  switch (activeTab) {
    case "posts":
      content = <div>Posts content goes here</div>;
      break;
    case "gallery":
      content = <div>Gallery content goes here</div>;
      break;
    case "friends":
      content = <div>Friends content goes here</div>;
      break;
    case "following":
      content = <div>Following content goes here</div>;
      break;
    default:
      content = <div>Select a tab to view content.</div>;
  }

  return <div>{content}</div>;
};

export default ProfileContent;
