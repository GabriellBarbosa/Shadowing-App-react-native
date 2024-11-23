import { Stack } from "expo-router";
import { PlayingProvider } from "@/contexts/PlayingContext";

export default function RootLayout() {
  return (
    <PlayingProvider>
      <Stack>
        <Stack.Screen name="index" options={{ headerTitle: 'Audios' }} />
        <Stack.Screen name="audio/[id]" options={{ headerTitle: 'Listen and Repeat' }} />
      </Stack>
    </PlayingProvider>
  );
}
