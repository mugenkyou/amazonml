import type { Team, HistoricalObservation, Player } from "./types";
import { getTeamShareUrl } from "./share";

export type CardType = "both" | "rank" | "score";
export type GraphType = "score" | "rank" | "none";

export interface CardGeneratorOptions {
  team: {
    teamId: string | number;
    teamName: string;
    rank?: string | number | null;
    score?: string | null;
    rankDelta?: number | null;
    scoreDelta?: number | null;
    status?: string | null;
    players?: Player[];
    organizations?: string[];
    finishTime?: string | null;
    lastUpdated?: string | null;
  };
  history?: HistoricalObservation[];
  cardType: CardType;
  graphType: GraphType;
  siteUrl?: string;
  customTimestamp?: string;
}

export const CARD_WIDTH = 1080;
export const CARD_HEIGHT = 1350;

/**
 * Formats a snapshot timestamp into a human-readable string:
 * e.g. "27 Sep 2026 · 4:42 PM IST"
 */
export function formatSnapshotTimestamp(dateInput?: string | Date | null): string {
  if (!dateInput) {
    const now = new Date();
    return `${now.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })} · ${now.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    })} IST`;
  }

  const d = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  if (isNaN(d.getTime())) {
    return String(dateInput);
  }

  const dateStr = d.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const timeStr = d.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return `${dateStr} · ${timeStr} IST`;
}

/**
 * Helper to wrap text into multiple lines given a max width on canvas
 */
function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxLines: number = 2
): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let currentLine = "";

  for (let i = 0; i < words.length; i++) {
    const testLine = currentLine ? `${currentLine} ${words[i]}` : words[i];
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = words[i];
      if (lines.length === maxLines - 1) {
        break;
      }
    } else {
      currentLine = testLine;
    }
  }

  if (currentLine && lines.length < maxLines) {
    lines.push(currentLine);
  }

  return lines;
}

/**
 * Renders the full 1080x1350 share card onto a Canvas 2D Context.
 */
export function renderShareCardToCanvas(
  canvas: HTMLCanvasElement,
  options: CardGeneratorOptions
): void {
  canvas.width = CARD_WIDTH;
  canvas.height = CARD_HEIGHT;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const { team, history = [], cardType, graphType, customTimestamp } = options;

  // 1. Background Fill (Premium Deep Dark Navy with Subtle Gradient)
  const bgGradient = ctx.createLinearGradient(0, 0, 0, CARD_HEIGHT);
  bgGradient.addColorStop(0, "#0D1117");
  bgGradient.addColorStop(0.4, "#131B26");
  bgGradient.addColorStop(1, "#0A0D12");
  ctx.fillStyle = bgGradient;
  ctx.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT);

  // Subtle Mesh / Accent Lighting Glow at the Top
  const glowGradient = ctx.createRadialGradient(
    CARD_WIDTH / 2,
    -100,
    50,
    CARD_WIDTH / 2,
    -100,
    700
  );
  glowGradient.addColorStop(0, "rgba(255, 153, 0, 0.28)");
  glowGradient.addColorStop(0.5, "rgba(228, 121, 17, 0.08)");
  glowGradient.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = glowGradient;
  ctx.fillRect(0, 0, CARD_WIDTH, 600);

  // Top Glowing Accent Bar (Amazon Orange)
  const barGradient = ctx.createLinearGradient(0, 0, CARD_WIDTH, 0);
  barGradient.addColorStop(0, "#FF9900");
  barGradient.addColorStop(0.5, "#FFB84D");
  barGradient.addColorStop(1, "#E47911");
  ctx.fillStyle = barGradient;
  ctx.fillRect(0, 0, CARD_WIDTH, 10);

  // 2. Header Section
  const marginX = 64;
  let cursorY = 60;

  // Subtitle / Competition Pill
  ctx.save();
  ctx.fillStyle = "rgba(255, 153, 0, 0.12)";
  ctx.strokeStyle = "rgba(255, 153, 0, 0.35)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(marginX, cursorY, 320, 38, 8);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "#FF9900";
  ctx.font = "bold 15px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  ctx.textBaseline = "middle";
  ctx.fillText("AMAZON ML CHALLENGE 2026", marginX + 16, cursorY + 19);

  // Unofficial Pill on right
  const unoffPillX = CARD_WIDTH - marginX - 190;
  ctx.fillStyle = "rgba(255, 255, 255, 0.06)";
  ctx.strokeStyle = "rgba(255, 255, 255, 0.12)";
  ctx.beginPath();
  ctx.roundRect(unoffPillX, cursorY, 190, 38, 8);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
  ctx.font = "600 13px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  ctx.fillText("UNOFFICIAL EXPLORER", unoffPillX + 14, cursorY + 19);
  ctx.restore();

  cursorY += 68;

  // 3. Team Name (Large, crisp, auto-wrapping)
  ctx.save();
  ctx.fillStyle = "#FFFFFF";
  ctx.font = "900 48px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  ctx.textBaseline = "top";
  const nameLines = wrapText(ctx, team.teamName || `Team #${team.teamId}`, CARD_WIDTH - marginX * 2, 2);
  for (const line of nameLines) {
    ctx.fillText(line, marginX, cursorY);
    cursorY += 56;
  }
  ctx.restore();

  cursorY += 4;

  // Team ID & Subtitle
  ctx.save();
  ctx.fillStyle = "rgba(255, 255, 255, 0.45)";
  ctx.font = "500 16px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, monospace";
  ctx.textBaseline = "top";
  ctx.fillText(`Contest Team ID: ${team.teamId}`, marginX, cursorY);
  ctx.restore();

  cursorY += 34;

  // 4. Team Members List (Roster Chips)
  const players = team.players || [];
  if (players.length > 0) {
    ctx.save();
    ctx.font = "bold 13px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
    ctx.textBaseline = "top";
    ctx.fillText("TEAM ROSTER", marginX, cursorY);
    cursorY += 22;

    let chipX = marginX;
    let chipY = cursorY;
    const maxChipWidth = CARD_WIDTH - marginX * 2;

    for (let i = 0; i < Math.min(players.length, 4); i++) {
      const p = players[i];
      const memberName = p.name || `Member ${i + 1}`;
      ctx.font = "600 16px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
      const textWidth = ctx.measureText(memberName).width;
      const chipWidth = textWidth + 40;

      if (chipX + chipWidth > marginX + maxChipWidth) {
        chipX = marginX;
        chipY += 44;
      }

      // Chip background
      ctx.fillStyle = "rgba(255, 255, 255, 0.05)";
      ctx.strokeStyle = "rgba(255, 255, 255, 0.12)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(chipX, chipY, chipWidth, 36, 18);
      ctx.fill();
      ctx.stroke();

      // Avatar circle dot
      ctx.fillStyle = "#FF9900";
      ctx.beginPath();
      ctx.arc(chipX + 16, chipY + 18, 5, 0, Math.PI * 2);
      ctx.fill();

      // Member name text
      ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
      ctx.textBaseline = "middle";
      ctx.fillText(memberName, chipX + 28, chipY + 18);

      chipX += chipWidth + 12;
    }
    cursorY = chipY + 54;
    ctx.restore();
  } else {
    cursorY += 15;
  }

  // 5. Main Metrics Section (Rank & F1 Score)
  const rankVal = team.rank ? String(team.rank) : "—";
  const scoreVal = team.score ? String(team.score) : "0.000000";
  const rDelta = team.rankDelta ?? 0;
  const sDelta = team.scoreDelta ?? 0;
  const isNew = team.status === "new";

  const boxWidth = cardType === "both" ? (CARD_WIDTH - marginX * 2 - 24) / 2 : CARD_WIDTH - marginX * 2;
  const boxHeight = 175;

  // Helper for drawing metric boxes
  const drawMetricBox = (
    x: number,
    y: number,
    w: number,
    h: number,
    label: string,
    value: string,
    deltaPill: { text: string; type: "up" | "down" | "flat" | "new" }
  ) => {
    ctx.save();
    // Card Container
    ctx.fillStyle = "rgba(255, 255, 255, 0.035)";
    ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 20);
    ctx.fill();
    ctx.stroke();

    // Inner subtle glow at top-left
    const innerGlow = ctx.createLinearGradient(x, y, x + w, y + h);
    innerGlow.addColorStop(0, "rgba(255, 153, 0, 0.07)");
    innerGlow.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = innerGlow;
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 20);
    ctx.fill();

    // Label
    ctx.fillStyle = "rgba(255, 255, 255, 0.55)";
    ctx.font = "bold 14px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    ctx.textBaseline = "top";
    ctx.fillText(label.toUpperCase(), x + 24, y + 20);

    // Value
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "900 46px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, monospace";
    ctx.textBaseline = "top";
    ctx.fillText(value, x + 24, y + 48);

    // Delta Pill
    const pillY = y + 116;
    ctx.font = "bold 15px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    const pWidth = ctx.measureText(deltaPill.text).width + 24;

    let pBg = "rgba(255, 255, 255, 0.06)";
    let pBorder = "rgba(255, 255, 255, 0.12)";
    let pColor = "rgba(255, 255, 255, 0.7)";

    if (deltaPill.type === "up") {
      pBg = "rgba(16, 185, 129, 0.15)";
      pBorder = "rgba(16, 185, 129, 0.35)";
      pColor = "#34D399";
    } else if (deltaPill.type === "down") {
      pBg = "rgba(244, 63, 94, 0.15)";
      pBorder = "rgba(244, 63, 94, 0.35)";
      pColor = "#FB7185";
    } else if (deltaPill.type === "new") {
      pBg = "rgba(59, 130, 246, 0.15)";
      pBorder = "rgba(59, 130, 246, 0.35)";
      pColor = "#60A5FA";
    }

    ctx.fillStyle = pBg;
    ctx.strokeStyle = pBorder;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(x + 24, pillY, pWidth, 32, 16);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = pColor;
    ctx.textBaseline = "middle";
    ctx.fillText(deltaPill.text, x + 36, pillY + 16);
    ctx.restore();
  };

  if (cardType === "both") {
    // Rank Box
    const rankDeltaText = isNew
      ? "★ NEW ENTRY"
      : rDelta > 0
      ? `▲ +${rDelta} Positions`
      : rDelta < 0
      ? `▼ ${rDelta} Positions`
      : "— No Rank Change";
    const rankDeltaType = isNew ? "new" : rDelta > 0 ? "up" : rDelta < 0 ? "down" : "flat";

    drawMetricBox(marginX, cursorY, boxWidth, boxHeight, "Leaderboard Rank", `#${rankVal}`, {
      text: rankDeltaText,
      type: rankDeltaType,
    });

    // Score Box
    const scoreDeltaText = isNew
      ? "★ INITIAL SCORE"
      : sDelta > 0.000001
      ? `+${sDelta.toFixed(6)} Gain`
      : sDelta < -0.000001
      ? `${sDelta.toFixed(6)} Change`
      : "— No Score Delta";
    const scoreDeltaType = isNew ? "new" : sDelta > 0.000001 ? "up" : sDelta < -0.000001 ? "down" : "flat";

    drawMetricBox(marginX + boxWidth + 24, cursorY, boxWidth, boxHeight, "Contest F1-Score", scoreVal, {
      text: scoreDeltaText,
      type: scoreDeltaType,
    });
  } else if (cardType === "rank") {
    const rankDeltaText = isNew
      ? "★ NEW TO LEADERBOARD"
      : rDelta > 0
      ? `▲ Climbed ${rDelta} positions`
      : rDelta < 0
      ? `▼ Dropped ${Math.abs(rDelta)} positions`
      : "— Unchanged from previous sync";
    const rankDeltaType = isNew ? "new" : rDelta > 0 ? "up" : rDelta < 0 ? "down" : "flat";

    drawMetricBox(marginX, cursorY, boxWidth, boxHeight, "Official Leaderboard Rank", `#${rankVal}`, {
      text: rankDeltaText,
      type: rankDeltaType,
    });
  } else if (cardType === "score") {
    const scoreDeltaText = isNew
      ? "★ INITIAL SCORE"
      : sDelta > 0.000001
      ? `▲ +${sDelta.toFixed(6)} Score Improvement`
      : sDelta < -0.000001
      ? `▼ ${sDelta.toFixed(6)} Score Change`
      : "— No change from previous sync";
    const scoreDeltaType = isNew ? "new" : sDelta > 0.000001 ? "up" : sDelta < -0.000001 ? "down" : "flat";

    drawMetricBox(marginX, cursorY, boxWidth, boxHeight, "Official F1-Score", scoreVal, {
      text: scoreDeltaText,
      type: scoreDeltaType,
    });
  }

  cursorY += boxHeight + 30;

  // 6. Historical Graph Container
  const graphContainerHeight = 360;
  const graphContainerWidth = CARD_WIDTH - marginX * 2;

  ctx.save();
  ctx.fillStyle = "rgba(255, 255, 255, 0.025)";
  ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(marginX, cursorY, graphContainerWidth, graphContainerHeight, 20);
  ctx.fill();
  ctx.stroke();

  // Graph Header
  ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
  ctx.font = "bold 15px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  ctx.textBaseline = "top";
  const graphTitle =
    graphType === "rank"
      ? "📈 RANK PROGRESSION (CHECKPOINTS)"
      : graphType === "score"
      ? "✨ F1-SCORE PROGRESSION (CHECKPOINTS)"
      : "📊 PERFORMANCE TIMELINE";
  ctx.fillText(graphTitle, marginX + 24, cursorY + 20);

  if (graphType !== "none" && history && history.length > 0) {
    // Render Vector Line Graph onto Canvas
    const sortedData = history.slice().sort((a, b) => {
      return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
    });

    const gPadding = {
      top: cursorY + 64,
      bottom: cursorY + graphContainerHeight - 44,
      left: marginX + 64,
      right: marginX + graphContainerWidth - 32,
    };
    const gWidth = gPadding.right - gPadding.left;
    const gHeight = gPadding.bottom - gPadding.top;

    // Extract values
    const points = sortedData.map((d, index) => {
      const sVal = d.score !== null ? parseFloat(d.score) : 0;
      const rVal = d.rank !== null ? d.rank : null;
      const dateObj = new Date(d.timestamp);
      const dateStr = isNaN(dateObj.getTime())
        ? d.timestamp.split("+")[0]
        : dateObj.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      return { index, rank: rVal, score: sVal, dateStr, raw: d };
    });

    const isRankGraph = graphType === "rank";
    let validValues = isRankGraph
      ? (points.map((p) => p.rank).filter((r) => r !== null) as number[])
      : points.map((p) => p.score);

    let minVal = validValues.length > 0 ? Math.min(...validValues) : 0;
    let maxVal = validValues.length > 0 ? Math.max(...validValues) : 1;
    if (minVal === maxVal) {
      minVal = isRankGraph ? Math.max(1, minVal - 5) : Math.max(0, minVal - 0.05);
      maxVal = isRankGraph ? maxVal + 5 : maxVal + 0.05;
    }

    const paddingRatio = (maxVal - minVal) * 0.1 || (isRankGraph ? 2 : 0.01);
    const effMin = isRankGraph ? Math.max(1, minVal - paddingRatio) : Math.max(0, minVal - paddingRatio);
    const effMax = maxVal + paddingRatio;

    // Grid lines
    ctx.strokeStyle = "rgba(255, 255, 255, 0.06)";
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);

    for (let i = 0; i <= 3; i++) {
      const ratio = i / 3;
      const gridY = gPadding.top + ratio * gHeight;
      ctx.beginPath();
      ctx.moveTo(gPadding.left, gridY);
      ctx.lineTo(gPadding.right, gridY);
      ctx.stroke();

      ctx.fillStyle = "rgba(255, 255, 255, 0.35)";
      ctx.font = "12px -apple-system, BlinkMacSystemFont, monospace";
      ctx.textBaseline = "middle";
      const labelVal = isRankGraph
        ? `#${Math.round(effMin + ratio * (effMax - effMin))}`
        : (effMax - ratio * (effMax - effMin)).toFixed(4);
      ctx.fillText(labelVal, marginX + 16, gridY);
    }
    ctx.setLineDash([]);

    // Compute coordinates
    const coords = points.map((p) => {
      const x = points.length === 1 ? gPadding.left + gWidth / 2 : gPadding.left + (p.index / (points.length - 1)) * gWidth;
      let y = gPadding.top + gHeight;
      if (isRankGraph) {
        if (p.rank !== null) {
          const ratio = (p.rank - effMin) / (effMax - effMin);
          y = gPadding.top + ratio * gHeight;
        }
      } else {
        const ratio = (p.score - effMin) / (effMax - effMin);
        y = gPadding.top + gHeight - ratio * gHeight;
      }
      return { x, y, point: p };
    });

    // Area fill under curve
    if (coords.length > 1) {
      const areaGradient = ctx.createLinearGradient(0, gPadding.top, 0, gPadding.bottom);
      areaGradient.addColorStop(0, "rgba(255, 153, 0, 0.35)");
      areaGradient.addColorStop(0.5, "rgba(255, 153, 0, 0.12)");
      areaGradient.addColorStop(1, "rgba(255, 153, 0, 0.0)");

      ctx.fillStyle = areaGradient;
      ctx.beginPath();
      ctx.moveTo(coords[0].x, coords[0].y);
      for (let i = 1; i < coords.length; i++) {
        ctx.lineTo(coords[i].x, coords[i].y);
      }
      ctx.lineTo(coords[coords.length - 1].x, gPadding.bottom);
      ctx.lineTo(coords[0].x, gPadding.bottom);
      ctx.closePath();
      ctx.fill();
    }

    // Line Path
    ctx.strokeStyle = "#FF9900";
    ctx.lineWidth = 4;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(coords[0].x, coords[0].y);
    for (let i = 1; i < coords.length; i++) {
      ctx.lineTo(coords[i].x, coords[i].y);
    }
    ctx.stroke();

    // Data Points & Labels
    for (let i = 0; i < coords.length; i++) {
      const c = coords[i];

      // Point Dot
      ctx.fillStyle = "#FF9900";
      ctx.strokeStyle = "#FFFFFF";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(c.x, c.y, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // X-axis date
      const skipLabel = coords.length > 6 && i % 2 !== 0 && i !== coords.length - 1;
      if (!skipLabel) {
        ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
        ctx.font = "12px -apple-system, BlinkMacSystemFont, monospace";
        ctx.textAlign = "center";
        ctx.textBaseline = "top";
        ctx.fillText(c.point.dateStr, c.x, gPadding.bottom + 12);
      }
    }
    ctx.textAlign = "left";
  } else {
    // Fallback when no graph selected or history empty
    ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
    ctx.font = "500 16px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(
      graphType === "none"
        ? "Graph display turned off in share settings."
        : "Historical snapshots recording in progress.",
      marginX + graphContainerWidth / 2,
      cursorY + graphContainerHeight / 2
    );
    ctx.textAlign = "left";
  }
  ctx.restore();

  cursorY += graphContainerHeight + 32;

  // 7. Snapshot Timestamp Bar
  const snapshotFormatted = formatSnapshotTimestamp(customTimestamp || team.lastUpdated);
  ctx.save();
  ctx.fillStyle = "rgba(255, 255, 255, 0.55)";
  ctx.font = "500 15px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  ctx.textBaseline = "top";
  ctx.fillText(`Leaderboard Snapshot: ${snapshotFormatted}`, marginX, cursorY);

  // Verified Checkmark
  const linkText = `amazonmlchallengeexplorer.vercel.app/teams/${team.teamId}`;
  ctx.fillStyle = "#FF9900";
  ctx.font = "600 15px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, monospace";
  ctx.textAlign = "right";
  ctx.fillText(linkText, CARD_WIDTH - marginX, cursorY);
  ctx.textAlign = "left";
  ctx.restore();

  cursorY += 36;

  // 8. Bottom Disclaimer Footer
  ctx.save();
  ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(marginX, cursorY);
  ctx.lineTo(CARD_WIDTH - marginX, cursorY);
  ctx.stroke();

  cursorY += 18;
  ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
  ctx.font = "12px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  ctx.textBaseline = "top";
  ctx.fillText(
    "Unofficial leaderboard visualization & analytics · Amazon ML Challenge 2026",
    marginX,
    cursorY
  );
  ctx.restore();
}

/**
 * Generates a high-resolution PNG Blob (1080x1350)
 */
export async function generateShareCardBlob(
  options: CardGeneratorOptions
): Promise<Blob> {
  const canvas = document.createElement("canvas");
  renderShareCardToCanvas(canvas, options);

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
      } else {
        reject(new Error("Canvas blob generation failed"));
      }
    }, "image/png");
  });
}

/**
 * Generates a PNG Data URL for fast interactive previews
 */
export function generateShareCardDataUrl(
  options: CardGeneratorOptions
): string {
  if (typeof document === "undefined") return "";
  const canvas = document.createElement("canvas");
  renderShareCardToCanvas(canvas, options);
  return canvas.toDataURL("image/png");
}

/**
 * Triggers native download of the card
 */
export function downloadCardImage(blob: Blob, teamName: string, teamId: string | number): void {
  const safeName = teamName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .slice(0, 30);
  const fileName = `amazon-ml-2026-${safeName || "team"}-${teamId}.png`;

  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}

/**
 * Copies the PNG image directly to clipboard
 */
export async function copyCardImageToClipboard(blob: Blob): Promise<boolean> {
  if (typeof navigator === "undefined" || !navigator.clipboard || !navigator.clipboard.write) {
    return false;
  }

  try {
    const item = new ClipboardItem({ "image/png": blob });
    await navigator.clipboard.write([item]);
    return true;
  } catch (err) {
    console.error("Clipboard image copy failed:", err);
    return false;
  }
}
