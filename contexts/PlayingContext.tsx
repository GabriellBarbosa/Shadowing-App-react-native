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

    return (
        <PlayingContext.Provider value={{ playingSound, setPlayingSound }}>
            {props.children}
        </PlayingContext.Provider>
    )
}
