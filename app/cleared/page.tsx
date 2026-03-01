import { ClearedListPage } from "@/components/cleared/cleared-list-page";
import { getWords } from "@/lib/ngsl";

export default function ClearedPage() {
  const words = getWords();
  return <ClearedListPage words={words} />;
}
