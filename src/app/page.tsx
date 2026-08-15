import { MoodboardGrid } from "@/components/moodboard/MoodboardGrid";
import { getAllMoodItems } from "@/lib/moodboard/source";

/**
 * La moodboard di Femmina Prime: una griglia editoriale di Tile, ognuna
 * apre un'anteprima. I contenuti sono letti sul server attraverso la
 * sorgente della moodboard e passati alla griglia come props.
 */
export default async function Home() {
  const items = await getAllMoodItems();

  return (
    <div className="fp-site flex min-h-full flex-col">
      <main>
        <MoodboardGrid items={items} />
      </main>
    </div>
  );
}
