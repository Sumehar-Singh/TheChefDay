import React, { useState, useEffect } from 'react';
import { Text } from 'react-native';
import axios from 'axios'; // Make sure to import axios
import { BASE_URL } from '../../../../config';

const UserFullName = ({ userId }) => {
  const [fullName, setFullName] = useState(''); // State to store full name

  const getUserFullName = async (userId) => {
    try {
      const response = await axios.get(`${BASE_URL}users/strings/get_fullname.php`, {
        params: { UserId: userId },
      });

      if (response.data.status === 'success') {
        const user = response.data.data;
        setFullName(
          [user[0].FirstName, user[0].MiddleName, user[0].LastName]
            .filter(Boolean)
            .join(' ')
        );
         // Update state with the full name
      } else {
        console.log('Error:', response.data.message);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  useEffect(() => {
    if (userId) {
      getUserFullName(userId); // Call the function when userId is available
    }
  }, [userId]); // Re-run the effect when userId changes

  return (
    <Text>{fullName || 'Loading...'}</Text> // Display full name or loading state
  );
};

export default UserFullName;
