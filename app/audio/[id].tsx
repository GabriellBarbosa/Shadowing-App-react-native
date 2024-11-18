import React from "react";
import { Button, FlatList, StyleSheet, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { Audio } from 'expo-av';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { SERVER_HOST } from "@/utils/constants";
import AudioChunk from "@/interfaces/AudioChunk";

import RecordAndListen from "@/components/RecordAndListen";

interface Original {
    name: string;
    path: string;
}

export default function AudioScreen() {
    const { id } = useLocalSearchParams();
    const [recordings, setRecordings] = React.useState<Array<AudioChunk | null>>([]);
    const [originals, setOriginals] = React.useState<Array<Original | null>>([]);

    React.useEffect(() => {
        fetch(`${SERVER_HOST}/audio/${id}`)
        .then((res) => res.json())
        .then((URIs) => setOriginals(URIs))
        .catch((err) => console.error(err));
    }, []);

    React.useEffect(() => {
        fetch(`${SERVER_HOST}/recording/${id}`)
        .then((res) => res.json())
        .then(async (audios) => {
            const loadedAudios = await loadAudios(audios);
            setRecordings(loadedAudios);
        })
        .catch((err) => console.error(err));
    }, []);
    
    async function playFromUri(uri: string) {
        const sound = new Audio.Sound();
        await sound.loadAsync({uri});
        await sound.playAsync();
    }

    async function loadAudios(audiosUrl: string[]) {
        const result = [];
        for await (const url of audiosUrl) {
            if (url) {
                const { sound } = await Audio.Sound.createAsync({uri: `${SERVER_HOST}/${url}`});
                result.push({sound, name: getNameFromUrl(url)});
            } else {
                result.push(null);
            }
        }
        return result;

        function getNameFromUrl(url: string) {
            return url.split('/').pop() ?? '';
        }
    }

    const Shadowing = (props: {original: Original | null, index: number}) => {
        if (props.original == null) return
        return (
            <View style={styles.wrapper}>
                <View style={styles.nativeSpeechBtn}>
                    <Button
                        onPress={async () => await playFromUri(originals[props.index]?.path ?? '')}
                        title="Original"
                    />
                </View>
                <RecordAndListen
                    index={props.index} 
                    audioName={id as string}
                    chunkName={props.original.name}
                    recordings={recordings} 
                    setRecordings={setRecordings}
                />
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
        flex: 1,
        padding: 10 
    },
    wrapper: {
        marginVertical: 10
    },
    nativeSpeechBtn: {
        marginBottom: 1
    }
})