import React, { createContext, useState, useEffect } from "react";
import axios from "axios";

const baseURL = import.meta.env.VITE_BASE_URL;

// eslint-disable-next-line react-refresh/only-export-components
export const ProfileContext = createContext();

/**
 * ProfileContextProvider
 * Manages global state for the authenticated user's profile data.
 * Fetches the data on mount and provides it to the entire application.
 *
 * @param {Object} props.children - React children components wrapped by this provider.
 */
export default function ProfileContextProvider({ children }) {
  // --- Global Profile States ---
  const [profileData, setProfileData] = useState(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [profileError, setProfileError] = useState(null);

  /**
   * Fetches the logged-in user's profile data from the API.
   * Requires a valid Bearer token in localStorage.
   */
  const getUserProfile = async () => {
    const token = localStorage.getItem("userToken");

    // Abort fetch if the user is not authenticated
    if (!token) return;

    try {
      setIsLoadingProfile(true);
      setProfileError(null);

      const { data } = await axios.get(`${baseURL}/users/profile-data`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Safely extract the user object from the API response
      const extractedUser = data?.data?.user || data?.user || data;
      setProfileData(extractedUser);
      
    } catch (error) {
      console.error("Error fetching profile:", error);
      setProfileError("Failed to load profile data.");
    } finally {
      setIsLoadingProfile(false);
    }
  };

  // Fetch profile data automatically when the application loads
  useEffect(() => {
    getUserProfile();
  }, []);

  return (
    <ProfileContext.Provider
      value={{
        profileData,
        isLoadingProfile,
        profileError,
        getUserProfile, // Exposed to allow manual refetching (e.g., after avatar/name update)
        setProfileData, // Exposed to allow clearing data on logout
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
}