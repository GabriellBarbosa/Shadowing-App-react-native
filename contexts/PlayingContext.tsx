import React from "react";
import { Audio } from "expo-av";

interface PlayingSound {
    sound: Audio.Sound;
    index: number;
    type: 'rec' | 'original';
}

interface Props {
    playingSound: PlayingSound | undefined;
    setPlayingSound: (arg: PlayingSound | undefined) => void;
}

export const PlayingContext = React.createContext<Props>({
    playingSound: undefined,
    setPlayingSound: (_arg: PlayingSound | undefined) => {}
});

export function PlayingProvider(props: React.PropsWithChildren) {
    const [playingSound, setPlayingSound] = React.useState<PlayingSound>();

    React.useEffect(() => {
        if (playingSound)
            resetPlayingSoundWhenFinished(playingSound.sound);
    }, [playingSound])

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
        <PlayingContext.Provider value={{ playingSound, setPlayingSound }}>
            {props.children}
        </PlayingContext.Provider>
    )
}
