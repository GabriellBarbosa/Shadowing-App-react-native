import React from "react";
import { StyleSheet, View } from "react-native";

interface Props {
    value: number;
    backgroundColor: string;
    trackPositionColor: string;
}

export default function ProgressBar(props: Props) {
    return (
        <View style={{...styles.track, backgroundColor: props.backgroundColor}}>
            <View style={{
                height: '100%',
                width: `${props.value * 100}%`,
                backgroundColor: props.trackPositionColor,
            }} />
        </View>
    )
}

const styles = StyleSheet.create({
    track: {
        height: 3,
        flex: 1,
        borderRadius: 4,
        overflow: 'hidden'
    },
})