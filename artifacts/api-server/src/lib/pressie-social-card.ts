import { Resvg } from "@resvg/resvg-js";

const CARD_WIDTH = 1200;
const CARD_HEIGHT = 630;

const PRESSIE_FAVICON_SVG = `
  <rect width="180" height="180" rx="40" fill="#000"/>
  <g
    transform="translate(18 18) scale(2.25)"
    fill="none"
    stroke="#39ff14"
    stroke-width="2.2"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <rect x="22" y="4" width="20" height="6" rx="1.5"/>
    <path d="M32 10v8"/>
    <circle cx="32" cy="22" r="5"/>
    <path d="M18 28h28v6H18z"/>
    <path d="M14 34h36v8H14z"/>
    <circle cx="32" cy="50" r="10"/>
    <circle cx="32" cy="50" r="5.5" opacity=".7"/>
    <path d="M8 58h48" opacity=".45"/>
  </g>
`;

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function splitWords(value: string, maxChars: number, maxLines: number): string[] {
  const words = value.trim().split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = "";

  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;

    if (candidate.length <= maxChars || !line) {
      line = candidate;
      continue;
    }

    lines.push(line);
    line = word;

    if (lines.length === maxLines - 1) {
      break;
    }
  }

  if (line && lines.length < maxLines) {
    lines.push(line);
  }

  const consumed = lines.join(" ").replace(/\s+/g, " ").trim();
  const source = words.join(" ");

  if (lines.length === maxLines && consumed.length < source.length) {
    const last = lines[lines.length - 1];
    lines[lines.length - 1] = `${last.slice(0, Math.max(0, maxChars - 1)).trimEnd()}…`;
  }

  return lines;
}

function textLines(lines: string[], x: number, y: number, size: number, lineHeight: number): string {
  return lines
    .map(
      (line, index) =>
        `<text x="${x}" y="${y + index * lineHeight}" class="headline" font-size="${size}">${escapeXml(line)}</text>`,
    )
    .join("");
}

export function renderPressieSocialCard(input: {
  title: string;
  excerpt?: string;
}): Buffer {
  const title = input.title.trim() || "FieldPress Pressie";
  const excerpt = input.excerpt?.trim() || "";

  const titleLines = splitWords(title, 30, 4);
  const titleSize = titleLines.length >= 4 ? 60 : titleLines.length === 3 ? 68 : 76;
  const titleLineHeight = Math.round(titleSize * 1.12);
  const titleTop = 228;

  const excerptLines = excerpt ? splitWords(excerpt, 64, 2) : [];
  const excerptTop = titleTop + titleLines.length * titleLineHeight + 54;

  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${CARD_WIDTH}" height="${CARD_HEIGHT}" viewBox="0 0 ${CARD_WIDTH} ${CARD_HEIGHT}">
  <defs>
    <linearGradient id="field" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#090b0f"/>
      <stop offset="54%" stop-color="#11161c"/>
      <stop offset="100%" stop-color="#18211f"/>
    </linearGradient>
    <radialGradient id="signal" cx="100%" cy="0%" r="85%">
      <stop offset="0%" stop-color="#b8ff5a" stop-opacity="0.28"/>
      <stop offset="65%" stop-color="#b8ff5a" stop-opacity="0.03"/>
      <stop offset="100%" stop-color="#b8ff5a" stop-opacity="0"/>
    </radialGradient>
    <pattern id="grain" width="38" height="38" patternUnits="userSpaceOnUse">
      <circle cx="4" cy="7" r="1" fill="#ffffff" fill-opacity="0.07"/>
      <circle cx="29" cy="15" r="1" fill="#ffffff" fill-opacity="0.05"/>
      <circle cx="18" cy="31" r="1" fill="#ffffff" fill-opacity="0.06"/>
    </pattern>
    <style>
      .brand { font-family: Arial, Helvetica, sans-serif; font-weight: 700; letter-spacing: 4px; }
      .headline { font-family: Arial, Helvetica, sans-serif; font-weight: 700; fill: #f8faf5; letter-spacing: -1.4px; }
      .excerpt { font-family: Arial, Helvetica, sans-serif; font-weight: 400; fill: #cad3ca; letter-spacing: 0; }
      .footer { font-family: Arial, Helvetica, sans-serif; font-weight: 700; fill: #b8ff5a; letter-spacing: 2.4px; }
    </style>
  </defs>

  <rect width="${CARD_WIDTH}" height="${CARD_HEIGHT}" fill="url(#field)"/>
  <rect width="${CARD_WIDTH}" height="${CARD_HEIGHT}" fill="url(#signal)"/>
  <rect width="${CARD_WIDTH}" height="${CARD_HEIGHT}" fill="url(#grain)"/>

  <path d="M940 0 L1200 0 L1200 278 C1104 226 1020 143 940 0Z" fill="#b8ff5a" fill-opacity="0.13"/>
  <path d="M0 518 C260 422 476 542 702 474 C884 419 1048 443 1200 507 L1200 630 L0 630 Z" fill="#ffffff" fill-opacity="0.035"/>

  <g transform="translate(72 43) scale(0.4)">
    ${PRESSIE_FAVICON_SVG}
  </g>

  <text x="166" y="92" class="brand" font-size="24" fill="#f8faf5">FIELDPRESS</text>
  <text x="72" y="166" class="footer" font-size="16">THE FIELD / PRESSIE</text>

  ${textLines(titleLines, 72, titleTop, titleSize, titleLineHeight)}

  ${
    excerptLines.length
      ? excerptLines
          .map(
            (line, index) =>
              `<text x="74" y="${excerptTop + index * 31}" class="excerpt" font-size="23">${escapeXml(line)}</text>`,
          )
          .join("")
      : ""
  }

  <line x1="72" y1="562" x2="1128" y2="562" stroke="#b8ff5a" stroke-opacity="0.38" stroke-width="2"/>
  <text x="72" y="599" class="footer" font-size="16">A PRESSIE ON FIELDPRESS</text>
  <text x="1128" y="599" text-anchor="end" class="brand" font-size="15" fill="#cad3ca">FIELDPRESS.STUDIO</text>
</svg>`;

  const renderer = new Resvg(svg, {
    fitTo: {
      mode: "width",
      value: CARD_WIDTH,
    },
  });

  return Buffer.from(renderer.render().asPng());
}
