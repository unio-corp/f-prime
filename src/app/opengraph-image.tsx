import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const alt = "Moodboard — Femmina Prime";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const CREAM = "#fcfaf7";
const INK = "#000";
const MUTED = "#616161";

export default async function OpengraphImage() {
  const playfair = await readFile(
    join(process.cwd(), "src/app/fonts/PlayfairDisplay-Medium.ttf"),
  );

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: CREAM,
          fontFamily: "Playfair Display",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 40,
            left: 40,
            right: 40,
            bottom: 40,
            border: `1px solid ${INK}`,
          }}
        />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <div
            style={{
              fontSize: 22,
              letterSpacing: 14,
              color: MUTED,
              textTransform: "uppercase",
            }}
          >
            Moodboard
          </div>
          <div
            style={{
              marginTop: 44,
              display: "flex",
              fontSize: 92,
              letterSpacing: 6,
              color: INK,
              textTransform: "uppercase",
            }}
          >
            Femmina Prime
          </div>
          <div
            style={{ marginTop: 48, width: 96, height: 1, background: INK }}
          />
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: "Playfair Display",
          data: playfair,
          weight: 500,
          style: "normal",
        },
      ],
    },
  );
}
