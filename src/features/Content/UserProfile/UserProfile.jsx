import React, { lazy, Suspense, useState, useEffect } from 'react';
import useUserData from './useUserData';
import './UserProfile.css';

const ProfileMenu = lazy(() => import('./ProfileMenu'));
const ProfileContent = lazy(() => import('./ProfileContent'));

const API_URL = import.meta.env.VITE_API_URL;

const CopyButton = ({ text }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <button className="copy-btn" onClick={handleCopy} title="Copy">
      {copied ? (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
          <path d="M13.485 1.929a.75.75 0 0 1 1.06 1.06l-8 8a.75.75 0 0 1-1.06 0l-4-4a.75.75 0 0 1 1.06-1.06L6 9.439l7.485-7.51z" />
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
          <path d="M10 1H2a1 1 0 0 0-1 1v10h1V2h8V1z" />
          <path d="M14 4H6a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1zm-1 10H7V6h6v8z" />
        </svg>
      )}
    </button>
  );
};

const UserProfile = () => {
  const userData = useUserData();
  const [aboutExpanded, setAboutExpanded] = useState(false);
  const [gamesExpanded, setGamesExpanded] = useState(false);
  const [profilePhotoUrl, setProfilePhotoUrl] = useState('/default-profile.png');

  useEffect(() => {
    async function fetchProfilePhoto() {
      try {
        const response = await fetch(`${API_URL}/api/getProfilePhoto`, {
          method: 'GET',
          credentials: 'include',
        });
        const data = await response.json();
        if (data.imageUrl) {
          setProfilePhotoUrl(data.imageUrl);
        }
      } catch (error) {
        console.error("Error fetching profile photo:", error);
      }
    }
    fetchProfilePhoto();
  }, []);

  if (!userData) {
    return <div>Loading user data...</div>;
  }

  const { first_name, last_name, username, about, favoriteGames } = userData;

  const handleProfilePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('profilePhoto', file);

    try {
      const response = await fetch(`${API_URL}/api/uploadProfilePhoto`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      const data = await response.json();
      setProfilePhotoUrl(data.imageUrl);
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };

  // Inline SVG icons for About Me fields (unchanged)
  const labelIcons = {
    bio: (
      <svg xmlns="http://www.w3.org/2000/svg" className="nav-icon" width="24" height="24" viewBox="0 0 16 16" fill="currentColor">
        <circle cx="8" cy="8" r="7" stroke="currentColor" fill="none" />
        <text x="8" y="12" textAnchor="middle" fill="currentColor" fontSize="10" fontFamily="Arial">i</text>
      </svg>
    ),
    work: (
      <svg xmlns="http://www.w3.org/2000/svg" className="nav-icon" width="24" height="24" viewBox="0 0 16 16" fill="currentColor">
        <rect x="1" y="4" width="14" height="10" rx="2" />
        <rect x="4" y="2" width="8" height="4" />
      </svg>
    ),
    city: (
      <svg xmlns="http://www.w3.org/2000/svg" className="nav-icon" width="24" height="24" viewBox="0 0 16 16" fill="currentColor">
        <rect x="2" y="4" width="3" height="10" />
        <rect x="7" y="2" width="3" height="12" />
        <rect x="12" y="6" width="2" height="8" />
      </svg>
    ),
    hometown: (
      <svg xmlns="http://www.w3.org/2000/svg" className="nav-icon" width="24" height="24" viewBox="0 0 16 16" fill="currentColor">
        <path d="M8 0C5.24 0 3 2.24 3 5c0 4.25 5 11 5 11s5-6.75 5-11c0-2.76-2.24-5-5-5zm0 7.5C6.62 7.5 5.5 6.38 5.5 5S6.62 2.5 8 2.5 10.5 3.62 10.5 5 9.38 7.5 8 7.5z" />
      </svg>
    ),
    school: (
      <svg xmlns="http://www.w3.org/2000/svg" className="nav-icon" width="24" height="24" viewBox="0 0 16 16" fill="currentColor">
        <path d="M8 0L0 4l8 4 8-4L8 0zM2 6.5v3.5c0 1.5 1.5 2 3 2 1.25 0 2.5-.5 2.5-1.5S8.75 10 10 10c1.5 0 3-.5 3-2V6.5L8 9 2 6.5z" />
      </svg>
    ),
  };

  return (
    <div className="userprofile">
      {/* Cover Photo + Basic Info */}
      <div className="userprofile-coverphoto">
        <div className="userprofile-innercontainer">
          <div className="userprofile-profilephoto-wrapper">
            <div className="userprofile-profilephoto">
              <img src={profilePhotoUrl} alt="Profile" className="profile-photo" />
            </div>
            {/* Hidden file input */}
            <input
              type="file"
              id="uploadProfilePhotoInput"
              style={{ display: 'none' }}
              accept="image/*"
              onChange={handleProfilePhotoUpload}
            />
            {/* Overlay SVG Upload Button */}
            <button
              className="upload-photo-btn"
              onClick={() => document.getElementById('uploadProfilePhotoInput').click()}
              aria-label="Upload profile photo"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 8a4 4 0 100 8 4 4 0 000-8zm0 1.5a2.5 2.5 0 110 5 2.5 2.5 0 010-5z" />
                <path d="M20 5h-3.17l-1.83-2H9.99L8.17 5H5c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h15c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 14H5V7h3.99l1.83-2h4.36l1.83 2H20v12z" />
              </svg>
            </button>
          </div>

          {/* Re-added Profile Info */}
          <div className="userprofile-info">
            <div className="userprofile-firstandlast">
              {first_name} {last_name}
            </div>
            <div className="userprofile-username">
              @{username}
            </div>
          </div>
        </div>
      </div>

      {/* About Me & Favorite Games Section */}
      <div className="userprofile-info-section">
        {/* ABOUT ME */}
        <div className="userprofile-aboutme">
          <div className="container-title">About Me</div>
          <div className={`collapsible-container ${aboutExpanded ? 'expanded' : ''}`}>
            {about ? (
              <div className="aboutme-cards">
                {about.bio && (
                  <div className="aboutme-card">
                    <span className="aboutme-label">{labelIcons.bio}</span>
                    <span className="aboutme-data">{about.bio}</span>
                  </div>
                )}
                {about.work && (
                  <div className="aboutme-card">
                    <span className="aboutme-label">{labelIcons.work}</span>
                    <span className="aboutme-data">{about.work}</span>
                  </div>
                )}
                {about.city && (
                  <div className="aboutme-card">
                    <span className="aboutme-label">{labelIcons.city}</span>
                    <span className="aboutme-data">{about.city}</span>
                  </div>
                )}
                {about.hometown && (
                  <div className="aboutme-card">
                    <span className="aboutme-label">{labelIcons.hometown}</span>
                    <span className="aboutme-data">{about.hometown}</span>
                  </div>
                )}
                {about.school && (
                  <div className="aboutme-card">
                    <span className="aboutme-label">{labelIcons.school}</span>
                    <span className="aboutme-data">{about.school}</span>
                  </div>
                )}
              </div>
            ) : (
              <p>No information provided.</p>
            )}
          </div>
          <button className="see-more-btn" onClick={() => setAboutExpanded(!aboutExpanded)}>
            {aboutExpanded ? 'See Less' : 'See More'}
          </button>
        </div>

        {/* FAVORITE GAMES */}
        <div className="userprofile-favoritegames">
          <div className="container-title">Favorite Games</div>
          <div className={`collapsible-container ${gamesExpanded ? 'expanded' : ''}`}>
            {favoriteGames && favoriteGames.length > 0 ? (
              <ul className="favoritegames-list">
                {favoriteGames.map((game, index) => (
                  <li key={index} className="favoritegames-item">
                    {game.icon && (
                      <img src={game.icon} alt={game.name} className="favoritegames-icon" />
                    )}
                    <div className="favoritegames-details">
                      <div className="favoritegames-name">{game.name}</div>
                      {game.ign && (
                        <div className="favoritegames-ign">
                          <span className="ign-text">{game.ign}</span>
                        </div>
                      )}
                      {game.userId && (
                        <div className="favoritegames-ign">
                          <span className="ign-text">{game.userId}</span>
                        </div>
                      )}
                    </div>
                    <CopyButton text={game.ign || game.userId} />
                  </li>
                ))}
              </ul>
            ) : (
              <p>No favorite games available.</p>
            )}
          </div>
          <button className="see-more-btn" onClick={() => setGamesExpanded(!gamesExpanded)}>
            {gamesExpanded ? 'See Less' : 'See More'}
          </button>
        </div>
      </div>

      {/* Horizontal Menu */}
      <Suspense fallback={<div>Loading menu...</div>}>
        <ProfileMenu />
      </Suspense>

      {/* Main Content */}
      <div className="userprofile-main">
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
