import React from 'react';
import { View, ActivityIndicator, StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');
const isTablet = width > 600;

const CenterLoading = () => {
  return (
    <View style={styles.container}>
      <ActivityIndicator 
        size={isTablet ? "large" : "small"} 
        color="#805500" 
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
  },
});

export default CenterLoading; 