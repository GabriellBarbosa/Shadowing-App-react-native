import React, { useCallback } from 'react';
import { Button, View } from 'react-native';
import { SERVER_HOST } from '@/utils/constants';
import * as DocumentPicker from 'expo-document-picker';

interface Props {
  onUploadComplete: () => void;
}

export default function FileUploadComponent(props: Props) {
  const [loading, setLoading] = React.useState<boolean>(false);

  const pickFileAndUpload = useCallback(async () => {
    const file = await pickFile();
    if (file != null)
      await uploadFile(file);
  }, []);

  async function pickFile() {
    try {
      return await tryToPick();
    } catch (err) {
      console.error(`Error occurred on file pick: ${err}`);
      return null;
    }
  }

  async function tryToPick() {
    const result = await DocumentPicker.getDocumentAsync({
      type: 'audio/x-wav',
    });
    return result.assets ? result.assets[0] : null;
  }

  async function uploadFile(file: DocumentPicker.DocumentPickerAsset) {
    try {
      setLoading(true);
      await tryToUpload(file);
      props.onUploadComplete();
    } catch(err) {
      console.error(`error occurred on file upload: ${err}`);
    } finally {
      setLoading(false);
    }
  }

  async function tryToUpload(file: DocumentPicker.DocumentPickerAsset) {
    await fetch(`${SERVER_HOST}/upload`, {
      method: 'POST',
      body: createFormData(file)
    })
    .catch((err) => console.error(err));
  }

  function createFormData({ name, uri, mimeType }: DocumentPicker.DocumentPickerAsset) {
    const formData = new FormData();
    const fileData = JSON.stringify({name, uri, type: mimeType})
    formData.append('file', JSON.parse(fileData));
    return formData;
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