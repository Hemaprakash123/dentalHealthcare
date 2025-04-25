import React, { useState,useEffect } from "react";
import logo from "../../assets/bg.png";
import { useNavigate } from "react-router-dom";

import io from "socket.io-client";

const socket = io("http://localhost:5002");
const socket1 = io("http://localhost:5003");


const Navbar = ({ isDoctor }) => {
  const navigate = useNavigate();
  const [showNotification, setShowNotification] = useState(false);
  const [hasNotification, setHasNotification] = useState(false);
  const [notificationMessages, setNotificationMessages] = useState([]);
  const [notificationHeadingMessage, setNotificationHeadingMessage] = useState("");
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    // Request notification permission
    if (Notification?.permission === "default") {
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          console.log("Notification permission granted");
        } else {
          console.log("Notification permission denied");
        }
      });
    }

    // Handle notifications from the server
    socket.on("pushNotification", (data) => {
      console.log("Received notification:", data);

      if (Notification?.permission === "granted") {
        new Notification(data.heading || "Notification", {
          body: data.message,
          icon: "https://via.placeholder.com/50",
        });
      }
      console.log(data.patientId);
      setNotificationHeadingMessage("Report Verified!");

      setNotificationMessages((prev) => [...prev, `Your report has been verified by ${data.specilization}`]);

      setHasNotification(true);
      setShowNotification(true);

      // Hide notification popup after 5 seconds
      setTimeout(() => setShowNotification(false), 5000);
    });

    // Clean up the socket listener
    return () => {
      socket.off("pushNotification");
    };
  }, []);

  useEffect(() => {
    // Request notification permission
    if (Notification?.permission === "default") {
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          console.log("Notification permission granted");
        } else {
          console.log("Notification permission denied");
        }
      });
    }

    // Handle notifications from the server
    socket1.on("pushNotification", (data) => {
      console.log("Received notification:", data);

      if (Notification?.permission === "granted") {
        new Notification(data.heading || "Notification", {
          body: data.message,
          icon: "https://via.placeholder.com/50",
        });
      }
      console.log(data.patientId);
      setNotificationHeadingMessage("New Report!");
      setNotificationMessages((prev) => [...prev, `A new report of ${data.patientId} needs to be verified`]);
      setHasNotification(true);
      setShowNotification(true);

      setTimeout(() => setShowNotification(false), 3000);
    });

    // Clean up the socket listener
    return () => {
      socket1.off("pushNotification");
    };
  }, []);

  const handleBellClick = () => {
    setShowNotification((prev) => !prev);
  };
  const handleLogout = () => {
    navigate('/');
  };

  const handleForumClick = () => {
    navigate('/Forum');  // Add this route in your router
  };

  return (
    <div className="relative flex items-center justify-between whitespace-nowrap border-b border-solid border-b-[#e7eef4] px-10 py-3">
      <div className="flex items-center">
        <button 
          className="flex items-center text-[#0d151c] text-lg font-bold leading-tight tracking-[-0.015em]" 
          onClick={() => navigate("/")}
        >
          <img src={logo} alt="logo" className="h-7 w-7 mr-2"/>
          Saanjh Sahayak
        </button>
      </div>

      <div className="flex flex-1 justify-end gap-8">
        <button
          onClick={handleForumClick}
          className="flex items-center justify-center px-4 py-2 rounded-xl bg-[#e7eef4] text-[#0d151c] font-bold text-sm hover:bg-[#d8e3ed] transition-colors"
        >
          <div className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" fill="currentColor" viewBox="0 0 256 256">
              <path d="M216,40H40A16,16,0,0,0,24,56V184a16,16,0,0,0,16,16H57.1l-1.77,13.3a16,16,0,0,0,4.41,13.31A15.93,15.93,0,0,0,71.87,232,16.4,16.4,0,0,0,74,231.81l43.48-15.49h98.56A16,16,0,0,0,232,200V56A16,16,0,0,0,216,40ZM40,56H216V184H112.79a16,16,0,0,0-5.41.94L72,197.34l1.87-14a16,16,0,0,0-16-17.31H40ZM80,144a12,12,0,1,1,12-12A12,12,0,0,1,80,144Zm48,0a12,12,0,1,1,12-12A12,12,0,0,1,128,144Zm48,0a12,12,0,1,1,12-12A12,12,0,0,1,176,144Z"/>
            </svg>
            Health Forum
          </div>
        </button>
        
        <div className="flex items-center gap-2">
          <button
            className="flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 bg-[#e7eef4] text-[#0d151c] gap-2 text-sm font-bold leading-normal tracking-[0.015em] min-w-0 px-2.5"
          >
            <div className="text-[#0d151c]" data-icon="ChatCircleDots" data-size="20px" data-weight="regular">
              <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" fill="currentColor" viewBox="0 0 256 256">
                <path d="M140,128a12,12,0,1,1-12-12A12,12,0,0,1,140,128ZM84,116a12,12,0,1,0,12,12A12,12,0,0,0,84,116Zm88,0a12,12,0,1,0,12,12A12,12,0,0,0,172,116Zm60,12A104,104,0,0,1,79.12,219.82L45.07,231.17a16,16,0,0,1-20.24-20.24l11.35-34.05A104,104,0,1,1,232,128Zm-16,0A88,88,0,1,0,51.81,172.06a8,8,0,0,1,.66,6.54L40,216,77.4,203.53a7.85,7.85,0,0,1,2.53-.42,8,8,0,0,1,4,1.08A88,88,0,0,0,216,128Z"></path>
              </svg>
            </div>
          </button>
          <button
            className="flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 bg-[#e7eef4] text-[#0d151c] gap-2 text-sm font-bold leading-normal tracking-[0.015em] min-w-0 px-2.5 relative"
            onClick={handleBellClick}
          >
            <div className="text-[#0d151c]" data-icon="Bell" data-size="20px" data-weight="regular">
              <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" fill="currentColor" viewBox="0 0 256 256">
                <path d="M221.8,175.94C216.25,166.38,208,139.33,208,104a80,80,0,1,0-160,0c0,35.34-8.26,62.38-13.81,71.94A16,16,0,0,0,48,200H88.81a40,40,0,0,0,78.38,0H208a16,16,0,0,0,13.8-24.06ZM128,216a24,24,0,0,1-22.62-16h45.24A24,24,0,0,1,128,216ZM48,184c7.7-13.24,16-43.92,16-80a64,64,0,1,1,128,0c0,36.05,8.28,66.73,16,80Z"></path>
              </svg>
            </div>
            {hasNotification && (
              <div className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></div>
            )}
          </button>
        </div>
        <div className="flex items-center justify-center gap-2">
          <div className="text-[#0d151c] font-medium text-sm leading-normal">
            {isDoctor ? 'Doctor' : 'Care taker'}
          </div>
        </div>
        <div 
          className="relative"
          onClick={() => setIsHovered(!isHovered)}
        >
          <div 
            className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10"
            style={{ backgroundImage: 'url("https://cdn.usegalileo.ai/stability/62891830-57f4-4b6d-ab96-97aa59242b87.png")' }}
          ></div>

          {isHovered && (
            <div style={{ position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)', marginTop: '10px' }}>
              <button 
                onClick={handleLogout} 
                className="logout-button"
                style={{ backgroundColor: 'gray', padding: '5px 10px', borderRadius: '5px' }}
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>

      {showNotification && (
        <div className="absolute top-16 right-10 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-50">
          <p className="text-sm font-medium text-gray-900">{notificationHeadingMessage}</p>
          {notificationMessages.map((notification) => {
            return <p key={notification} className="text-sm text-gray-500 mt-1">{notification}</p>;
          })}
        </div>
      )}

    </div>
  );
};

export default Navbar;