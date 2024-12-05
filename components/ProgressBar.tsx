import React from "react";
import { StyleSheet, View } from "react-native";
import Animated, { useSharedValue, withSpring } from 'react-native-reanimated';

interface Props {
    value: number;
}

export default function ProgressBar(props: Props) {
    const width = useSharedValue<number>(props.value);
    
    React.useEffect(() => {
        width.value = withSpring(props.value);
    }, [props.value]);


    return (
        <View style={styles.track}>
            <Animated.View style={{
                height: '100%',
                width: `${width.value * 100}%`,
                backgroundColor: '#02c39a',
            }} />
        </View>
    )
}

const styles = StyleSheet.create({
    track: {
        height: 3,
        flex: 1,
        backgroundColor: '#343a40',
        borderRadius: 4,
        overflow: 'hidden'
    },
})