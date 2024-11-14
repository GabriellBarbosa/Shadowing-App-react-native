import { Audio } from "expo-av";

async function playAudio(audio: Audio.Sound) {
    await audio.setPositionAsync(0);
    await audio.playAsync();
}

export {
    playAudio
}