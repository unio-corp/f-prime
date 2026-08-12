import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default async function AppleIcon() {
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
          background: "#000",
          color: "#fcfaf7",
          fontFamily: "Playfair Display",
          fontSize: 148,
          paddingBottom: 6,
        }}
      >
        F
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
