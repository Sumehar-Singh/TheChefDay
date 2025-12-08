import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');
const isTablet = width > 600;

const CustomButton = ({
  onPress,
  title,
  isLoading = false,
  type = 'primary', // Default type is 'primary'
  style,
}) => {
  // Map the button type to the corresponding styles
  const buttonStyles = styles[type] ? styles[type].button : styles.primary.button;
  const buttonTextStyles = styles[type] ? styles[type].text : styles.primary.text;

  return (
    <TouchableOpacity
      style={[buttonStyles, style]} // Merge default styles with custom styles
      onPress={onPress}
      disabled={isLoading}
    >
      {isLoading ? (
        <ActivityIndicator size="small" color="#fff" />
      ) : (
        <Text style={[buttonTextStyles, style?.textStyle]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  // Define styles for each button type
  primary: {
    button: {
      backgroundColor: '#ff0000',
      borderRadius: 5,
      paddingVertical: 15,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: isTablet ? 20 : 10,
    },
    text: {
      color: '#FFF',
      fontSize: 17,
      fontWeight: '600',
    },
  },
  secondary: {
    button: {
      backgroundColor: '#aee99f',
      borderRadius: 5,
      paddingVertical: 15,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: isTablet ? 20 : 10,
    },
    text: {
      color: '#FFF',
      fontSize: 17,
      fontWeight: '600',
    },
  },
  warning: {
    button: {
      backgroundColor: '#FF9800',
      borderRadius: 5,
      paddingVertical: 15,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: isTablet ? 20 : 10,
    },
    text: {
      color: '#FFF',
      fontSize: 17,
      fontWeight: '600',
    },
  },
  cancel: {
    button: {
      backgroundColor: 'transparent',
      borderColor: '#805500',
      borderWidth: 1,
      borderRadius: 5,
      paddingVertical: 15,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 10,
    },
    text: {
      color: '#805500',
      fontSize: 17,
      fontWeight: '600',
    },
  },
});

export default CustomButton;
