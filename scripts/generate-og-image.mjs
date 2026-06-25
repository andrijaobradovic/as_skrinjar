import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import sharp from "sharp";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const logoPath = join(root, "public", "logo.png");
const outputPath = join(root, "public", "og-image.png");

const WIDTH = 1200;
const HEIGHT = 630;
const BACKGROUND = "#0a0a0a";
const TAGLINE_LINE_1 = "Autoservis, chiptuning i prodaja automobila";
const TAGLINE_LINE_2 = "na jednom mestu!";
const TAGLINE_COLOR = "#a1a1aa";

const logo = await sharp(readFileSync(logoPath))
  .resize({
    width: 520,
    height: 320,
    fit: "inside",
    withoutEnlargement: true,
  })
  .toBuffer();

const logoInfo = await sharp(logo).metadata();
const logoWidth = logoInfo.width ?? 520;
const logoHeight = logoInfo.height ?? 320;

const taglineBlockHeight = 72;
const gap = 28;
const contentHeight = logoHeight + gap + taglineBlockHeight;
const logoTop = Math.round((HEIGHT - contentHeight) / 2);
const logoLeft = Math.round((WIDTH - logoWidth) / 2);
const taglineTop = logoTop + logoHeight + gap;

const taglineSvg = Buffer.from(
  `<svg width="${WIDTH}" height="${taglineBlockHeight}" xmlns="http://www.w3.org/2000/svg">
    <style>
      .tagline {
        fill: ${TAGLINE_COLOR};
        font-family: Arial, Helvetica, sans-serif;
        font-size: 28px;
        font-weight: 500;
      }
    </style>
    <text x="50%" y="28" text-anchor="middle" class="tagline">${TAGLINE_LINE_1}</text>
    <text x="50%" y="64" text-anchor="middle" class="tagline">${TAGLINE_LINE_2}</text>
  </svg>`
);

await sharp({
  create: {
    width: WIDTH,
    height: HEIGHT,
    channels: 4,
    background: BACKGROUND,
  },
})
  .composite([
    { input: logo, top: logoTop, left: logoLeft },
    { input: taglineSvg, top: taglineTop, left: 0 },
  ])
  .png()
  .toFile(outputPath);

console.log(`Generated ${outputPath}`);
