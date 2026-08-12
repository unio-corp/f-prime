import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default async function Icon() {
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
          fontSize: 62,
          // il baseline della F lascia un vuoto in basso: alzo la lettera
          paddingBottom: 2,
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
