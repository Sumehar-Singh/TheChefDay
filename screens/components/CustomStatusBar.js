import React from 'react';
import { View, TouchableOpacity, StyleSheet, Dimensions, StatusBar, Text, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');
const isTablet = width > 600;

const CustomStatusBar = ({ title, includeTopInset = true }) => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const topPad = Platform.OS === 'android'
    ? (StatusBar.currentHeight || 0)
    : (includeTopInset ? insets.top : 0);

  return (
    <View style={[
      styles.container,
      { paddingTop: topPad }
    ]}>
      {/* Absolute overlay to color the notch area on iOS without affecting layout */}
      {Platform.OS === 'ios' && !includeTopInset && (
        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            top: -insets.top,
            left: 0,
            right: 0,
            height: insets.top,
            backgroundColor: '#ff0000',
          }}
        />
      )}
      <StatusBar backgroundColor="#ff0000" barStyle="light-content" />
      <View style={styles.statusBar}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="arrow-left" size={isTablet ? 30 : 24} color="white" />
        </TouchableOpacity>
        {title && <Text style={styles.title}>{title}</Text>}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ff0000',
  },
  statusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  backButton: {
    padding: 5,
  },
  title: {
    fontSize: isTablet ? 22 : 18,
    fontWeight: '600',
    color: 'white',
    marginLeft: 15,
  },
});

export default CustomStatusBar;
