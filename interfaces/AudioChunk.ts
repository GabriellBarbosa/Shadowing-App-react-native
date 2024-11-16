import { Audio } from "expo-av";

export default interface AudioChunk {
    sound: Audio.Sound;
    name: string;
}