import React, { useCallback } from 'react';
import { Button, View, TextInput, StyleSheet, Text } from 'react-native';
import { SERVER_HOST } from '@/utils/constants';

interface Props {
  onUploadComplete: () => void;
}

export default function FileUploadComponent(props: Props) {
  const [loading, setLoading] = React.useState<boolean>(false);
  const [videoUrl, setVideoUrl] = React.useState<string>('');

  async function downloadAudio() {
    try {
      setLoading(true);
      await tryToUpload();
      props.onUploadComplete();
      setVideoUrl('');
    } catch(err) {
      console.error(`error occurred on file upload: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  async function tryToUpload() {
    await fetch(`${SERVER_HOST}/yt`, {
      method: 'POST',
      body: JSON.stringify({ url: videoUrl }),
      headers: { 'content-type': 'application/json' }
    })
  }

  return (
    <View>
      <TextInput 
        placeholder='Please paste the YouTube video URL'
        style={styles.input}
        value={videoUrl}
        onChange={(e) => setVideoUrl(e.nativeEvent.text)}
        placeholderTextColor="#6c757d"
      />
      {loading ? (
        <Button title="It may take a few minutes..." color="#02c39a" />
      ) : (
        <Button title="Download Audio" onPress={downloadAudio} color="#02c39a" />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  input: {
    marginBottom: 10,
    borderWidth: 1,
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderRadius: 4,
    borderColor: '#6c757d',
    color: '#fff'
  },
});