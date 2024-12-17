import React from "react";
import { Audio } from "expo-av";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SERVER_HOST } from "@/utils/constants";
import { PlayingContext } from "@/contexts/PlayingContext";
import Ionicons from "@expo/vector-icons/Ionicons";
import Sound from "@/interfaces/Sound";

interface Props {
    index: number;
    audioName: string;
    chunkName: string;
}

export default function RecordAndListen(props: Props) {
    const HIGH_QUALITY_PRESET = Audio.RecordingOptionsPresets.HIGH_QUALITY;
    const [recording, setRecording] = React.useState<Audio.Recording | undefined>(undefined);
    const { recordingSounds, setRecordingSounds, setPlayingSound } = React.useContext(PlayingContext);

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
    }
    
    async function tryToStartRecording() {
        const perm = await Audio.requestPermissionsAsync();
        if (perm.status == 'granted') {
            const audioMode = { allowsRecordingIOS: true, playsInSilentModeIOS: true };
            await Audio.setAudioModeAsync(audioMode);
            const { recording } = await Audio.Recording.createAsync(HIGH_QUALITY_PRESET);
            return recording;
        }
        return undefined;
    }

    async function stopRecording(recording: Audio.Recording) {
        setRecording(undefined);
        await recording.stopAndUnloadAsync();
        await putIntoLocalRecordings(recording);
        const uri = recording.getURI();
        if (uri) await saveNewRecording(uri);
    }
    
    async function putIntoLocalRecordings(recording: Audio.Recording) {
        const { sound } = await recording.createNewLoadedSoundAsync();
        const allRecordings = [...recordingSounds];
        allRecordings[props.index] = { 
            name: props.chunkName, 
            index: props.index, 
            sound, uri: '', 
            type: 'rec',
            isPlaying: false
        };
        setRecordingSounds(allRecordings);
    }

    async function saveNewRecording(recordingUri: string) {
        const blob = await fetch(recordingUri).then(r => r.blob())
        const b64 = await blobToBase64(blob)
        fetch(`${SERVER_HOST}/upload_recording/${props.audioName}?chunk_name=${props.chunkName}`, {
            method: 'POST',
            body: JSON.stringify({ b64 }),
            headers: { 'content-type': 'application/json' }
        }) .catch((err) => console.error(err.message))
    }

    function blobToBase64(blob: Blob) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    };
    
    async function playRecording(rec: Sound) {
        let sound: Audio.Sound;
        if (rec.sound) {
            sound = rec.sound;
        } else {
            const newSound = new Audio.Sound();
            await newSound.loadAsync({uri: rec.uri});
            sound = newSound;
        }
        setPlayingSound({ ...recordingSounds[props.index], sound });
    }

    return (
        <View>
            {recordingSounds[props.index] ? (
                <View style={styles.row}>
                    <Pressable
                        style={styles.listenBtn}
                        onPress={async () => playRecording(recordingSounds[props.index])}
                    >
                        <Ionicons 
                            name={recordingSounds[props.index].isPlaying ? 'pause-circle' : 'play-circle'} 
                            size={36} 
                            color="#ccc" 
                        />
                    </Pressable>
                    <Pressable
                        style={styles.recordBtn}
                        onPress={async () => await toggleRecording()}
                    >
                        {recording ? (
                            <Ionicons name="radio-button-on" size={36} color="#ff5a5f" />
                        ) : (
                            <Ionicons name="mic" size={36} color="#ccc" />
                        )}
                    </Pressable>
                </View>
            ) : (
                <Pressable
                    style={{...styles.recordBtn, borderBottomLeftRadius: 8, borderTopLeftRadius: 8}}
                    onPress={async () => await toggleRecording()}
                >
                    {recording ? (
                        <Ionicons name="radio-button-on" size={36} color="#ff5a5f" />
                    ) : (
                        <Ionicons name="mic" size={36} color="#ccc" />
                    )}
                </Pressable>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        columnGap: 1,
    },
    listenBtn: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 15,
        backgroundColor: '#2d6a4f',
        paddingVertical: 20,
        paddingHorizontal: 15,
        borderBottomLeftRadius: 8,
        borderTopLeftRadius: 8
    },
    recordBtn: {
        backgroundColor: '#2d6a4f',
        paddingVertical: 20,
        paddingHorizontal: 15,
        alignSelf: 'flex-end',
        alignItems: 'center',
        justifyContent: 'center',
    },
})