import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import axios from 'axios';
import ScrollRestoration from './utils/scrollrestoration';
import Menu from './features/Shortcut/Menu';
import Complementary from './features/Complementary/Complementary';
import ContentHome from './features/Content/content-home';
import ContentNotifications from './features/Content/content-notifications';
import ContentTrends from './features/Content/content-trends';
import ContentTournament from './features/Content/content-tournament';
import ContentScrimmage from './features/Content/content-scrimmage';
import ContentChats from './features/Content/content-chats';
import ContentFriends from './features/Content/content-friends';
import ContentTeams from './features/Content/content-teams';
import ContentClubs from './features/Content/content-clubs';
import ContentPages from './features/Content/content-pages';
import ContentSettings from './features/Content/content-settings';
import Login from './features/Login/Login';
import ForgotPassword from './features/ForgotPassword/forgotpassword';
import CreateAccount from './features/CreateAccount/createaccount';
import Verification from './features/Verification/Verification';

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
                    <Menu setDropdownLabel={setDropdownLabel} />
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
                    <Complementary />
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
