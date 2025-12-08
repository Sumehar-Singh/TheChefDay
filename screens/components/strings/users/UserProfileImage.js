import React, { useState, useEffect } from 'react';
import { Image, View, ActivityIndicator } from 'react-native';
import axios from 'axios'; 
import { BASE_URL } from '../../../../config';


import localImage from '../../../../assets/DefaultImage.jpg';

const UserProfileImage = ({ userId, height = 100, width = 100,mr=0,ml=0 }) => {

 
  const [profileImage, setProfileImage] = useState('');
  const [loading, setLoading] = useState(true); 

  const getUserProfileImage = async (userId) => {
    try {
      const response = await axios.get(`${BASE_URL}users/strings/get_profileimage.php`, {
        params: { UserId: userId },
      });

      if (response.data.status === 'success') {
        const user = response.data.data;
       
        setProfileImage(user[0].Image); 
      } else {
        console.log('Error:', response.data.message);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false); 
    }
  };

  useEffect(() => {
    if (userId) {
      setLoading(true); 
      getUserProfileImage(userId);
    }
  }, [userId]);

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />; 
  }


  const imageSource = profileImage && profileImage.trim() !== '' ? { uri: profileImage } : localImage;

  return (
    <View>
      <Image
        source={imageSource}
        style={{ height: height, width: width, borderRadius: 50,marginRight:mr,marginLeft:ml }}
      />
    </View>
  );
};

export default UserProfileImage;
