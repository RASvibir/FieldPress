import { chromium } from "playwright";
import { mkdir } from "fs/promises";

const base = process.env.SCREENSHOT_BASE || "http://127.0.0.1:4173";
const outDir = "/opt/cursor/artifacts/screenshots";
await mkdir(outDir, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
await page.goto(base, { waitUntil: "networkidle", timeout: 60000 });
await page.waitForTimeout(1500);

await page.screenshot({ path: `${outDir}/home-1280x800.png`, fullPage: false });

await page.getByRole("button", { name: "Explore" }).click();
await page.waitForTimeout(800);
await page.screenshot({ path: `${outDir}/explore-1280x800.png`, fullPage: false });

await page.locator("header").getByRole("button", { name: "Post" }).click();
await page.waitForTimeout(800);
await page.screenshot({ path: `${outDir}/post-compose-1280x800.png`, fullPage: false });

for (const [name, label] of [
  ["post-tray-location", "Location"],
  ["post-tray-more", "More"],
  ["post-tray-ai", "AI"],
]) {
  const btn = page.getByRole("button", { name: label, exact: true });
  if (await btn.count()) {
    await btn.click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: `${outDir}/${name}-1280x800.png`, fullPage: false });
    await btn.click().catch(() => {});
  }
}

await page.locator("header").getByRole("button", { name: "Account menu" }).click();
await page.waitForTimeout(500);
await page.screenshot({ path: `${outDir}/avatar-menu-1280x800.png`, fullPage: false });

await browser.close();
console.log("Saved screenshots to", outDir);
