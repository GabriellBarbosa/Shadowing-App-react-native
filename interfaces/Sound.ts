import { Audio } from "expo-av";

export default interface Sound {
    index: number;
    name: string;
    uri: string;
    sound?: Audio.Sound;
    type: 'rec' | 'original';
    isPlaying: boolean;
}