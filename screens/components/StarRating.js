import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, StyleSheet, Pressable, Animated } from 'react-native';

// Improved, animated, and customizable star rating
// Backward compatible with: <StarRating rating={n} onChange={setN} />
const StarRating = ({
  rating = 0,
  onChange = () => {},
  size = 32,
  activeColor = '#ff9900',
  inactiveColor = '#e0e0e0',
  spacing = 6,
  readOnly = false,
}) => {
  const [currentRating, setCurrentRating] = useState(rating);

  // Sync internal state when external rating changes
  useEffect(() => {
    setCurrentRating(rating);
  }, [rating]);

  // Animated scale for each star
  const scales = useRef([...Array(5)].map(() => new Animated.Value(1))).current;

  const stars = useMemo(() => [1, 2, 3, 4, 5], []);

  const animateStar = (index) => {
    Animated.sequence([
      Animated.timing(scales[index], { toValue: 1.25, duration: 120, useNativeDriver: true }),
      Animated.spring(scales[index], { toValue: 1, friction: 6, useNativeDriver: true }),
    ]).start();
  };

  const handlePress = (star, index) => {
    if (readOnly) return;
    const newRating = currentRating === star ? 0 : star;
    setCurrentRating(newRating);
    onChange(newRating);
    animateStar(index);
  };

  return (
    <View style={[styles.starContainer]}>
      {stars.map((star, index) => {
        const isActive = star <= currentRating;
        return (
          <Pressable
            key={star}
            onPress={() => handlePress(star, index)}
            style={({ pressed }) => [
              styles.starWrapper,
              { marginHorizontal: spacing / 2 },
              pressed && styles.pressedStarWrapper,
            ]}
            accessibilityRole="button"
            accessibilityLabel={`Rate ${star} star${star > 1 ? 's' : ''}`}
          >
            <Animated.Text
              style={{
                fontSize: size,
                color: isActive ? activeColor : inactiveColor,
                transform: [{ scale: scales[index] }],
              }}
            >
              {isActive ? '★' : '☆'}
            </Animated.Text>
          </Pressable>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  starContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starWrapper: {
    padding: 4,
    borderRadius: 6,
  },
  pressedStarWrapper: {
    opacity: 0.85,
  },
});

export default StarRating;
