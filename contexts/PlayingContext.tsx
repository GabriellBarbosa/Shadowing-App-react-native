import React from "react";
import Sound from "@/interfaces/Sound";
import { AVPlaybackStatus } from "expo-av";

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
    const lastSound = React.useRef<Sound>();

    React.useEffect(() => {
        handlePauseAndPlay();
    }, [playingSound]);

    function handlePauseAndPlay() {
        if (lastSound.current) {
            handleLastSoundPauseAndPlay();
        } else {
            playAndSetAsLastSound();
        }
    }

    function handleLastSoundPauseAndPlay() {
        lastSound.current?.sound?.getStatusAsync().then((lastSoundStatus) => {
            if (isPlaying(lastSoundStatus)) {
                lastSound.current?.sound?.pauseAsync();
            }
            if (shouldPlay(lastSoundStatus)) {
                playAndSetAsLastSound();
            }
        });
    }

    function shouldPlay(lastSoundStatus: AVPlaybackStatus) {
        return (
            (isTheSame(playingSound, lastSound.current) && !isPlaying(lastSoundStatus)) ||
            !isTheSame(playingSound, lastSound.current)
        )
    }

    function isTheSame(playingSound?: Sound, lastSound?: Sound) {
        return (
            lastSound?.index == playingSound?.index && 
            lastSound?.type == playingSound?.type
        );
    }

    function isPlaying(status: AVPlaybackStatus) {
        return status.isLoaded && status.isPlaying;
    }

    function playAndSetAsLastSound() {
        playingSound?.sound?.playFromPositionAsync(0).then(() => {
            lastSound.current = playingSound;
        });
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
