import { HomePageClient } from "@/components/home/home-page-client";
import { getWords } from "@/lib/ngsl";

export default function HomePage() {
  const words = getWords();
  return <HomePageClient wordCount={words.length} />;
}
