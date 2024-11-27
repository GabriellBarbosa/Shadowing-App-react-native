import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Link } from 'expo-router';
import { SERVER_HOST } from '@/utils/constants';

import FileUploadComponent from '@/components/FileUploadComponent';

export default function HomeScreen() {
  const [audios, setAudios] = React.useState<string[]>([]);

  React.useEffect(() => {
    fetchAndSetAudios();
  }, []);

  function fetchAndSetAudios() {
    fetch(`${SERVER_HOST}/audios`)
    .then((res) => res.json())
    .then((json) => setAudios(json.audios))
    .catch((err) => console.error(err.message));
  }

  return (
    <View style={styles.container}>
      <View style={styles.fileUploadWrapper}>
        <FileUploadComponent onUploadComplete={fetchAndSetAudios} />
      </View>
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
    backgroundColor: '#343a40',
    flex: 1,
    paddingVertical: 20,
    paddingHorizontal: 10
  },
  link: {
    paddingVertical: 20,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderColor: '#0d1b2a',
    textTransform: 'uppercase',
    color: '#fff',
  },
  fileUploadWrapper: {
    marginBottom: 20
  }
})