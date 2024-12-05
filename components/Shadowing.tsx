import React from "react";
import Ionicons from "@expo/vector-icons/Ionicons";
import Sound from "@/interfaces/Sound";
import RecordAndListen from "./RecordAndListen";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { PlayingContext } from "@/contexts/PlayingContext";
import { Audio } from "expo-av";

interface Props {
    original: Sound;
    index: number;
    audioName: string;
}

export default function Shadowing(props: Props) {
    const { originalSounds } = React.useContext(PlayingContext);

    function isPlaying(audioIndex: number) {
        return false;
    }

    async function playFromUri(uri: string, index: number) {
        const sound = new Audio.Sound();
        await sound.loadAsync({uri});
        await sound.playAsync();
    }

    return (
        <View style={styles.shadowing}>
            <Text style={styles.message}>{props.index + 1} of {originalSounds.length}</Text>
            <Pressable
                style={styles.nativeSpeechBtn}
                onPress={async () => {
                    await playFromUri(props.original?.uri, props.index)
                }}
            >
                <Ionicons
                    name={isPlaying(props.index) ? 'pause' : 'play'}
                    size={36} 
                    color="#d3d3d3" 
                />
            </Pressable>
            <View style={styles.recordingBtnsWrapper}>
                <RecordAndListen
                    index={props.index} 
                    audioName={props.audioName}
                    chunkName={props.original.name}
                />
            </View>
        </View>
    )
};


const styles = StyleSheet.create({
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
    recordingBtnsWrapper: {
        width: 320,
        alignSelf: 'flex-end'
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