import axios from 'axios';

import {BASE_URL} from '../../config';

export const ChefPropertiesForProfile = async (chefId) => {
  
  try {
    const response = await axios.post(`${BASE_URL}chefs/get_chef_properties_for_profile.php`, {
      ChefID: chefId
    });

    if (response.data.success) {
      return response.data.data; // This is an array of properties
    } else {
      console.error('API error:', response.data.message);
      return []; // return empty array if API responds with failure
    }
  } catch (error) {
    console.error('Network/API oijoijojerror:', error);
    return []; // return empty array on error
  }
};
