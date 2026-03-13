import { writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const SITE_URL =
  process.env.SITE_URL?.replace(/\/$/, "") || "https://thetravellib.vercel.app";

async function main() {
  const { promptLibrary } = await import("../src/content/prompts.ts");

  const urls = [
    `  <url>\n    <loc>${SITE_URL}/</loc>\n  </url>`,
    ...promptLibrary
      .filter((p: { slug?: string }) => !!p.slug)
      .map(
        (p: { slug?: string }) =>
          `  <url>\n    <loc>${SITE_URL}/prompts/${p.slug}</loc>\n  </url>`,
      ),
  ];

  const sitemap = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls,
    "</urlset>",
    "",
  ].join("\n");

  const outPath = resolve(__dirname, "../public/sitemap.xml");
  writeFileSync(outPath, sitemap, "utf-8");
  console.log(`Sitemap written to ${outPath} (${urls.length} URLs)`);
}

main();
