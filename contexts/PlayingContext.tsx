import React from "react";
import Sound from "@/interfaces/Sound";
import { AVPlaybackStatus, AVPlaybackStatusSuccess } from "expo-av";

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
        handleSoundStatus();
    }, [playingSound]);

    function handlePauseAndPlay() {
        if (lastSound.current) {
            handleLastSoundPauseAndPlayNewOne();
        } else {
            playSoundAndSetAsLastSound();
        }
    }

    function handleLastSoundPauseAndPlayNewOne() {
        lastSound.current?.sound?.getStatusAsync().then((lastSoundStatus) => {
            if (isPlaying(lastSoundStatus)) {
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

    function playSoundAndSetAsLastSound() {
        playingSound?.sound?.playFromPositionAsync(0).then(() => {
            lastSound.current = playingSound;
        });
    }

    function handleSoundStatus() {
        playingSound?.sound?.setOnPlaybackStatusUpdate((status) => {
            if (status.isLoaded) {
                let progress = calcProgress(status);
                updateProgress(playingSound, progress);
                updatePlayingState(playingSound, status)
            }
        })
    }

    function calcProgress(status: AVPlaybackStatusSuccess) {
        const duration = status.durationMillis ?? 0;
        return status.positionMillis / duration;
    }

    function updateProgress(playingSound: Sound, progress: number) {
        if (playingSound.type == 'rec') {
            const recordingsCopy = [...recordingSounds];
            recordingsCopy[playingSound.index].progress = progress;
            setRecordingSounds(recordingsCopy);
        }
        if (playingSound.type == 'original') {
            const originalsCopy = [...originalSounds];
            originalsCopy[playingSound.index].progress = progress;
            setOriginalSounds(originalsCopy);
        }
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
