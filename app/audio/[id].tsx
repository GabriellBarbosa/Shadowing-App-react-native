import React from "react";
import { Button, FlatList, StyleSheet, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { Audio } from 'expo-av';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import RecordAndListen from "@/components/RecordAndListen";

export default function AudioScreen() {
    const { id } = useLocalSearchParams();
    const [audios, setAudios] = React.useState<Audio.Sound[]>([]);
    const [recordings, setRecordings] = React.useState<Audio.Sound[]>([]);

    React.useEffect(() => {
        fetch(`http://192.168.18.6:5000/audio/${id}`)
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
                uri: `http://192.168.18.6:5000/${url}`,
            });
            result.push(loaded.sound);
        }
        return result;
    }


    const Shadowing = (props: {audio: Audio.Sound, index: number}) => {
        return (
            <View style={styles.wrapper}>
                <View style={styles.nativeSpeechBtn}>
                    <Button
                        onPress={async () => await props.audio.playAsync()}
                        title="Native"
                    />
                </View>
                <RecordAndListen 
                    index={props.index} 
                    recordings={recordings} 
                    setRecordings={setRecordings} />
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