import AsyncStorage from '@react-native-async-storage/async-storage';


export const storeChefId = async (chefId) => {
    try {
      // Get stored chefIds from AsyncStorage
      const storedChefIds = await AsyncStorage.getItem('chefIds');
      const chefIdsArray = storedChefIds ? JSON.parse(storedChefIds) : [];
  
      // Check if chefId is already in the list
      if (!chefIdsArray.includes(chefId)) {
        
        // If there are already 10 items, remove the oldest (first item)
        if (chefIdsArray.length >= 15) {
          chefIdsArray.shift(); // Remove the oldest item (first item)
        }
  
        // Add the new chefId to the array
        chefIdsArray.push(chefId);
  
        // Save the updated array back to AsyncStorage
        await AsyncStorage.setItem('chefIds', JSON.stringify(chefIdsArray));
      } else {
        console.log('ChefId is already in storage');
      }
    } catch (error) {
      console.error('Error storing ChefId:', error);
    }
  };
  


export const getStoredChefIds = async () => {
  try {
    //AsyncStorage.removeItem('chefIds');
    const storedChefIds = await AsyncStorage.getItem('chefIds');
    return storedChefIds ? JSON.parse(storedChefIds) : [];
  } catch (error) {
    console.error('Error retrieving ChefIds:', error);
    return [];
  }
};
export const formatDate = (dateString) => {
  const date = new Date(dateString);
  const options = { day: '2-digit', month: 'short', year: 'numeric' };
  return date.toLocaleDateString('en-GB', options).replace(',', '');
};



export const getEventDayLabel = (eventDateString) => {
  const eventDate = new Date(eventDateString);
  const today = new Date();

  // Zero out time part for accurate comparison
  eventDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  const diffTime = eventDate.getTime() - today.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays == -1) return `${Math.abs(diffDays)} day ago`;
  if (diffDays < 0) return `${Math.abs(diffDays)} days ago`;
  return `In ${diffDays} days`;
};

export const storeUserCoords = async (lat, lon) => {
  try {
    const coords = { lat, lon };
    await AsyncStorage.setItem('userCoords', JSON.stringify(coords));
    console.log('Coordinates stored successfully');
  } catch (e) {
    console.error('Failed to save coordinates', e);
  }
};

export const getUserCoords = async () => {
  try {
    const stored = await AsyncStorage.getItem('userCoords');
    if (stored !== null) {
      return JSON.parse(stored); // returns { lat: ..., lon: ... }
    }
  } catch (e) {
    console.error('Failed to load coordinates', e);
  }
  return null;
};
