import { Audio } from "expo-av";

export default interface Sound {
    name: string;
    uri: string;
    progress: number;
    sound?: Audio.Sound;
}