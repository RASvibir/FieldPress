import { chromium } from "playwright";
import { mkdir } from "fs/promises";

const base = process.env.SCREENSHOT_BASE || "http://127.0.0.1:4173";
const outDir = "/opt/cursor/artifacts/screenshots";
await mkdir(outDir, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });

async function shot(name) {
  await page.screenshot({ path: `${outDir}/${name}`, fullPage: false });
}

await page.goto(base, { waitUntil: "networkidle", timeout: 60000 });
await page.waitForTimeout(1200);
await shot("home-1280x800.png");

await page.getByRole("button", { name: "Explore" }).click();
await page.waitForTimeout(800);
await shot("explore-1280x800.png");

await page.locator("header").getByRole("button", { name: "Post" }).click();
await page.waitForTimeout(600);
await shot("post-compose-1280x800.png");

await page.getByPlaceholder(/What.s happening/).fill(
  "Bridge inspection underway\nCrews checked the deck after overnight storms."
);
await page.getByRole("button", { name: "Photo" }).click();
await page.getByRole("button", { name: "Paste image URL" }).click();
await page.getByPlaceholder("https://").fill(`${base}/pressyo-icon.jpg`);
await page.getByRole("button", { name: "Add", exact: true }).click();
await page.waitForTimeout(600);
const captionVal = await page.getByLabel("Caption").inputValue();
if (captionVal.trim()) {
  throw new Error(`Caption should be empty after URL add, got: ${captionVal}`);
}
await shot("post-caption-alt-1280x800.png");

for (const [name, label] of [
  ["post-tray-location-1280x800.png", "Location"],
  ["post-tray-more-1280x800.png", "More"],
  ["post-tray-ai-1280x800.png", "AI"],
]) {
  const btn = page.getByRole("button", { name: label, exact: true });
  if (await btn.count()) {
    await btn.click();
    await page.waitForTimeout(400);
    await shot(name);
    await btn.click().catch(() => {});
  }
}

page.once("dialog", (d) => d.accept());
await page.getByRole("button", { name: "Close" }).click();
await page.waitForTimeout(600);
await page.locator("header").getByRole("button", { name: "Account menu" }).click();
await page.waitForTimeout(400);
await shot("avatar-menu-1280x800.png");

await browser.close();
console.log("Screenshots saved to", outDir);
