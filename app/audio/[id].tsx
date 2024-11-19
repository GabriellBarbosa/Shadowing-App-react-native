import React from "react";
import AudioChunk from "@/interfaces/AudioChunk";
import { Recording } from "@/interfaces/Recording";
import { Button, FlatList, StyleSheet, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { SERVER_HOST } from "@/utils/constants";
import { playFromUri } from "@/utils/functions";

import RecordAndListen from "@/components/RecordAndListen";

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
                <View style={styles.nativeSpeechBtn}>
                    <Button
                        onPress={async () => {
                            await playFromUri((originals[props.index] as AudioChunk).path)
                        }}
                        title="Original"
                    />
                </View>
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
        marginVertical: 15,
        width: 320
    },
    recordingBtnsWrapper: {
        width: 320,
        alignSelf: 'flex-end'
    }
})