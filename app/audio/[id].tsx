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
        setRecordingSounds
    } = React.useContext(PlayingContext);

    React.useEffect(() => {
        fetch(`${SERVER_HOST}/audio/${id}`)
        .then((res) => res.json())
        .then((rawSounds) => setOriginalSounds(createSounds(rawSounds)))
        .catch((err) => console.error(err));
    }, []);

    React.useEffect(() => {
        fetch(`${SERVER_HOST}/recording/${id}`)
        .then((res) => res.json())
        .then((rawSounds) => setRecordingSounds(createSounds(rawSounds)))
        .catch((err) => console.error(err));
    }, []);

    function createSounds(arg: RawSound[]) {
        const result: Sound[] = [];
        arg.forEach((rawSound) => {
            if (rawSound) {
                result.push({
                    name: rawSound.name,
                    uri: rawSound.path,
                    sound: undefined,
                    progress: 0,
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