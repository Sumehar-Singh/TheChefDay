import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppRegistry } from 'react-native';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [appUser, setAppUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user from localStorage when app starts
  useEffect(() => {
    const loadUser = async () => {
      try {
        const appUserData = await AsyncStorage.getItem('appUser');
        const profileData = await AsyncStorage.getItem('profile');

        if (appUserData && profileData) {
          const parsedAppUser = JSON.parse(appUserData);
          const parsedProfile = JSON.parse(profileData);

          setAppUser(parsedAppUser);
          setProfile(parsedProfile);
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadUser();
  }, []);

  // Helper function to handle navigation logic
  const handleUserNavigation = async (appUserData, profileData, navigation) => {
    const { storeUserCoords } = await import('../../screens/components/utils');

    // Admin 1, User 2 and Chef 3
    if (appUserData.RoleId == 3) {
      // Reset navigation stack to prevent back navigation to login
      navigation.reset({
        index: 0,
        routes: [{ name: 'ChefDashboard' }],
      });
    } else if (appUserData.RoleId == 2) {
      if (profileData.Lat) {
        storeUserCoords(profileData.Lat, profileData.Lon);
      } else {
        // Remove userCoords if no Lat/Lon
        try {
          await AsyncStorage.removeItem("userCoords");
        } catch (error) {
          console.error('Error removing userCoords:', error);
        }
      }
      // Reset navigation stack to prevent back navigation to login
      navigation.reset({
        index: 0,
        routes: [{ name: 'UserDashboard' }],
      });
    } else {
      console.log("You are an admin");
      // Handle admin navigation if needed
    }
  };

  const login = async (appUserData, profileData, navigation = null) => {
    setAppUser(appUserData);
    setProfile(profileData);
    await AsyncStorage.setItem('appUser', JSON.stringify(appUserData));
    await AsyncStorage.setItem('profile', JSON.stringify(profileData));

    // Handle navigation if provided
    if (navigation) {
      await handleUserNavigation(appUserData, profileData, navigation);
    }
  };

  const logout = async (navigation = null, fromScreen = null) => {
    setAppUser(null);
    setProfile(null);
    await AsyncStorage.removeItem('appUser');
    await AsyncStorage.removeItem('profile');

    // Navigate to Home screen with pop-like animation (Left to Right)
    if (navigation) {
      if (fromScreen) {
        // Trick: Reset stack to [Home, CurrentScreen] then go back
        // This forces the native "pop" animation
        navigation.reset({
          index: 1,
          routes: [{ name: 'Home' }, { name: fromScreen }],
        });
        // Small delay to ensure reset is processed before popping
        setTimeout(() => navigation.goBack(), 0);
      } else {
        // Fallback if screen name not provided
        navigation.reset({
          index: 0,
          routes: [{ name: 'Home' }],
        });
      }
    }
  };

  return (
    <AuthContext.Provider value={{
      appUser,
      profile,
      isLoading,
      login,
      logout,
      handleUserNavigation
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
