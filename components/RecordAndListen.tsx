import React from "react";
import { Audio } from "expo-av";
import { Button, StyleSheet, View } from "react-native";

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
                const audio = await Audio.Recording.createAsync(audioPreset);
                return audio.recording;
            }
            return undefined;
        }
    }
    
    async function stopRecording() {
        setRecording(undefined);
        
        if (recording) {
            const sound = await loadRecording(recording);
            const allRecordings = [...props.recordings];
            allRecordings[props.index] = sound;
            props.setRecordings(allRecordings);
        }

        async function loadRecording(recording: Audio.Recording) {
            await recording.stopAndUnloadAsync();
            const { sound } = await recording.createNewLoadedSoundAsync();
            return sound;
        }
    }

    async function toggleRecording() {
        if (recording)
            await stopRecording()
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
                            onPress={() => props.recordings[props.index].replayAsync()}
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