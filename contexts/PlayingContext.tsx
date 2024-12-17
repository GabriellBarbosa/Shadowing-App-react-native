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
    reset: () => void;
}

export const PlayingContext = React.createContext<Props>({
    originalSounds: [],
    recordingSounds: [],
    playingSound: undefined,
    setOriginalSounds: (_arg: Sound[]) => {},
    setRecordingSounds: (_arg: Sound[]) => {},
    setPlayingSound: (_arg: Sound) => {},
    reset: () => {}
});

export function PlayingProvider(props: React.PropsWithChildren) {
    const [playingSound, setPlayingSound] = React.useState<Sound>();
    const [originalSounds, setOriginalSounds] = React.useState<Sound[]>([]);
    const [recordingSounds, setRecordingSounds] = React.useState<Sound[]>([]);
    const lastSound = React.useRef<Sound>();

    React.useEffect(() => {
        handlePauseAndPlay();
        handlePlayingStatus();
    }, [playingSound]);

    function handlePauseAndPlay() {
        if (lastSound.current) {
            handleLastSoundPauseAndPlay();
        } else {
            playSoundAndSetAsLastSound();
        }
    }

    function handleLastSoundPauseAndPlay() {
        lastSound.current?.sound?.getStatusAsync().then((lastSoundStatus) => {
            if (isPlaying(lastSoundStatus) && !isEqual(playingSound, lastSound.current)) {
                lastSound.current?.sound?.pauseAsync();
            }
            if (shouldPlayNewSound(lastSoundStatus)) {
                playSoundAndSetAsLastSound();
            }
        });
    }

    function shouldPlayNewSound(lastSoundStatus: AVPlaybackStatus) {
        return (
            (isEqual(playingSound, lastSound.current) && !isPlaying(lastSoundStatus)) ||
            !isEqual(playingSound, lastSound.current)
        )
    }

    function isEqual(playingSound?: Sound, lastSound?: Sound) {
        return (
            lastSound?.index == playingSound?.index && 
            lastSound?.type == playingSound?.type
        );
    }

    function isPlaying(status: AVPlaybackStatus) {
        return status.isLoaded && status.isPlaying;
    }

    async function playSoundAndSetAsLastSound() {
        playingSound?.sound?.playAsync().then(() => {
            lastSound.current = playingSound;
        });
    }

    function handlePlayingStatus() {
        playingSound?.sound?.setOnPlaybackStatusUpdate((status) => {
            if (status.isLoaded) {
                updatePlayingState(playingSound, status)
            }
        })
    }

    function updatePlayingState(playingSound: Sound, status: AVPlaybackStatus) {
        if (playingSound.type == 'rec') {
            const recordingsCopy = [...recordingSounds];
            recordingsCopy[playingSound.index].isPlaying = isPlaying(status);
            setRecordingSounds(recordingsCopy);
        }
        if (playingSound.type == 'original') {
            const originalsCopy = [...originalSounds];
            originalsCopy[playingSound.index].isPlaying = isPlaying(status);
            setOriginalSounds(originalsCopy);
        }  
    }

    async function reset() {
        await playingSound?.sound?.stopAsync();
        await lastSound.current?.sound?.stopAsync();
        lastSound.current = undefined;
        setPlayingSound(undefined);
        setOriginalSounds([]);
        setRecordingSounds([]);
    }

    return (
        <PlayingContext.Provider 
            value={{
                originalSounds,
                recordingSounds,
                playingSound,
                setOriginalSounds,
                setRecordingSounds,
                setPlayingSound,
                reset
            }
        }>
            {props.children}
        </PlayingContext.Provider>
    )
}
