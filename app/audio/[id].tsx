import React from "react";
import AudioChunk from "@/interfaces/AudioChunk";
import { Recording } from "@/interfaces/Recording";
import { FlatList, Pressable, StyleSheet, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { SERVER_HOST } from "@/utils/constants";
import { playFromUri } from "@/utils/functions";

import RecordAndListen from "@/components/RecordAndListen";
import Ionicons from '@expo/vector-icons/Ionicons';

export default function AudioScreen() {
    const { id } = useLocalSearchParams();
    const [originals, setOriginals] = React.useState<Array<AudioChunk | null>>([]);
    const [recordings, setRecordings] = React.useState<Array<Recording | null>>([]);

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
    
    const Shadowing = (props: {original: AudioChunk | null, index: number}) => {
        if (props.original == null) return
        return (
            <View>
                <Pressable
                    style={styles.nativeSpeechBtn}
                    onPress={async () => {
                        await playFromUri((originals[props.index] as AudioChunk).path)
                    }}
                ><Ionicons name="play" size={36} color="#d3d3d3" /></Pressable>
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
        marginVertical: 10,
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
})