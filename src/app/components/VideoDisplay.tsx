import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';

interface VideoDisplayProps {
  uri: string;
  style?: ViewStyle;
  contentFit?: 'contain' | 'cover' | 'fill';
}

export default function VideoDisplay({ uri, style, contentFit = 'contain' }: VideoDisplayProps) {
  const player = useVideoPlayer(uri, player => {
    player.loop = false;
    // By default, we don't auto-play to match previous behavior (shouldPlay={false})
  });

  return (
    <View style={[styles.container, style]}>
      <VideoView
        style={styles.video}
        player={player}
        allowsFullscreen
        allowsPictureInPicture
        contentFit={contentFit}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  video: {
    width: '100%',
    height: '100%',
  },
});
