import { Audio } from "expo-av";

async function playAudio(audio: Audio.Sound) {
    await audio.setPositionAsync(0);
    await audio.playAsync();
}

async function playFromUri(uri: string) {
    const sound = new Audio.Sound();
    await sound.loadAsync({uri});
    await sound.playAsync();
}

export {
    playAudio,
    playFromUri
}