// utils/useUserData.js
import { useState, useEffect } from 'react';

function useUserData() {
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    // Simulate an API call
    setTimeout(() => {
      setUserData({
        first_name: "Kaizer",
        last_name: "Noguera",
        username: "khaizerdn",
        about: {
          bio: "Hello! I'm a software engineer and avid gamer. Always up for co-op or competitive matches!",
          work: "Software Engineer at Epic Games",
          city: "Los Angeles",
          hometown: "San Francisco",
          school: "University of Gaming"
        },
        favoriteGames: [
          {
            name: "League of Legends",
            ign: "SummonerXYZ",
            icon: "https://brand.riotgames.com/static/a91000434ed683358004b85c95d43ce0/3591c/lol-logo.webp"
          },
          {
            name: "Valorant",
            ign: "Shooter123",
            icon: "https://img.icons8.com/?size=512&id=aUZxT3Erwill&format=png"
          },
          {
            name: "Overwatch",
            ign: "OW-8796",
            icon: "https://img.icons8.com/?size=512&id=63667&format=png"
          },
          // Duplicate entries for demonstration:
          {
            name: "Overwatch",
            ign: "OW-8796",
            icon: "https://img.icons8.com/?size=512&id=63667&format=png"
          },
          {
            name: "Overwatch",
            ign: "OW-8796",
            icon: "https://img.icons8.com/?size=512&id=63667&format=png"
          },
          {
            name: "Overwatch",
            ign: "OW-8796",
            icon: "https://img.icons8.com/?size=512&id=63667&format=png"
          },
          {
            name: "Overwatch",
            ign: "OW-8796",
            icon: "https://img.icons8.com/?size=512&id=63667&format=png"
          },
          {
            name: "Overwatch",
            ign: "OW-8796",
            icon: "https://img.icons8.com/?size=512&id=63667&format=png"
          }
        ]
      });
    }, 1000);
  }, []);

  return userData;
}

export default useUserData;
