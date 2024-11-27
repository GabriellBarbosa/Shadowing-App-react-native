import React, { useCallback } from 'react';
import { Button, View } from 'react-native';
import { SERVER_HOST } from '@/utils/constants';
import * as DocumentPicker from 'expo-document-picker';

export default function FileUploadComponent() {

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
        await tryToUpload(file);
      } catch(err) {
        console.error(`error occurred on file upload: ${err}`);
      }
    }

    async function tryToUpload(file: DocumentPicker.DocumentPickerAsset) {
      await fetch(`${SERVER_HOST}/upload`, {
        method: 'POST',
        body: createFormData(file)
      })
      .then((res) => console.info(res))
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
        <Button title="Upload Audio" onPress={pickFileAndUpload} color="#02c39a" />
      </View>
    );
  };