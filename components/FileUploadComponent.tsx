import React, { useCallback } from 'react';
import { Button, View } from 'react-native';
import { api } from '@/utils/constants';
import * as DocumentPicker from 'expo-document-picker';

export default function FileUploadComponent() {

    const pickFileAndUpload = useCallback(async () => {
      const file = await pickFile();
      if (file != null)
        await uploadFile(file);

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
          type: 'audio/*',
        });
        return result.output ? result.output[0] : null;
      }
  
      async function uploadFile(file: File) {
        try {
          await tryToUpload(file);
        } catch(err) {
          console.error(`error occurred on file upload: ${err}`);
        }
      }
  
      async function tryToUpload(file: File) {
        const data = new FormData();
        data.append('file', file);
        await fetch(`${api}/upload`, {
          method: 'POST',
          body: data
        });
      }
    }, []);

    return (
      <View>
        <Button title="Pick Audio" onPress={pickFileAndUpload} />
      </View>
    );
  };