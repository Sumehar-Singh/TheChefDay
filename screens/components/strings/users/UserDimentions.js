// getUserDimentions.js
import axios from 'axios';
import { BASE_URL } from '../../../../config';

const getUserDimentions = async (userID) => {
  console.log(userID);
    try {
      const response = await axios.get(`${BASE_URL}users/strings/get_user_dimentions.php`, {
        params: { UserID: userID }
      });
  
      if (response.data.status === 'success') {
        const { Lat, Lon } = response.data.data;
  
        // Check if Lat or Lon is missing, null, or empty
        if (!Lat || !Lon) {
          return null;
        }
  
        return { lat: parseFloat(Lat), lon: parseFloat(Lon) };
      } else {
        throw new Error(response.data.message || 'Unknown error');
      }
    } catch (err) {
      console.error('Failed to get dimensions:', err);
      return null;
    }
  };
  

export default getUserDimentions;
