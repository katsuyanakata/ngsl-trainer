import { DoneListPage } from "@/components/done/done-list-page";
import { getWords } from "@/lib/ngsl";

export default function DonePage() {
  const words = getWords();
  return <DoneListPage words={words} />;
}
