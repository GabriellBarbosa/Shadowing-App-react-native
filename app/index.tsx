import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Link } from 'expo-router';
import { api } from '@/utils/constants';

import FileUploadComponent from '@/components/FileUploadComponent';

export default function HomeScreen() {
  const [audios, setAudios] = React.useState<string[]>([]);

  React.useEffect(() => {
    fetch(`${api}/audios`)
      .then((res) => res.json())
      .then((json) => setAudios(json.audios))
      .catch((err) => console.error(err));
  }, []);

  return (
    <View style={styles.container}>
      <FileUploadComponent />
      {audios.map((audioName, index) => (
        <Link 
          key={index}
          style={styles.link}
          href={{
            // @ts-ignore 
            pathname: '/audio/[id]',
            params: { id: audioName }
          }
        }>{ audioName }</Link>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    margin: 10
  },
  link: {
    paddingVertical: 10,
    textTransform: 'uppercase'
  }
})