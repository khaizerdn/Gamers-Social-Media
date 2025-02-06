import React, { useEffect, useState, useRef } from 'react';
import '../../App.css';
import '../../css/complementary/complementary-default.css';

const ContentHome = () => {
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const [dropdownLabel, setDropdownLabel] = useState(() => {
    return localStorage.getItem('dropdownLabel') || "For you";
  });
  const [content, setContent] = useState(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const savedScrollPositions = JSON.parse(sessionStorage.getItem('scrollPositions')) || {
      "For you": 0,
      "Following": 0,
      "Liked": 0,
      "Saved": 0,
    };

    // Restore scroll position for the current dropdown label
    window.scrollTo(0, savedScrollPositions[dropdownLabel]);

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    window.addEventListener('click', handleClickOutside);

    return () => {
      window.removeEventListener('click', handleClickOutside);
      // Save scroll position before unmounting
      saveScrollPosition();
    };
  }, [dropdownLabel]);

  useEffect(() => {
    // Update content based on the dropdownLabel
    switch (dropdownLabel) {
      case 'For you':
        setContent(<div><h2>For You Content</h2><p>This section is tailored just for you!</p></div>);
        break;
      case 'Following':
        setContent(<div><h2>Following Content</h2><p>See updates from users you follow.</p></div>);
        break;
      case 'Liked':
        setContent(<div><h2>Liked Content</h2><p>Here are the posts you liked.</p></div>);
        break;
      case 'Saved':
        setContent(<div><h2>Saved Content</h2><p>Access your saved posts here.</p></div>);
        break;
      default:
        setContent(<div><h2>For You Content</h2><p>This section is tailored just for you!</p></div>);
    }

    // Save the selected dropdown label to localStorage
    localStorage.setItem('dropdownLabel', dropdownLabel);
  }, [dropdownLabel]);

  const saveScrollPosition = () => {
    // Save the current scroll position of the current dropdown label
    const savedScrollPositions = JSON.parse(sessionStorage.getItem('scrollPositions')) || {};
    savedScrollPositions[dropdownLabel] = window.pageYOffset || document.documentElement.scrollTop;
    sessionStorage.setItem('scrollPositions', JSON.stringify(savedScrollPositions));
  };

  const toggleDropdown = () => {
    setDropdownOpen(!isDropdownOpen);
  };

  const handleItemClick = (itemLabel) => {
    // Save the scroll position before changing the dropdown label
    saveScrollPosition();

    // Set the new dropdown label
    setDropdownLabel(itemLabel);
    setDropdownOpen(false);
  };

  return (
    <>
      <div className="content-menu">
        <div className="dropdown" ref={dropdownRef}>
          <button
            className={`dropdown-button ${isDropdownOpen ? 'open' : ''}`}
            onClick={toggleDropdown}
          >
            {dropdownLabel}
          </button>
          {isDropdownOpen && (
            <div className="dropdown-content">
              <button className="dropdown-item" onClick={() => handleItemClick('For you')}>For you</button>
              <button className="dropdown-item" onClick={() => handleItemClick('Following')}>Following</button>
              <button className="dropdown-item" onClick={() => handleItemClick('Liked')}>Liked</button>
              <button className="dropdown-item" onClick={() => handleItemClick('Saved')}>Saved</button>
            </div>
          )}
        </div>
        <div className="content-menu-button-create" role="button" tabIndex="0">Create</div>
      </div>

      <div className="content-display">
        {content}
      </div>
    </>
  );
};

export default ContentHome;
