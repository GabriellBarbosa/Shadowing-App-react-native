import React from "react";
import Sound from "@/interfaces/Sound";

interface Props {
    originalSounds: Sound[];
    recordingSounds: Sound[];
    playingSound?: Sound;
    setOriginalSounds: (arg: Sound[]) => void;
    setRecordingSounds: (arg: Sound[]) => void;
    setPlayingSound: (arg: Sound) => void;
}

export const PlayingContext = React.createContext<Props>({
    originalSounds: [],
    recordingSounds: [],
    playingSound: undefined,
    setOriginalSounds: (_arg: Sound[]) => {},
    setRecordingSounds: (_arg: Sound[]) => {},
    setPlayingSound: (_arg: Sound) => {},

});

export function PlayingProvider(props: React.PropsWithChildren) {
    const [playingSound, setPlayingSound] = React.useState<Sound>();
    const [originalSounds, setOriginalSounds] = React.useState<Sound[]>([]);
    const [recordingSounds, setRecordingSounds] = React.useState<Sound[]>([]);
    const lastPlayed = React.useRef<Sound>();

    React.useEffect(() => {
        if (lastPlayed.current?.sound) {
            lastPlayed.current.sound.getStatusAsync().then((status) => {
                if (status.isLoaded && status.isPlaying) {
                    pauseLastSoundAndPlayNewOne();
                } else {
                    playSoundAndSetLastPlayed();
                }
            });
        } else {
            playSoundAndSetLastPlayed();
        }
    }, [playingSound]);

    function pauseLastSoundAndPlayNewOne() {
        lastPlayed.current?.sound?.pauseAsync().then(() => {
            playSoundAndSetLastPlayed();
        })
    }

    function playSoundAndSetLastPlayed() {
        if (playingSound?.sound) {
            playingSound.sound.playAsync().then(() => {
                lastPlayed.current = playingSound;
            });
        }
    }

    return (
        <PlayingContext.Provider 
            value={{
                originalSounds,
                recordingSounds,
                playingSound,
                setOriginalSounds,
                setRecordingSounds,
                setPlayingSound
            }
        }>
            {props.children}
        </PlayingContext.Provider>
    )
}
