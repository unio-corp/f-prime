import { MoodboardGrid } from "@/components/moodboard/MoodboardGrid";
import { getAllMoodItems } from "@/lib/moodboard/source";

/**
 * The Femmina Prime moodboard: an editorial grid of Tiles, each opening a
 * products preview. Content is read on the server through the moodboard
 * source and handed to the grid as props.
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
