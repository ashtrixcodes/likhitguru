import { Stack } from 'expo-router';

export default function SliderLayout() {
	return (
		<Stack screenOptions={{ headerShown: false, presentation: 'transparentModal', animation: 'fade' }} />
	);
}
