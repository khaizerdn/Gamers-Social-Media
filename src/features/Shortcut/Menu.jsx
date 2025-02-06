import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Menu.css';
import axiosInstance from '../../api/axiosConfig';
import Cookies from "js-cookie";

function Menu() {
  const navigate = useNavigate();
  const location = useLocation();
  const [userDetails, setUserDetails] = useState(null);
  useEffect(() => {
    const fetchUserDetails = async () => {
      const userId = Cookies.get("userId");
      if (!userId) {
        console.error("User ID not found in cookies");
        return;
      }

      try {
        const response = await axiosInstance.get("http://localhost:8081/user-details");
        setUserDetails(response.data);
      } catch (error) {
        console.error("Failed to fetch user details:", error);
      }
    };

    fetchUserDetails();
  }, []);

  const [selectedButton, setSelectedButton] = useState(() => {
    return localStorage.getItem('selectedButton') || 'home';
  });

  useEffect(() => {
    const path = location.pathname;
    const newSelectedButton = getButtonFromPath(path);
    setSelectedButton(newSelectedButton);
    localStorage.setItem('selectedButton', newSelectedButton);
  }, [location]);

  const getButtonFromPath = (path) => {
    switch (path) {
      case '/':
        return 'home';
      case '/notifications':
        return 'notifications';
      case '/trends':
        return 'trends';
      case '/tournament':
        return 'tournament';
      case '/scrimmage':
        return 'scrimmage';
      case '/chats':
        return 'chats';
      case '/friends':
        return 'friends';
      case '/teams':
        return 'teams';
      case '/clubs':
        return 'clubs';
      case '/pages':
        return 'pages';
      case '/settings':
        return 'settings';
      case 'logout':
        return 'logout';
      default:
        return null;
    }
  };

  const handleButtonClick = (button) => {
    if (button === 'logout') {
      handleLogout()
    } else {
      setSelectedButton(button);
      localStorage.setItem('selectedButton', button);
      navigate(`/${button}`);
    }
  };

  const handleLogout = async () => {
    console.log("Attempting to log out..."); // Add this line for debugging
    try {
      // Logout request to backend
      await axiosInstance.post("http://localhost:8081/logout");
      // Navigate and reload the page (optional)
      navigate("/");
      window.location.reload();

    } catch (error) {
      console.error("Logout failed:", error);
    }
  };



  const createShortcutButton = (buttonName, iconPath, labelText, extraClassName = '') => (
    <div
      role="button"
      tabIndex="0"
      className={`button-default ${selectedButton === buttonName ? 'selected' : ''} ${extraClassName}`}
      onClick={() => handleButtonClick(buttonName)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleButtonClick(buttonName);
        }
      }}
    >
      <div className="button-logo-container">
        <svg xmlns="http://www.w3.org/2000/svg" className="button-logo" width="24" height="24" viewBox="0 0 24 24">
          <path d={iconPath} />
        </svg>
      </div>
      <div className="button-text">{labelText}</div>
    </div>
  );


  return (
    <>
      {/* <div className="shortcut-one">
        <div className="shortcut-logo">
          <div className="shortcut-logo-mainlogo">LOGO HERE</div>
        </div>
      </div> */}
      <div className="section">
        <div className='button-mainLogo'>
          <div className="mainLogo-container">
            <svg xmlns="http://www.w3.org/2000/svg" className="mainLogo" width="24" height="24" viewBox="0 0 24 24">
              <path d='M21.055 7.814C17.513 1.404 7.118 0 7.118 0s4.798 5.34-1.334 9.567c-3.875 2.666-5.41 6.13-3.75 9.914 1.27 2.899 3.96 4.076 6.861 4.519-.745-1.434-.932-3.505-.381-5.628.055-.212.116-.434.186-.635.813 1.258 2.147 1.946 3.449 1.628 1.783-.424 2.829-2.581 2.342-4.798a5.091 5.091 0 0 0-.536-1.372c.07.017.14.023.212.047 2.225.635 3.301 3.962 2.403 7.435a9.254 9.254 0 0 1-1.326 2.945c3.82-1.23 6.361-4.311 7.06-7.056.737-2.857.178-6.186-1.249-8.752z' />
            </svg>
          </div>
          <div className="mainLogo2-container">

          </div>
        </div>

        <div className="button-default">
        {userDetails ? (
          <>
          <div className="button-logo-container">
          <img src='' className="shortcut-button-profile-picture" />
        </div>
        <div className="shortcut-button-profile-text">
          <div className="shortcut-button-profile-text-realname">{userDetails.first_name} {userDetails.last_name}</div><div className='button-text-other'>{userDetails.username}</div>
          {/* In-game, Idle, Online, Invisible,  */}
          <div className="shortcut-button-profile-text-username"></div>
        </div>
        </>
        ) : (
          <div>Loading user details...</div>
        )}
      </div>
        {createShortcutButton('create', 'm21,12c0,1.11-.89,2-2,2h-5.01v5.01c0,1.11-.89,2-2,2s-2-.89-2-2v-5.01h-5.01c-1.1,0-2-.89-2-2s.9-2,2-2h5.01v-5.01c0-1.1.89-2,2-2s2,.9,2,2v5.01h5.01c1.11,0,2,.89,2,2Z', 'Create'/*, 'highlight-button'*/)}
        {createShortcutButton('search', 'M20.82,19.23l-3.48-3.49c2.61-3.48,1.9-8.42-1.59-11.03s-8.42-1.9-11.03,1.59c-2.61,3.48-1.9,8.42,1.59,11.03,2.8,2.09,6.64,2.09,9.44,0l3.49,3.49c.44.44,1.15.44,1.59,0,.44-.44.44-1.15,0-1.59h0s0,0,0,0ZM11.06,16.66c-3.1,0-5.61-2.51-5.61-5.61s2.51-5.61,5.61-5.61,5.61,2.51,5.61,5.61c0,3.09-2.51,5.6-5.61,5.61Z', 'Search'/*, 'highlight-button'*/)}
      </div>
      <div className='hr-horizontal'></div>
      <div className="section">
        <div className="section-title">Main</div>
        {createShortcutButton('home', 'm20.23,9.52l-5.31-5.31c-1.61-1.61-4.22-1.61-5.83,0l-5.31,5.31c-.49.49-.77,1.16-.77,1.86v7.78c0,1.02.83,1.84,1.84,1.84h14.32c1.02,0,1.84-.82,1.84-1.84v-7.78c0-.7-.27-1.37-.77-1.86Zm-1.48,9.23h-3.75v-2.39c0-1.58-1.28-2.86-2.86-2.86h-.27c-1.58,0-2.86,1.28-2.86,2.86v2.39h-3.75v-7.37c0-.1.04-.19.11-.27l5.31-5.31c.73-.73,1.92-.73,2.65,0h0s5.31,5.31,5.31,5.31c.07.07.11.17.11.27v7.37h0Z', 'Home')}
        {createShortcutButton('notifications', 'm20.9,13.01l-1.46-5.25c-1.17-4.19-5.51-6.64-9.69-5.47-2.8.78-4.94,3.04-5.57,5.87l-1.13,5.08c-.55,2.47,1.01,4.92,3.48,5.47.33.07.66.11.99.11h.33c.68,2.34,3.12,3.68,5.46,3.01,1.45-.42,2.59-1.56,3.01-3.01h.16c2.53,0,4.58-2.05,4.58-4.58,0-.41-.06-.83-.17-1.23h0Zm-2.76,2.49c-.39.52-1.01.83-1.66.82H7.52c-1.15,0-2.08-.93-2.08-2.08,0-.15.02-.3.05-.45l1.13-5.08c.64-2.9,3.51-4.72,6.4-4.08,1.94.43,3.48,1.9,4.01,3.81l1.46,5.25c.18.63.05,1.3-.35,1.82h0Z', 'Notification')}
        {/* {createShortcutButton('trends', 'm19.09,7h-4.16c-.69,0-1.25.56-1.25,1.25s.56,1.25,1.25,1.25h2.81l-4.9,4.9-3.43-3.43c-.87-.86-2.27-.86-3.13,0l-3.9,3.9c-.5.48-.51,1.27-.03,1.77s1.27.51,1.77.03c.01-.01.02-.02.03-.03l3.7-3.7,3.43,3.43c.43.43,1,.65,1.57.65s1.13-.22,1.57-.65l5.1-5.1v2.81c0,.69.56,1.25,1.25,1.25s1.25-.56,1.25-1.25h0v-4.16c0-1.61-1.31-2.91-2.91-2.91h0Z', 'Trends')} */}
        {createShortcutButton('tournament', 'm21,10.5c0-1.19-.71-2.27-1.79-2.74.05-.16.11-.32.16-.47.3-1,.1-2.09-.53-2.92-.64-.86-1.64-1.36-2.71-1.36H7.88c-1.07,0-2.08.5-2.71,1.36-.63.84-.83,1.92-.52,2.92.05.16.11.31.16.47-1.09.48-1.8,1.55-1.8,2.74,0,2.36,1.78,5.1,6.75,5.24v1.89c.06.57-.36,1.07-.92,1.12-.07,0-.13,0-.2,0h-.75c-.62,0-1.12.5-1.12,1.12s.5,1.12,1.12,1.12h8.25c.62,0,1.12-.5,1.12-1.12s-.5-1.12-1.12-1.12h-.74c-.57.06-1.08-.35-1.14-.92,0-.07,0-.14,0-.21v-1.89c4.97-.14,6.75-2.87,6.75-5.24Zm-2.25,0c0,1.19-.87,2.44-3.16,2.86,1.1-1.02,2.02-2.22,2.71-3.54.27.12.44.39.45.68ZM6.97,5.71c.21-.29.55-.46.91-.46h8.25c.36,0,.7.17.91.46.21.27.27.62.17.94-.61,1.98-1.73,3.76-3.25,5.16-1.23.91-1.95,2.35-1.95,3.88,0-1.53-.73-2.97-1.95-3.88-1.52-1.4-2.64-3.18-3.25-5.16-.1-.32-.03-.67.17-.94Zm-1.72,4.79c0-.3.18-.56.45-.68.7,1.32,1.62,2.52,2.72,3.54-2.3-.41-3.16-1.67-3.16-2.86Z', 'Tournament')}
        {createShortcutButton('scrimmage', 'm21,12c0,4.96-4.03,9-9,9S3,16.96,3,12,7.04,3,12,3c.14,0,.28,0,.43,0,.62.03,1.1.55,1.07,1.17,0,0,0,0,0,0-.03.62-.54,1.09-1.18,1.07-.1,0-.22,0-.32,0-3.72,0-6.75,3.03-6.75,6.75s3.03,6.75,6.75,6.75,6.75-3.03,6.75-6.75c0-.1,0-.22,0-.32-.03-.62.45-1.15,1.07-1.18,0,0,0,0,0,0,.64-.02,1.15.45,1.18,1.07,0,.14,0,.28,0,.43Zm-9.81-2.89c.6-.17.94-.79.78-1.39s-.79-.94-1.39-.78c-2.25.64-3.82,2.71-3.82,5.05,0,2.89,2.35,5.25,5.25,5.25,2.34,0,4.42-1.57,5.05-3.82.17-.6-.18-1.22-.78-1.39-.6-.17-1.22.18-1.39.78-.37,1.29-1.55,2.18-2.89,2.18-1.66,0-3-1.34-3-3,0-1.33.9-2.53,2.18-2.89h0Zm.02,2.09c-.44.43-.44,1.14,0,1.58,0,0,0,0,0,0,.22.22.51.33.79.33s.58-.11.79-.33l3.79-3.79h1.78c.3,0,.58-.12.79-.33l1.5-1.5c.44-.44.44-1.15,0-1.59-.21-.21-.5-.33-.8-.33h-1.12v-1.12c0-.46-.28-.86-.7-1.04-.42-.17-.91-.07-1.22.25l-1.5,1.5c-.21.21-.33.49-.33.79v1.78l-3.79,3.79h0Z', 'Scrimmage')}
      </div>
      <div className='hr-horizontal'></div>
      <div className="section">
        <div className="section-title">People</div>
        {createShortcutButton('chats', 'm12.01,21c-.45,0-.9-.16-1.26-.48l-2.7-2.3h-.93c-2.28,0-4.12-1.87-4.12-4.18v-6.85c0-2.31,1.85-4.18,4.12-4.18h9.75c2.27,0,4.13,1.88,4.13,4.18v6.85c0,2.31-1.85,4.18-4.13,4.18h-.88l-2.78,2.33c-.33.3-.76.46-1.2.46h0Zm-.24-2.21l-.02.02.02-.02Zm.44-.01h.01s-.01,0-.01,0ZM7.12,5.28c-1.04,0-1.87.85-1.87,1.9v6.85c0,1.05.84,1.9,1.87,1.9h1.34c.27,0,.52.1.72.27l2.81,2.4,2.87-2.41c.2-.17.46-.26.72-.26h1.28c1.03,0,1.88-.85,1.88-1.9v-6.85c0-1.05-.84-1.9-1.88-1.9H7.12Z', 'Chats')}
        {createShortcutButton('friends', 'm8.59,13.51c-3.2.29-5.63,2.99-5.59,6.2v.16c0,.62.5,1.12,1.12,1.12s1.12-.5,1.12-1.12v-.21c-.03-1.97,1.42-3.65,3.37-3.9,2.06-.2,3.9,1.3,4.11,3.37.01.12.02.24.02.37v.38c0,.62.5,1.12,1.12,1.12s1.12-.5,1.12-1.12v-.38c0-3.32-2.7-6-6.01-6-.13,0-.27,0-.4.01Zm.41-1.51c2.49,0,4.5-2.01,4.5-4.5s-2.01-4.5-4.5-4.5-4.5,2.01-4.5,4.5c0,2.48,2.02,4.5,4.5,4.5Zm0-6.75c1.24,0,2.25,1.01,2.25,2.25s-1.01,2.25-2.25,2.25-2.25-1.01-2.25-2.25,1.01-2.25,2.25-2.25Zm10.5,3.66c-.87.04-1.54.78-1.5,1.65.04-.87-.63-1.61-1.5-1.65-.87.04-1.54.78-1.5,1.65,0,1.3,1.69,2.82,2.54,3.49.27.22.66.22.93,0,.84-.67,2.54-2.2,2.54-3.49.04-.87-.63-1.61-1.5-1.65h0Z', 'Friends')}
        {createShortcutButton('teams', 'm16.12,9c1.66,0,3,1.34,3,3s-1.34,3-3,3-3-1.34-3-3,1.34-3,3-3Zm-4.12,0c1.66,0,3-1.34,3-3s-1.34-3-3-3-3,1.34-3,3,1.34,3,3,3Zm-4.12,6c1.66,0,3-1.34,3-3s-1.34-3-3-3-3,1.34-3,3,1.34,3,3,3Zm13.09,4.6c-.57-2.27-2.64-3.85-5.03-3.85-1.51,0-2.95.65-3.94,1.79-.99-1.14-2.43-1.79-3.94-1.79-2.39,0-4.45,1.58-5.03,3.85-.15.6.21,1.21.81,1.37.6.15,1.21-.21,1.37-.81h0c.17-.65.56-1.21,1.1-1.59l1.06,1.36c.3.38.86.44,1.24.14.05-.04.1-.09.14-.14l1.07-1.35c.53.38.92.94,1.08,1.58,0,0,.2.85,1.09.85s1.09-.84,1.09-.85c.17-.64.56-1.21,1.1-1.59l1.06,1.36c.3.38.86.44,1.24.14.05-.04.1-.09.14-.14l1.07-1.35c.53.38.92.94,1.08,1.58.15.6.76.97,1.37.81s.97-.76.81-1.37h0Z', 'Teams')}
        {createShortcutButton('clubs', 'm19,3H5c-1.1,0-2,.85-2,1.88v2.24c0,.69.4,1.3,1,1.62v10.15c0,.79.41,1.51,1.08,1.87.62.34,1.35.32,1.96-.06l4.92-3.19,5.01,3.19c.32.2.67.3,1.03.3.32,0,.63-.08.92-.24.67-.36,1.08-1.08,1.08-1.87v-10.15c.6-.32,1-.93,1-1.62v-2.24c0-1.03-.9-1.88-2-1.88Zm-1,15.89s-.01.07-.01.09l-4.95-3.16c-.64-.4-1.44-.4-2.08,0l-4.92,3.19s-.04-.03-.04-.12v-9.89h12v9.89Zm1-11.89H5v-2h14v2Z', 'Clubs')}
        {createShortcutButton('pages', 'm17.62,6h-3.04c-.19-1.7-1.62-2.99-3.34-3h-4.88c-1.86,0-3.37,1.51-3.38,3.38v13.5c0,.62.5,1.12,1.12,1.12s1.12-.5,1.12-1.12v-6.38h4.91c.19,1.7,1.62,2.99,3.34,3h4.12c1.86,0,3.37-1.51,3.38-3.38v-3.75c0-1.86-1.51-3.37-3.38-3.38Zm-12.38.38c0-.62.5-1.12,1.12-1.12h4.88c.62,0,1.12.5,1.12,1.12v3.75c0,.62-.5,1.12-1.12,1.12h-6v-4.88Zm13.5,6.75c0,.62-.5,1.12-1.12,1.12h-4.12c-.56,0-1.03-.41-1.11-.96,1.34-.48,2.23-1.74,2.23-3.16v-1.88h3c.62,0,1.12.5,1.12,1.12v3.75Z', 'Pages')}
      </div>
      <div className='hr-horizontal'></div>
      <div className="section">
        <div className="section-title">More</div>
        {createShortcutButton('settings', 'm4.3,16.45c.61,1.06,1.97,1.43,3.04.82h0s.33-.19.33-.19c.62.53,1.34.95,2.11,1.22v.38c0,1.23,1,2.22,2.22,2.22s2.22-1,2.22-2.22v-.38c.77-.27,1.49-.69,2.11-1.22l.33.19c1.06.61,2.42.25,3.04-.82.61-1.06.25-2.42-.82-3.04l-.33-.19c.15-.81.15-1.63,0-2.44l.33-.19c1.06-.61,1.43-1.97.82-3.04-.61-1.06-1.97-1.43-3.04-.82l-.33.19c-.62-.53-1.34-.94-2.11-1.22v-.38c0-1.23-1-2.22-2.22-2.22s-2.22,1-2.22,2.22v.38c-.77.27-1.49.69-2.11,1.22l-.33-.19c-1.06-.61-2.42-.25-3.04.82-.61,1.06-.25,2.42.82,3.04l.33.19c-.15.81-.15,1.63,0,2.44l-.33.19c-1.06.62-1.42,1.97-.81,3.04Zm7.7-7.41c1.64,0,2.96,1.33,2.96,2.96s-1.33,2.96-2.96,2.96-2.96-1.33-2.96-2.96,1.33-2.96,2.96-2.96h0Z', 'Settings')}
        {createShortcutButton('logout', 'm9.76,12.38c0,.62-.5,1.13-1.13,1.13-.62,0-1.13-.5-1.13-1.13h0c0-.62.5-1.13,1.13-1.13.62,0,1.13.5,1.13,1.13Zm6.75,5.25v1.5c0,1.03-.84,1.88-1.88,1.88H4.88c-1.04,0-1.87-.84-1.88-1.88V7.29c0-1.79,1.26-3.32,3.02-3.68l2.7-.54c.99-.2,2.02.06,2.8.7.26.21.46.47.65.73h.96c1.86,0,3.38,1.51,3.38,3.38v2.25c0,.62-.5,1.13-1.13,1.13s-1.13-.5-1.13-1.13v-2.25c0-.62-.5-1.13-1.13-1.13h-.38v12h1.5v-1.13c0-.62.5-1.13,1.13-1.13s1.13.5,1.13,1.13h0Zm-6-11.25c0-.62-.51-1.13-1.13-1.12-.07,0-.14,0-.21.02l-2.7.54c-.7.14-1.2.76-1.21,1.47v11.47h5.25V6.38h0Zm10.33,7.05l-1.84-1.99c-.37-.4-.99-.12-.99.45v.87h-2.63c-.62,0-1.13.5-1.13,1.13s.5,1.13,1.13,1.13h2.63v.87c0,.56.63.84.99.45l1.84-1.99c.23-.25.23-.64,0-.89h0Z', 'Logout')}

      </div>
      {/* <div className="shortcut-three">
        <div className="shortcut-button-create">Create</div>
        
      </div> */}
    </>
  );
}

export default Menu;
