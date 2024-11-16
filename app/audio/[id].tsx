import React from "react";
import { Button, FlatList, StyleSheet, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { Audio } from 'expo-av';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { SERVER_HOST } from "@/utils/constants";
import { playAudio } from "@/utils/functions";
import AudioChunk from "@/interfaces/AudioChunk";

import RecordAndListen from "@/components/RecordAndListen";

export default function AudioScreen() {
    const { id } = useLocalSearchParams();
    const [audios, setAudios] = React.useState<Array<AudioChunk | null>>([]);
    const [recordings, setRecordings] = React.useState<Array<AudioChunk | null>>([]);

    React.useEffect(() => {
        fetch(`${SERVER_HOST}/audio/${id}`)
        .then((res) => res.json())
        .then(async (audios) => {
            const loadedAudios = await loadAudios(audios);
            setAudios(loadedAudios);
        })
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

    const Shadowing = (props: {audio: AudioChunk | null, index: number}) => {
        if (props.audio == null) return
        return (
            <View style={styles.wrapper}>
                <View style={styles.nativeSpeechBtn}>
                    <Button
                        onPress={async () => await playAudio((props.audio as AudioChunk).sound)}
                        title="Native"
                    />
                </View>
                <RecordAndListen
                    index={props.index} 
                    audioName={id as string}
                    chunkName={props.audio.name}
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
    wrapper: {
        marginVertical: 10
    },
    nativeSpeechBtn: {
        marginBottom: 1
    }
})