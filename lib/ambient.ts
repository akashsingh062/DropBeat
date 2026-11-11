import { FastAverageColor } from "fast-average-color";

let facInstance: FastAverageColor | null = null;

function getFAC() {
  if (typeof window === "undefined") return null;
  if (!facInstance) {
    facInstance = new FastAverageColor();
  }
  return facInstance;
}

export async function extractDominantColor(imageUrl: string): Promise<{
  hex: string;
  rgb: string;
  glow: string;
  accentMuted: string;
}> {
  const fallback = {
    hex: "#252b3b",
    rgb: "37, 43, 59",
    glow: "rgba(37, 43, 59, 0.25)",
    accentMuted: "rgba(37, 43, 59, 0.45)"
  };

  if (typeof window === "undefined") return fallback;

  try {
    const fac = getFAC();
    if (!fac) return fallback;

    const color = await fac.getColorAsync(imageUrl, {
      algorithm: "dominant",
      ignoredColor: [
        [255, 255, 255, 255, 50], // skip white
        [0, 0, 0, 255, 50] // skip pure black
      ]
    });

    const [r, g, b] = color.value;
    // ensure contrast by keeping brightness measured
    const clampedR = Math.max(25, Math.min(230, r));
    const clampedG = Math.max(25, Math.min(230, g));
    const clampedB = Math.max(25, Math.min(230, b));

    return {
      hex: color.hex,
      rgb: `${clampedR}, ${clampedG}, ${clampedB}`,
      glow: `rgba(${clampedR}, ${clampedG}, ${clampedB}, 0.22)`,
      accentMuted: `rgba(${clampedR}, ${clampedG}, ${clampedB}, 0.45)`
    };
  } catch {
    return fallback;
  }
}

export function applyAmbientTheme(color: { rgb: string; glow: string; accentMuted: string; hex: string }) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.style.setProperty("--ambient-rgb", color.rgb);
  root.style.setProperty("--ambient-glow", color.glow);
  root.style.setProperty("--track-accent", color.hex);
  root.style.setProperty("--track-accent-muted", color.accentMuted);
}

