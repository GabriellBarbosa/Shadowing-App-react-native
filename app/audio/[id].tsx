import React from "react";
import AudioChunk from "@/interfaces/AudioChunk";
import { Recording } from "@/interfaces/Recording";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { SERVER_HOST } from "@/utils/constants";

import RecordAndListen from "@/components/RecordAndListen";
import Ionicons from '@expo/vector-icons/Ionicons';
import { Audio } from "expo-av";

interface PlayingSound {
    sound: Audio.Sound;
    index: number;
    type: 'rec' | 'original';
}

export default function AudioScreen() {
    const { id } = useLocalSearchParams();
    const [originals, setOriginals] = React.useState<Array<AudioChunk | null>>([]);
    const [recordings, setRecordings] = React.useState<Array<Recording | null>>([]);
    const [playingSound, setPlayingSound] = React.useState<PlayingSound>();

    React.useEffect(() => {
        if (playingSound)
            updatePlayingStatus(playingSound.sound);

        async function updatePlayingStatus(audio: Audio.Sound) {
            const intervalId = setInterval(async () => {
                const status = await audio.getStatusAsync();
                if (status.isLoaded) {
                    if (status.positionMillis == status.durationMillis) {
                        setPlayingSound(undefined);
                        clearInterval(intervalId)
                        await playingSound?.sound.unloadAsync();
                    }
                }
            }, 500);
        }
    }, [playingSound])

    React.useEffect(() => {
        fetch(`${SERVER_HOST}/audio/${id}`)
        .then((res) => res.json())
        .then((URIs) => setOriginals(URIs))
        .catch((err) => console.error(err));
    }, []);

    React.useEffect(() => {
        fetch(`${SERVER_HOST}/recording/${id}`)
        .then((res) => res.json())
        .then(async (URIs) => setRecordings(URIs))
        .catch((err) => console.error(err));
    }, []);

    async function playFromUri(uri: string, index: number) {
        if (!playingSound) {
            const sound = new Audio.Sound();
            setPlayingSound({sound, index, type: 'original'});
            await sound.loadAsync({uri});
            await sound.playAsync();
        }
    }

    const Shadowing = (props: {original: AudioChunk | null, index: number}) => {
        if (props.original == null) return
        return (
            <View style={styles.shadowing}>
                <Text style={styles.message}>{props.index + 1} of {originals.length}</Text>
                <Pressable
                    style={styles.nativeSpeechBtn}
                    onPress={async () => {
                        await playFromUri((originals[props.index] as AudioChunk).path, props.index)
                    }}
                >
                    <Ionicons 
                        name={playingSound?.index == props.index && playingSound.type == 'original' ? 'pause' : 'play'}
                        size={36} 
                        color="#d3d3d3" 
                    />
                </Pressable>
                <View style={styles.recordingBtnsWrapper}>
                    <RecordAndListen
                        index={props.index} 
                        audioName={id as string}
                        chunkName={props.original.name}
                        recordings={recordings} 
                        setRecordings={setRecordings}
                    />
                </View>
            </View>
        )
    };

    return (
        <SafeAreaProvider>
            <SafeAreaView style={styles.container}>
                <FlatList
                    data={originals}
                    renderItem={({item, index}) => <Shadowing original={item} index={index} />}
                    keyExtractor={(_item, index) => String(index)}
                />
            </SafeAreaView>
        </SafeAreaProvider>
    )
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#212529'
    },
    nativeSpeechBtn: {
        marginTop: 5,
        marginBottom: 10,
        width: 320,
        backgroundColor: '#343a40',
        paddingVertical: 20,
        paddingHorizontal: 15,
        borderBottomRightRadius: 8,
        borderTopRightRadius: 8
    },
    playAndPauseIcon: {
        width: 24,
        height: 24
    },
    recordingBtnsWrapper: {
        width: 320,
        alignSelf: 'flex-end'
    },
    listenBtn: {
        flex: 1,
    },
    shadowing: {
        alignItems: 'flex-start',
    },
    message: {
        marginTop: 10,
        padding: 10,
        color: '#c3c3c3',
        backgroundColor: '#343a40',
        borderBottomRightRadius: 8,
        borderTopRightRadius: 8
    },
})