import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import axios from './backend/node_modules/axios';
import ScrollRestoration from './utils/scrollrestoration';
import ShortcutDefault from './jsx/shortcut/shortcut-default';
import ComplementaryDefault from './jsx/complementary/complementary-default';
import ContentHome from './jsx/content/content-home';
import ContentNotifications from './jsx/content/content-notifications';
import ContentTrends from './jsx/content/content-trends';
import ContentTournament from './jsx/content/content-tournament';
import ContentScrimmage from './jsx/content/content-scrimmage';
import ContentChats from './jsx/content/content-chats';
import ContentFriends from './jsx/content/content-friends';
import ContentTeams from './jsx/content/content-teams';
import ContentClubs from './jsx/content/content-clubs';
import ContentPages from './jsx/content/content-pages';
import ContentSettings from './jsx/content/content-settings';
import Login from './jsx/access/login';
import ForgotPassword from './jsx/access/forgotpassword';
import CreateAccount from './jsx/access/createaccount';
import Verification from './jsx/access/verification';

// Utility function to check if the user is logged in by calling the backend
const checkLoginStatus = async () => {
  try {
    const response = await axios.post(
      "http://localhost:8081/verify-refresh-token", // Adjust the backend URL
      {}, // No need to send data, just checking the refresh token
      { withCredentials: true } // Ensures cookies are sent with the request
    );

    if (response.status === 200) {
      return true; // Valid refresh token
    }
    return false; // Invalid refresh token or failed validation
  } catch (error) {
    console.error("Error checking login status:", error);
    return false; // If any error occurs (e.g., network issue or invalid token)
  }
};

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [content, setContent] = useState(<div><h2>For You Content</h2><p>This section is tailored just for you!</p></div>);
  const [dropdownLabel, setDropdownLabel] = useState(() => localStorage.getItem('dropdownLabel') || "For you");

  useEffect(() => {
    // Check if the user is logged in by verifying the refresh token
    const checkUserLogin = async () => {
      const isUserLoggedIn = await checkLoginStatus();
      setIsLoggedIn(isUserLoggedIn);
    };

    checkUserLogin(); // Run the check when the app loads
  }, []);

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const ProtectedRoute = ({ children }) => {
    return isLoggedIn ? children : <Navigate to="/" />;
  };

  return (
    <Router>
      <ScrollRestoration />
      <Routes>
        {!isLoggedIn ? (
          <>
            <Route path="*" element={<Navigate to="/" />} />
            <Route path="/" element={<Login setIsLoggedIn={handleLogin} />} />
            <Route path="/forgotpassword" element={<ForgotPassword />} />
            <Route path="/createaccount" element={<CreateAccount />} />
            <Route path="/verification" element={<Verification />} />
            <Route path="/reset-password" element={<Verification />} />
          </>
        ) : (
          <Route path="*" element={
            <ProtectedRoute>
              <div className="container">
                <div className="container-shortcut">
                  <div className="shortcut">
                    <ShortcutDefault setDropdownLabel={setDropdownLabel} />
                  </div>
                </div>
                
                <div className="container-content">
                  <div className="content">
                    <Routes>
                      <Route path="*" element={<Navigate to="/" />} />
                      <Route path="/" element={<ContentHome content={content} setContent={setContent} dropdownLabel={dropdownLabel} setDropdownLabel={setDropdownLabel} />} />
                      <Route path="/notifications" element={<ContentNotifications />} />
                      <Route path="/trends" element={<ContentTrends />} />
                      <Route path="/tournament" element={<ContentTournament />} />
                      <Route path="/scrimmage" element={<ContentScrimmage />} />
                      <Route path="/chats" element={<ContentChats />} />
                      <Route path="/friends" element={<ContentFriends />} />
                      <Route path="/teams" element={<ContentTeams />} />
                      <Route path="/clubs" element={<ContentClubs />} />
                      <Route path="/pages" element={<ContentPages />} />
                      <Route path="/settings" element={<ContentSettings />} />
                    </Routes>
                  </div>
                </div>
                
                <div className="container-complementary">
                  <div className="complementary">
                    <ComplementaryDefault />
                  </div>
                </div>
              </div>
            </ProtectedRoute>
          } />
        )}
      </Routes>
    </Router>
  );
}

export default App;
