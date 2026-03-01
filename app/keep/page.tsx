import { KeepListPage } from "@/components/keep/keep-list-page";
import { getWords } from "@/lib/ngsl";

export default function KeepPage() {
  const words = getWords();
  return <KeepListPage words={words} />;
}
