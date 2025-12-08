import React, { useEffect, useMemo } from 'react';
import { Dimensions, StyleSheet, View, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../components/contexts/AuthContext';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { Asset } from 'expo-asset';

const ICON_SIZE = 80;
const LOGO_SIZE = 140;
const LOGO_RING = 12; // padding around logo inside its circular badge
const BG = '#FFFFFF';

const ICONS = [
  require('../../assets/app/1.png'),
  require('../../assets/app/2.png'),
  require('../../assets/app/3.png'),
  require('../../assets/app/4.png'),
  require('../../assets/app/5.png'),
];

const LOGO = require('../../assets/icon.png');

export default function AnimatedSplash() {
  const navigation = useNavigation();
  const { appUser, profile, isLoading, handleUserNavigation } = useAuth();
  const { width, height } = Dimensions.get('window');

  const centerX = width / 2;
  const centerY = height / 2 - 10;
  const radius = Math.max((LOGO_SIZE + ICON_SIZE) / 2 + 16, Math.min(width, height) * 0.26);

  const anglesDeg = useMemo(() => Array.from({ length: ICONS.length }, (_, i) => -90 + i * (360 / ICONS.length)), []);
  const finalPositions = useMemo(
    () =>
      anglesDeg.map((deg) => {
        const rad = (deg * Math.PI) / 180;
        const x = radius * Math.cos(rad);
        const y = -radius * Math.sin(rad);
        return {
          left: centerX + x - ICON_SIZE / 2,
          top: centerY + y - ICON_SIZE / 2,
        };
      }),
    [centerX, centerY, radius, anglesDeg]
  );

  const tx = ICONS.map(() => useSharedValue(0));
  const ty = ICONS.map(() => useSharedValue(0));
  const op = ICONS.map(() => useSharedValue(0));
  const sc = ICONS.map((_, i) => useSharedValue(i === 4 ? 0.6 : 1));

  const logoOpacity = useSharedValue(0);
  const logoScale = useSharedValue(0.8);
  const taglineOpacity = useSharedValue(0);
  const taglineTranslateY = useSharedValue(8);
  const headerOpacity = useSharedValue(0);
  const headerTranslateY = useSharedValue(-8);

  const containerOpacity = useSharedValue(1);
  const containerScale = useSharedValue(1);

  const entryOffsets = useMemo(() => [
    { x: 0, y: -height },
    { x: -width, y: 0 },
    { x: width, y: 0 },
    { x: 0, y: height },
    { x: 0, y: 0 },
  ], [width, height]);

  useEffect(() => {
    const assets = [...ICONS, LOGO];
    assets.forEach((mod) => Asset.fromModule(mod).downloadAsync().catch(() => undefined));
  }, []);

  useEffect(() => {
    ICONS.forEach((_, i) => {
      tx[i].value = entryOffsets[i].x;
      ty[i].value = entryOffsets[i].y;
      op[i].value = 0;
      sc[i].value = i === 4 ? 0.6 : 1;

      tx[i].value = withTiming(0, { duration: 1500, easing: Easing.inOut(Easing.ease) });
      ty[i].value = withTiming(0, { duration: 1500, easing: Easing.inOut(Easing.ease) });
      op[i].value = withTiming(1, { duration: 1200, easing: Easing.out(Easing.ease) });
      if (i === 4) {
        sc[i].value = withTiming(1, { duration: 1200, easing: Easing.inOut(Easing.ease) });
      }
    });

    const pulseStart = setTimeout(() => {
      ICONS.forEach((_, i) => {
        sc[i].value = withRepeat(
          withTiming(1.06, { duration: 350, easing: Easing.inOut(Easing.ease) }),
          4,
          true
        );
      });
    }, 1500);

    const logoStart = setTimeout(() => {
      logoOpacity.value = withTiming(1, { duration: 900, easing: Easing.out(Easing.ease) });
      logoScale.value = withTiming(1, { duration: 900, easing: Easing.out(Easing.ease) });
      ICONS.forEach((_, i) => {
        op[i].value = withTiming(0.5, { duration: 800, easing: Easing.inOut(Easing.ease) });
        sc[i].value = withTiming(0.92, { duration: 800, easing: Easing.inOut(Easing.ease) });
      });
      taglineOpacity.value = withTiming(1, { duration: 700, easing: Easing.out(Easing.ease) });
      taglineTranslateY.value = withTiming(0, { duration: 700, easing: Easing.out(Easing.ease) });
      headerOpacity.value = withTiming(1, { duration: 700, easing: Easing.out(Easing.ease) });
      headerTranslateY.value = withTiming(0, { duration: 700, easing: Easing.out(Easing.ease) });
    }, 3000);

    const exitStart = setTimeout(() => {
      containerOpacity.value = withTiming(0, { duration: 900, easing: Easing.inOut(Easing.ease) });
      containerScale.value = withTiming(0.96, { duration: 900, easing: Easing.inOut(Easing.ease) });
    }, 4000);

    const goNext = setTimeout(async () => {
      // Check if user is already logged in
      if (!isLoading && appUser && profile) {
        // User is already logged in, navigate to appropriate screen
        await handleUserNavigation(appUser, profile, navigation);
      } else {
        // User is not logged in, go to login screen
        navigation.replace('Home');
      }
    }, 5000);

    return () => {
      clearTimeout(pulseStart);
      clearTimeout(logoStart);
      clearTimeout(exitStart);
      clearTimeout(goNext);
    };
  }, [entryOffsets, navigation, logoOpacity, logoScale, containerOpacity, containerScale, isLoading, appUser, profile, handleUserNavigation]);

  const containerStyle = useAnimatedStyle(() => ({
    opacity: containerOpacity.value,
    transform: [{ scale: containerScale.value }],
  }));

  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }],
  }));

  const taglineStyle = useAnimatedStyle(() => ({
    opacity: taglineOpacity.value,
    transform: [{ translateY: taglineTranslateY.value }],
  }));
  
  const headerStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
    transform: [{ translateY: headerTranslateY.value }],
  }));

  const iconStyles = ICONS.map((_, i) =>
    useAnimatedStyle(() => ({
      opacity: op[i].value,
      transform: [
        { translateX: tx[i].value },
        { translateY: ty[i].value },
        { scale: sc[i].value },
      ],
    }))
  );

  return (
    <LinearGradient
      colors={["#b30000", "#e60000", "#b30000"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.root}
    >
      <Animated.View style={[styles.container, containerStyle]}>
        <Animated.View
          style={[
            headerStyle,
            {
              position: 'absolute',
              left: centerX - 160,
              top: centerY - radius - ICON_SIZE / 2 - 64,
              width: 320,
              alignItems: 'center',
            },
          ]}
        >
          <Text style={styles.header}>The Chef Day</Text>
        </Animated.View>

        {finalPositions.map((pos, i) => (
          <Animated.Image
            key={`icon-${i}`}
            source={ICONS[i]}
            resizeMode="contain"
            style={[styles.icon, { left: pos.left, top: pos.top }, iconStyles[i]]}
          />
        ))}

        <Animated.View
          style={[
            logoStyle,
            {
              position: 'absolute',
              width: LOGO_SIZE + LOGO_RING * 2,
              height: LOGO_SIZE + LOGO_RING * 2,
              left: centerX - (LOGO_SIZE + LOGO_RING * 2) / 2,
              top: centerY - (LOGO_SIZE + LOGO_RING * 2) / 2,
              borderRadius: (LOGO_SIZE + LOGO_RING * 2) / 2,
              borderWidth: 3,
              borderColor: 'rgba(255,255,255,0.9)',
              overflow: 'hidden',
              shadowColor: '#000',
              shadowOpacity: 0.15,
              shadowRadius: 100,
              shadowOffset: { width: 0, height: 4 },
              elevation: 6,
              alignItems: 'center',
              justifyContent: 'center',
            },
          ]}
        >
        
          <Animated.Image
            source={LOGO}
            resizeMode="contain"
            style={styles.logo}
          />
        </Animated.View>

        <Animated.View
          style={[
            taglineStyle,
            {
              position: 'absolute',
              left: centerX - 160,
              top: centerY + radius + ICON_SIZE / 2 + 48,
              width: 320,
              alignItems: 'center',
            },
          ]}
        >
          <Text style={styles.tagline}>Connecting chefs and food lovers</Text>
        </Animated.View>
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
   
  },
  container: {
    flex: 1,
  },
  icon: {
    position: 'absolute',
    width: ICON_SIZE,
    height: ICON_SIZE,
  },
  logo: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
    borderRadius:100
  },
  header: {
    fontSize: 25,
    color: 'white',
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  tagline: {
    fontSize: 16,
    color: 'white',
    fontWeight: '800',
    letterSpacing: 0.3,
  },
});
