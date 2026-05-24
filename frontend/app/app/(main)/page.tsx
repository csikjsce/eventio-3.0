import HomeScreen from "@/components/screens/HomeScreen";
import OnboardingGuard from "@/components/OnboardingGuard";

export default function HomePage() {
  return (
    <>
      <OnboardingGuard />
      <HomeScreen />
    </>
  );
}
