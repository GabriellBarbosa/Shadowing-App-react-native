import React from "react";
import { Audio } from "expo-av";
import { Button, StyleSheet, View } from "react-native";
import { playAudio } from "@/utils/functions";
import { SERVER_HOST } from "@/utils/constants";
import AudioChunk from "@/interfaces/AudioChunk";

export default function RecordAndListen(props: {
    index: number,
    audioName: string,
    chunkName: string,
    recordings: Array<AudioChunk | null>,
    setRecordings: (arg: Array<AudioChunk | null>) => void,
}) {
    const [recording, setRecording] = React.useState<Audio.Recording | undefined>(undefined);
    const audioPreset = Audio.RecordingOptionsPresets.HIGH_QUALITY;

    async function toggleRecording() {
        if (recording)
            await stopRecording(recording)
        else 
            await startRecording()
    }

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
        if (uri) await saveNewRecording(uri);

        async function putIntoLocalRecordings() {
            const { sound } = await recording.createNewLoadedSoundAsync();
            const allRecordings = [...props.recordings];
            allRecordings[props.index] = {sound, name: ''};
            props.setRecordings(allRecordings);
        }

        async function saveNewRecording(recordingUri: string) {
            const blob = await fetch(recordingUri).then(r => r.blob())
            const b64 = await blobToBase64(blob)
            fetch(`${SERVER_HOST}/upload_recording/${props.audioName}?chunk_name=${props.chunkName}`, {
                method: 'POST',
                body: JSON.stringify({ b64 }),
                headers: { 'content-type': 'application/json' }
            })
            .catch((err) => console.error(err.message))
        }

        function blobToBase64(blob: Blob) {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result);
                reader.onerror = reject;
                reader.readAsDataURL(blob);
            });
        };
    }

    return (
        <View>
            {props.recordings[props.index] ? (
                <View style={styles.row}>
                    <View style={styles.wide}>
                        <Button 
                            title="You" 
                            onPress={async () => playAudio((props.recordings[props.index] as AudioChunk).sound)}
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