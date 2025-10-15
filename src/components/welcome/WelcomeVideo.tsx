// Welcome Video Component
// Handles video playback with fallback to gradient animation

import React from 'react';
import { StyleSheet, Dimensions } from 'react-native';
import Video from 'react-native-video';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface WelcomeVideoProps {
  onError: (error: any) => void;
  onLoad?: () => void;
}

export const WelcomeVideo: React.FC<WelcomeVideoProps> = ({
  onError,
  onLoad,
}) => {
  return (
    <Video
      source={require('../../../assets/videos/welcome.mp4')}
      style={styles.video}
      resizeMode="cover"
      repeat={false}
      muted={true}
      paused={false}
      playInBackground={false}
      playWhenInactive={false}
      ignoreSilentSwitch="obey"
      onError={onError}
      onLoad={onLoad}
    />
  );
};

const styles = StyleSheet.create({
  video: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: screenWidth,
    height: screenHeight,
  },
});

