import React from "react";
import { Text } from "react-native";
import { useLocalSearchParams } from "expo-router";

export default function AudioScreen() {
    const { id } = useLocalSearchParams();

    React.useEffect(() => {
    fetch(`http://127.0.0.1:5000/audio/${id}`)
        .then((res) => res.json())
        .then((json) => console.log(json))
        .catch((err) => console.error(err));
    }, []);

    return (
        <Text>Hello my dear world!</Text>
    )
}