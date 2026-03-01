import ngslData from "@/data/ngsl.json";
import { WordItem } from "@/lib/types";

const words = ngslData as WordItem[];

export function getWords(): WordItem[] {
  return words.slice().sort((a, b) => a.rank - b.rank);
}
