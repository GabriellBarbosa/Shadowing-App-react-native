import { Audio } from "expo-av";

export default interface Sound {
    index: number;
    name: string;
    uri: string;
    progress: number;
    sound?: Audio.Sound;
    type: 'rec' | 'original'
}