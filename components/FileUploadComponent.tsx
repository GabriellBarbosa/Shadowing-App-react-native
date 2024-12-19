import React, { useCallback } from 'react';
import { Button, View } from 'react-native';
import { SERVER_HOST } from '@/utils/constants';

interface Props {
  onUploadComplete: () => void;
}

export default function FileUploadComponent(props: Props) {
  const [loading, setLoading] = React.useState<boolean>(false);

  const pickFileAndUpload = useCallback(async () => {
    try {
      setLoading(true);
      await tryToUpload();
    } catch(err) {
      console.error(`error occurred on file upload: ${err}`);
    } finally {
      setLoading(false);
    }
  }, []);

  async function tryToUpload() {
    await fetch(`${SERVER_HOST}/yt`, {
      method: 'POST',
      body: JSON.stringify({ url: "https://youtu.be/Q6dKCG5tYOY?feature=shared" }),
      headers: { 'content-type': 'application/json' }
    })
    props.onUploadComplete();
  }

  return (
    <View>
      {loading ? (
        <Button title="It may take some minutes..." color="#02c39a" />
      ) : (
        <Button title="Upload Audio" onPress={pickFileAndUpload} color="#02c39a" />
      )}
    </View>
  );
  };