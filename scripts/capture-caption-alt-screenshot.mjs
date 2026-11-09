import { chromium } from "playwright";
import { mkdir } from "fs/promises";

const base = process.env.SCREENSHOT_BASE || "http://127.0.0.1:4174";
const outDir = "/opt/cursor/artifacts/screenshots";
await mkdir(outDir, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
await page.goto(base, { waitUntil: "networkidle", timeout: 60000 });
await page.locator("header").getByRole("button", { name: "Post" }).click();
await page.getByPlaceholder(/What.s happening/).fill(
  "Bridge inspection underway\nCrews checked the deck after overnight storms."
);
await page.getByRole("button", { name: "Photo" }).click();
await page.getByRole("button", { name: "Paste image URL" }).click();
await page.getByPlaceholder("https://").fill(`${base}/pressyo-icon.jpg`);
await page.getByRole("button", { name: "Add", exact: true }).click();
await page.waitForTimeout(800);
await page.screenshot({ path: `${outDir}/post-caption-alt-1280x800.png` });
await browser.close();
console.log("Saved post-caption-alt screenshot");
