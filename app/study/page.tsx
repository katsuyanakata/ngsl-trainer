import { LearnPage } from "@/components/learn/learn-page";
import { getWords } from "@/lib/ngsl";

export default function StudyPage() {
  const words = getWords();

  return <LearnPage words={words} />;
}
