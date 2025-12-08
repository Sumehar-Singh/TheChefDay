// BlueTick.js
import React from 'react';
import { Image, StyleSheet } from 'react-native';

const BlueTick = ({ style }) => {
  return (
    <Image
      source={require('../../assets/BlueTick.png')} // Path to your BlueTick.png
      style={[styles.tick, style]} // Custom styles can be applied here
    />
  );
};

const styles = StyleSheet.create({
  tick: {
    width: 18,  // Adjust the size of the tick icon as per your design
    height: 18, // Adjust the size of the tick icon as per your design
    resizeMode: 'contain',
  },
});

export default BlueTick;
