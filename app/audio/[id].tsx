import React from "react";
import { Button, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { Audio } from 'expo-av';

export default function AudioScreen() {
    const [audios, setAudios] = React.useState<any[]>([]);
    const { id } = useLocalSearchParams();

    React.useEffect(() => {
    fetch(`http://127.0.0.1:5000/audio/${id}`)
        .then((res) => res.json())
        .then(async (audios) => {
            const loadedAudios = await loadAudios(audios);
            setAudios(loadedAudios);
        })
        .catch((err) => console.error(err));
    }, []);
    
    async function loadAudios(audiosUrl: any[]) {
        const result = [];
        for await (const url of audiosUrl) {
            const loaded = await Audio.Sound.createAsync({
                uri: `http://127.0.0.1:5000/${url}`,
            });
            result.push(loaded.sound);
        }
        return result;
    }

    return (
        <View style={styles.container}>
            {audios && audios.map((audio, index) => (
                <View key={index} style={styles.buttons}>
                    <Button
                        onPress={async () => await audio.playAsync()}
                        title={`Play Audio`}
                    />
                </View>
            ))}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        padding: 10,
        gap: 20
    },
    buttons: {
        display: 'flex',
        gap: 1
    }
})