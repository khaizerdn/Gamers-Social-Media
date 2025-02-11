// ProfileMenu.jsx
import React from 'react';
import './UserProfile.css';
import NavButton from '../../../components/NavButton';

const ProfileMenu = () => {
  return (
    <div className="userprofile-menu">
      <div className="section">
        <div className="section-title">khaizerdn</div>
        <div className="userprofile-bio"> Innovative coder & creative designer fueling smart, sleek digital solutions for every new challenge.
        </div>
      
        <NavButton
          to="/posts"
          iconPath="M3 5.5a1.5 1.5 0 1 1 3.001.001A1.5 1.5 0 0 1 3 5.5ZM8.5 7a1.5 1.5 0 1 0-.001-3.001A1.5 1.5 0 0 0 8.5 7ZM24 6v12c0 2.757-2.243 5-5 5H5c-2.757 0-5-2.243-5-5V6c0-2.757 2.243-5 5-5h14c2.757 0 5 2.243 5 5ZM2 6v2h20V6c0-1.654-1.346-3-3-3H5C3.346 3 2 4.346 2 6Zm12 4H2v4.5h12V10ZM5 21h9v-4.5H2V18c0 1.654 1.346 3 3 3Zm17-3v-8h-6v11h3c1.654 0 3-1.346 3-3Z"  // your SVG path data
          label="Posts"
          relative={true}
        />
        <NavButton
          to="/about"
          iconPath='<g><path d="M12 0a12 12 0 1 0 12 12A12.013 12.013 0 0 0 12 0Zm0 22a10 10 0 1 1 10-10 10.011 10.011 0 0 1-10 10Z"></path><path d="M12 10h-1a1 1 0 0 0 0 2h1v6a1 1 0 0 0 2 0v-6a2 2 0 0 0-2-2Z"></path><circle cx="12" cy="6.5" r="1.5"></circle></g>'
          label="About"
          relative={true}
        />
        <NavButton
          to="/photos"
          iconPath='<g><path d="M19 0H5a5.006 5.006 0 0 0-5 5v14a5.006 5.006 0 0 0 5 5h14a5.006 5.006 0 0 0 5-5V5a5.006 5.006 0 0 0-5-5ZM5 2h14a3 3 0 0 1 3 3v14a2.951 2.951 0 0 1-.3 1.285l-9.163-9.163a5 5 0 0 0-7.072 0L2 14.586V5a3 3 0 0 1 3-3Zm0 20a3 3 0 0 1-3-3v-1.586l4.878-4.878a3 3 0 0 1 4.244 0l9.163 9.164A2.951 2.951 0 0 1 19 22Z"></path><path d="M16 10.5A3.5 3.5 0 1 0 12.5 7a3.5 3.5 0 0 0 3.5 3.5Zm0-5A1.5 1.5 0 1 1 14.5 7 1.5 1.5 0 0 1 16 5.5Z"></path></g>'
          label="Photos"
          relative={true}
        />
        <NavButton
          to="/videos"
          iconPath='<g><path d="M19 24H5a5.006 5.006 0 0 1-5-5V5a5.006 5.006 0 0 1 5-5h14a5.006 5.006 0 0 1 5 5v14a5.006 5.006 0 0 1-5 5zM5 2a3 3 0 0 0-3 3v14a3 3 0 0 0 3 3h14a3 3 0 0 0 3-3V5a3 3 0 0 0-3-3zm4.342 15.005a2.368 2.368 0 0 1-1.186-.323 2.313 2.313 0 0 1-1.164-2.021V9.339a2.337 2.337 0 0 1 3.5-2.029l5.278 2.635a2.336 2.336 0 0 1 .049 4.084l-5.376 2.687a2.2 2.2 0 0 1-1.101.289zm-.025-8a.314.314 0 0 0-.157.042.327.327 0 0 0-.168.292v5.322a.337.337 0 0 0 .5.293l5.376-2.688a.314.314 0 0 0 .12-.266.325.325 0 0 0-.169-.292L9.545 9.073a.462.462 0 0 0-.228-.068z"></path></g>'
          label="Videos"
          relative={true}
        />
      </div>
    </div>
  );
};

export default ProfileMenu;
