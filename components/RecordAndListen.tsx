import React from "react";
import { Audio } from "expo-av";
import { Pressable, StyleSheet, View } from "react-native";
import { SERVER_HOST } from "@/utils/constants";
import { Recording } from "@/interfaces/Recording";
import { PlayingContext } from "@/contexts/PlayingContext";
import Ionicons from "@expo/vector-icons/Ionicons";
import Slider from '@react-native-community/slider';

interface Props {
    index: number;
    audioName: string;
    chunkName: string;
    recordings: Array<Recording | null>;
    setRecordings: (arg: Array<Recording | null>) => void; 
}

export default function RecordAndListen(props: Props) {
    const HIGH_QUALITY_PRESET = Audio.RecordingOptionsPresets.HIGH_QUALITY;
    const [recording, setRecording] = React.useState<Audio.Recording | undefined>(undefined);
    const [playingProgress, setPlayingProgress] = React.useState<number>(0);
    const { playingSound, setPlayingSound } = React.useContext(PlayingContext);

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
            const audioMode = {allowsRecordingIOS: true, playsInSilentModeIOS: true};
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
        const allRecordings = [...props.recordings];
        allRecordings[props.index] = sound;
        props.setRecordings(allRecordings);
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
    
    async function playRecording(rec: Recording | null) {
        if (rec == null)  return;

        if (!playingSound) {
            if (rec instanceof Audio.Sound) {
                setPlayingSound({ sound: rec, index: props.index, type: 'rec' });
                await playFromPosition(rec);
            } else {
                const sound = new Audio.Sound();
                setPlayingSound({ sound, index: props.index, type: 'rec' });
                await sound.loadAsync({uri: rec.path});
                await playFromPosition(sound);
            }
        }
    }

    async function playFromPosition(sound: Audio.Sound) {
        const status = await sound.getStatusAsync();
        if (status.isLoaded) {
            const durationMs = status.durationMillis ?? 0;
            await sound.playFromPositionAsync(durationMs * playingProgress);
        }
    }

    return (
        <View>
            {props.recordings[props.index] ? (
                <View style={styles.row}>
                    <Pressable
                        style={styles.listenBtn}
                        onPress={async () => playRecording(props.recordings[props.index])}
                    >
                        <Ionicons 
                            name={playingSound?.index == props.index && playingSound.type == 'rec' ? 'pause' : 'play'} 
                            size={36} color="#d3d3d3"
                        />
                        <Slider
                            value={playingProgress}
                            style={{width: 200}}
                            minimumValue={0}
                            maximumValue={1}
                            minimumTrackTintColor="#02c39a"
                            maximumTrackTintColor="#212529"
                            thumbTintColor="#02c39a"
                            onSlidingComplete={(value) => setPlayingProgress(value)}
                        />
                    </Pressable>
                    <Pressable
                        style={styles.recordBtn}
                        onPress={async () => await toggleRecording()}
                    >
                        {recording ? (
                            <Ionicons name="radio-button-on" size={36} color="#ff5a5f" />
                        ) : (
                            <Ionicons name="mic" size={36} color="#d3d3d3" />
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
                        <Ionicons name="mic" size={36} color="#d3d3d3" />
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
        backgroundColor: '#246a73',
        paddingVertical: 20,
        paddingHorizontal: 15,
        borderBottomLeftRadius: 8,
        borderTopLeftRadius: 8
    },
    recordBtn: {
        backgroundColor: '#246a73',
        paddingVertical: 20,
        paddingHorizontal: 15,
        alignSelf: 'flex-end',
        alignItems: 'center',
        justifyContent: 'center',
    },
})