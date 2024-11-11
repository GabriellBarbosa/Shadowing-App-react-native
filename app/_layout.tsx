import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerTitle: 'Audios' }} />
      <Stack.Screen name="audio/[id]" options={{ headerTitle: 'Listen and Repeat' }} />
    </Stack>
  );
}
