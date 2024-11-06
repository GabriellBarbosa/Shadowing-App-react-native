import { Image, StyleSheet } from 'react-native';

import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import FileUploadComponent from '@/components/FileUploadComponent';
import React from 'react';

export default function HomeScreen() {
  const [audios, setAudios] = React.useState<string[]>([]);

  React.useEffect(() => {
    fetch('http://127.0.0.1:5000/audios')
      .then((res) => res.json())
      .then((json) => setAudios(json.audios))
      .catch((err) => console.error(err));
  }, []);

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <Image
          source={require('@/assets/images/usa-min.jpg')}
          style={styles.reactLogo}
        />
      }>

      <ThemedView style={styles.stepContainer}>
        <FileUploadComponent />
      </ThemedView>

      <ThemedView style={styles.stepContainer}>
        {audios.map((a) => (
          <ThemedText>{a}</ThemedText>
        ))}
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 262,
    width: 430,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
});
