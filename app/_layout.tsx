import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import {
  Outfit_400Regular, Outfit_500Medium, Outfit_600SemiBold,
} from '@expo-google-fonts/outfit';
import { Newsreader_500Medium } from '@expo-google-fonts/newsreader';

export default function RootLayout() {
  const [loaded] = useFonts({
    Outfit_400Regular,
    Outfit_500Medium,
    Outfit_600SemiBold,
    Newsreader_500Medium,
  });

  if (!loaded) return null;

  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }} />
    </>
  );
}
