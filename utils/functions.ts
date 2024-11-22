import { Audio } from "expo-av";


async function playFromUri(uri: string) {
    const sound = new Audio.Sound();
    await sound.loadAsync({uri});
    await sound.playAsync();
}

export { playFromUri }