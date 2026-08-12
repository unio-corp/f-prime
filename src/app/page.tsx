import { MoodboardGrid } from "@/components/sites/www-magdabutrym-com-f039a414/it-en-moodboard-official-834833dd/MoodboardGrid";

/**
 * Clone of the moodboard section of
 * https://www.magdabutrym.com/it-en/moodboard-official ("Elevated Forms").
 *
 * Scope is the grid and its products preview modal only — the site chrome
 * (promo bar, header, footer) is intentionally not part of this clone.
 */
export default function Home() {
  return (
    <div className="mb-site flex min-h-full flex-col">
      <main>
        <MoodboardGrid />
      </main>
    </div>
  );
}
