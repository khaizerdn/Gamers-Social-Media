// NavButton.jsx
import React from 'react';
import PropTypes from 'prop-types';
import { useNavigate, useLocation } from 'react-router-dom';

const NavButton = ({
  to,
  iconPath,
  label,
  extraClassName = '',
  onClick = null,
  relative = false,
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  let isSelected = false;
  let targetPath = to;

  if (relative) {
    // Get the base from the URL's username (assumes URL like "/username/...")
    const pathSegments = location.pathname.split('/');
    const basePath = `/${pathSegments[1]}`;
    const relativePart = to.replace(/^\//, '');
    targetPath = `${basePath}/${relativePart}`;

    // Check if the third segment matches the new sub-route.
    const currentSubPath = pathSegments[2] || '';
    isSelected = currentSubPath === relativePart;
  } else {
    isSelected = location.pathname === to;
  }

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      navigate(relative ? targetPath : to);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  // Render the icon.
  // If the iconPath string starts with "<", we assume it contains full SVG markup.
  // Otherwise, we assume it's simple path data.
  const renderIcon = () => {
    const trimmed = iconPath.trim();
    if (trimmed.startsWith('<')) {
      return <g dangerouslySetInnerHTML={{ __html: iconPath }} />;
    } else {
      return <path d={iconPath} />;
    }
  };

  return (
    <div
      role="button"
      tabIndex="0"
      className={`button-default ${isSelected ? 'selected' : ''} ${extraClassName}`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      <div className="button-logo-container">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="button-logo"
          width="24"
          height="24"
          viewBox="0 0 24 24"
        >
          {renderIcon()}
        </svg>
      </div>
      <div className="button-text">{label}</div>
    </div>
  );
};

NavButton.propTypes = {
  to: PropTypes.string.isRequired,
  iconPath: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  extraClassName: PropTypes.string,
  onClick: PropTypes.func,
  relative: PropTypes.bool,
};

export default NavButton;
