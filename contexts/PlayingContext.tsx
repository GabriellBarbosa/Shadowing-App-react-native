import React from "react";
import Sound from "@/interfaces/Sound";
import { Audio } from "expo-av";

interface PlayingSound {
    sound: Audio.Sound;
    index: number;
    type: 'rec' | 'original';
}

interface Props {
    playingSound: PlayingSound | undefined;
    setPlayingSound: (arg: PlayingSound | undefined) => void;
    progress: number;
    originalSounds: Sound[];
    setOriginalSounds: (arg: Sound[]) => void;
}

export const PlayingContext = React.createContext<Props>({
    progress: 0,
    playingSound: undefined,
    setPlayingSound: (_arg: PlayingSound | undefined) => {},
    originalSounds: [],
    setOriginalSounds: (_arg: Sound[]) => {},
});

export function PlayingProvider(props: React.PropsWithChildren) {
    const [originalSounds, setOriginalSounds] = React.useState<Sound[]>([]);

    const [playingSound, setPlayingSound] = React.useState<PlayingSound>();
    const [progress, setProgress] = React.useState<number>(0);

    React.useEffect(() => {
        if (playingSound) {
            updateProgress(playingSound.sound);
            resetProgressWhenFinished(playingSound.sound);
            resetPlayingSoundWhenFinished(playingSound.sound);
        }
    }, [playingSound])

    async function updateProgress(sound: Audio.Sound) {
        sound.setOnPlaybackStatusUpdate((status) => {
            if (status.isLoaded && status.isPlaying) {
                const duration = status.durationMillis ?? 0;
                setProgress(status.positionMillis / duration);
            }
        })
    }

    async function resetProgressWhenFinished(sound: Audio.Sound) {
        const intervalId = setInterval(async () => {
            if (await didJustFinished(sound)) {
                clearInterval(intervalId);
                setProgress(0);
            }
        }, 500);
    }

    async function resetPlayingSoundWhenFinished(sound: Audio.Sound) {
        const intervalId = setInterval(async () => {
            if (await didJustFinished(sound)) {
                clearInterval(intervalId);
                setPlayingSound(undefined);
            }
        }, 500);
    }

    async function didJustFinished(sound: Audio.Sound) {
        const status = await sound.getStatusAsync();
        return status.isLoaded && status.positionMillis == status.durationMillis;
    }

    return (
        <PlayingContext.Provider 
            value={{
                playingSound, 
                setPlayingSound,
                progress,
                originalSounds,
                setOriginalSounds
            }
        }>
            {props.children}
        </PlayingContext.Provider>
    )
}
