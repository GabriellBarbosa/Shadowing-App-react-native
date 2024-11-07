import React from "react";
import { Button, FlatList, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { Audio } from 'expo-av';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';

export default function AudioScreen() {
    const { id } = useLocalSearchParams();

    const [audios, setAudios] = React.useState<Audio.Sound[]>([]);
    const [recording, setRecording] = React.useState<Audio.Recording | undefined>(undefined);
    const [recordings, setRecordings] = React.useState<Audio.Sound[]>([]);
    const [recordingIndex, setRecordingIndex] = React.useState<number | undefined>(undefined);

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
            setRecording(undefined);
            setRecordingIndex(undefined);
        }
    }
    async function stopRecording() {
        setRecording(undefined);
        setRecordingIndex(undefined);
        
        if (recording && recordingIndex) {
            await recording.stopAndUnloadAsync();
            const allRecordings = [...recordings];
            const { sound } = await recording.createNewLoadedSoundAsync();
            allRecordings[recordingIndex] = sound;
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
    
    async function loadAudios(audiosUrl: string[]) {
        const result = [];
        for await (const url of audiosUrl) {
            const loaded = await Audio.Sound.createAsync({
                uri: `http://127.0.0.1:5000/${url}`,
            });
            result.push(loaded.sound);
        }
        return result;
    }


    const Shadowing = (props: {audio: Audio.Sound, index: number}) => {
        return (
            <View style={styles.piece}>
                <View style={styles.nativeSpeechBtn}>
                    <Button
                        onPress={async () => await props.audio.playAsync()}
                        title="Native"
                    />
                </View>
                {recordings[props.index] ? (
                    <View style={styles.row}>
                        <View style={styles.wide}>
                            <Button 
                                title="You" 
                                onPress={() => recordings[props.index].replayAsync()}
                            />
                        </View>
                        <View style={styles.wide}>
                            <Button
                                onPress={() => recording ? stopRecording() : startRecording(props.index)}
                                title={recording && recordingIndex == props.index ? 'Stop' : 'Try Again'}
                            />
                        </View>
                    </View>
                ) : (
                    <Button
                        onPress={() => recording ? stopRecording() : startRecording(props.index)}
                        title={recording && recordingIndex == props.index ? 'Stop' : 'Record'}
                    />
                )}
            </View>
        )
    };
      

    return (
        <SafeAreaProvider>
            <SafeAreaView style={styles.container}>
                <FlatList
                    data={audios}
                    renderItem={({item, index}) => <Shadowing audio={item} index={index} />}
                    keyExtractor={(_item, index) => String(index)}
                />
            </SafeAreaView>
        </SafeAreaProvider>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10
    },
    piece: {
        marginVertical: 10
    },
    row: {
        display: 'flex',
        flexDirection: 'row',
        columnGap: 1,
    },
    wide: {
        flex: 1
    },
    nativeSpeechBtn: {
        marginBottom: 1
    }
})