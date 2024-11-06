import { Text, View } from 'react-native';
import FileUploadComponent from '@/components/FileUploadComponent';
import React from 'react';
import { Link } from 'expo-router';

export default function HomeScreen() {
  const [audios, setAudios] = React.useState<string[]>([]);

  React.useEffect(() => {
    fetch('http://127.0.0.1:5000/audios')
      .then((res) => res.json())
      .then((json) => setAudios(json.audios))
      .catch((err) => console.error(err));
  }, []);

  return (
    <View>
      <FileUploadComponent />
      {audios.map((audioName, index) => (
        <Link key={index} href={{
          // @ts-ignore 
          pathname: '/audio/[id]',
          params: { id: audioName }
        }}>{ audioName }</Link>
      ))}
    </View>
  );
}