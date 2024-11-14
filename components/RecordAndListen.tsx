import React from "react";
import { Audio } from "expo-av";
import { Button, StyleSheet, View } from "react-native";
import { playAudio } from "@/utils/functions";
import { HOST_WITH_PORT } from "@/utils/constants";

export default function RecordAndListen(props: {
    recordings: Audio.Sound[],
    setRecordings: (arg: Audio.Sound[]) => void,
    index: number
}) {
    const [recording, setRecording] = React.useState<Audio.Recording | undefined>(undefined);
    const audioPreset = Audio.RecordingOptionsPresets.HIGH_QUALITY;

    async function startRecording() {
        try {
            const recording = await tryToStartRecording();
            setRecording(recording);
        } catch(err) {
            setRecording(undefined);
        }

        async function tryToStartRecording() {
            const perm = await Audio.requestPermissionsAsync();
            if (perm.status == 'granted') {
                await Audio.setAudioModeAsync({
                    allowsRecordingIOS: true,
                    playsInSilentModeIOS: true
                });
                const { recording } = await Audio.Recording.createAsync(audioPreset);
                return recording;
            }
            return undefined;
        }
    }
    
    async function stopRecording(recording: Audio.Recording) {
        setRecording(undefined);
        await recording.stopAndUnloadAsync();
        await putIntoLocalRecordings();
        const uri = recording.getURI();
        if (uri)
            await saveNewRecording(uri);

        async function putIntoLocalRecordings() {
            const { sound } = await recording.createNewLoadedSoundAsync();
            const allRecordings = [...props.recordings];
            allRecordings[props.index] = sound;
            props.setRecordings(allRecordings);
        }

        async function saveNewRecording(recordingUri: string) {
            const reader = new FileReader();
            let blob = await fetch(recordingUri).then(r => r.blob())
            reader.readAsDataURL(blob); 
            reader.onloadend = () => {
                if (typeof reader.result == 'string') 
                    uploadRecording(reader.result)
            }
        }

        function uploadRecording(base64: string) {
            const formData = new FormData();
            formData.append('recording', base64)
            fetch(`${HOST_WITH_PORT}/upload_recording/largeone?chunk_name=0.wav`, {
                method: 'POST',
                body: formData,
            }).catch((err) => console.error(err.message))
        }
    }

    async function toggleRecording() {
        if (recording)
            await stopRecording(recording)
        else 
            await startRecording()
    }

    return (
        <View>
            {props.recordings[props.index] ? (
                <View style={styles.row}>
                    <View style={styles.wide}>
                        <Button 
                            title="Listen" 
                            onPress={async () => playAudio(props.recordings[props.index])}
                        />
                    </View>
                    <View style={styles.wide}>
                        <Button
                            onPress={async () => await toggleRecording()}
                            title={recording ? 'Stop' : 'Try Again'}
                        />
                    </View>
                </View>
            ) : (
                <Button
                    onPress={async () => await toggleRecording()}
                    title={recording ? 'Stop' : 'Record'}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    row: {
        display: 'flex',
        flexDirection: 'row',
        columnGap: 1,
    },
    wide: {
        flex: 1
    },
})