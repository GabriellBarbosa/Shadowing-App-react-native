import React from "react";
import { FlatList, StyleSheet } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { SERVER_HOST } from "@/utils/constants";
import { PlayingContext } from "@/contexts/PlayingContext";
import Sound from "@/interfaces/Sound";
import Shadowing from '@/components/Shadowing';

type RawSound = { name: string, path: string } | null;

export default function AudioScreen() {
    const { id } = useLocalSearchParams();
    const { 
        originalSounds,
        setOriginalSounds,
        setRecordingSounds,
        reset
    } = React.useContext(PlayingContext);

    React.useEffect(() => {
        return () => reset();
    }, [])

    React.useEffect(() => {
        fetch(`${SERVER_HOST}/audio/${id}`)
        .then((res) => res.json())
        .then((rawSounds) => setOriginalSounds(createSounds(rawSounds, 'original')))
        .catch((err) => console.error(err));
    }, []);

    React.useEffect(() => {
        fetch(`${SERVER_HOST}/recording/${id}`)
        .then((res) => res.json())
        .then((rawSounds) => setRecordingSounds(createSounds(rawSounds, 'rec')))
        .catch((err) => console.error(err));
    }, []);

    function createSounds(arg: RawSound[], type: 'rec' | 'original') {
        const result: Sound[] = [];
        arg.forEach((rawSound, index) => {
            if (rawSound) {
                result.push({
                    index,
                    type,
                    name: rawSound.name,
                    uri: rawSound.path,
                    sound: undefined,
                    progress: 0,
                    isPlaying: false
                });
            }
        });
        return result;
    }

    return (
        <SafeAreaProvider>
            <SafeAreaView style={styles.container}>
                <FlatList
                    keyExtractor={(_item, index) => String(index)}
                    data={originalSounds}
                    renderItem={({item, index}) => (
                        <Shadowing 
                            index={index} 
                            original={item} 
                            audioName={id as string} 
                        />
                    )}
                />
            </SafeAreaView>
        </SafeAreaProvider>
    )
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#212529'
    },
})