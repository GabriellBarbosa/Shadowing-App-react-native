import React from "react";
import { Button, StyleSheet, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { Audio } from 'expo-av';

export default function AudioScreen() {
    const [audios, setAudios] = React.useState<any[]>([]);
    const { id } = useLocalSearchParams();

    const [recording, setRecording] = React.useState<Audio.Recording | null>(null);
    const [recordings, setRecordings] = React.useState<Array<{ sound: Audio.Sound, file: string | null }>>([]);
    const [recordingIndex, setRecordingIndex] = React.useState<number | null>(null);

    async function startRecording(index: number) {
        try {
            const perm = await Audio.requestPermissionsAsync();
            if (perm.status == 'granted') {
                await Audio.setAudioModeAsync({
                    allowsRecordingIOS: true,
                    playsInSilentModeIOS: true
                });
                const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
                setRecording(recording);
                setRecordingIndex(index);
            }
        } catch(err) {
            setRecording(null);
            setRecordingIndex(null);
        }
    }
    async function stopRecording() {
        setRecording(null);
        setRecordingIndex(null);
        
        if (recording && recordingIndex) {
            await recording.stopAndUnloadAsync();
            const allRecordings = [...recordings];
            const { sound } = await recording.createNewLoadedSoundAsync();
            allRecordings[recordingIndex] = {
                sound,
                file: recording.getURI()
            };

            setRecordings(allRecordings);
        }
    }

    React.useEffect(() => {
    fetch(`http://127.0.0.1:5000/audio/${id}`)
        .then((res) => res.json())
        .then(async (audios) => {
            const loadedAudios = await loadAudios(audios);
            setAudios(loadedAudios);
            setRecordings(Array(loadAudios.length));
        })
        .catch((err) => console.error(err));
    }, []);
    
    async function loadAudios(audiosUrl: any[]) {
        const result = [];
        for await (const url of audiosUrl) {
            const loaded = await Audio.Sound.createAsync({
                uri: `http://127.0.0.1:5000/${url}`,
            });
            result.push(loaded.sound);
        }
        return result;
    }

    return (
        <View style={styles.container}>
            {audios && audios.map((audio, index) => (
                <View key={index}>
                    <Button
                        onPress={async () => await audio.playAsync()}
                        title="NATIVE"
                    />

                    {recordings[index] ? (
                        <View style={styles.wideBtnWrapper}>
                            <View style={styles.wideBtn}>
                                <Button 
                                    title="YOU" 
                                    onPress={() => recordings[index].sound.replayAsync()}
                                />
                            </View>
                            <View style={styles.wideBtn}>
                                <Button
                                    onPress={() => recording ? stopRecording() : startRecording(index)}
                                    title={recording && recordingIndex == index ? 'Stop' : 'Try Again'}
                                />
                            </View>
                        </View>
                    ) : (
                        <Button
                            onPress={() => recording ? stopRecording() : startRecording(index)}
                            title={recording && recordingIndex == index ? 'Stop' : 'Record'}
                        />
                    )}
                </View>
            ))}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        padding: 10,
        gap: 20
    },
    wideBtnWrapper: {
        display: 'flex',
        flexDirection: 'row',
        gap: 1,
        marginTop: 1
    },
    wideBtn: {
        flexGrow: 1
    }
})