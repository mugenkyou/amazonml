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
 * e.g. "Sep 27, 2026 · 5:22 PM IST"
 */
export function formatSnapshotTimestamp(dateInput?: string | Date | null): string {
  if (!dateInput) {
    const now = new Date();
    return `${now.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })} · ${now.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    })} IST`;
  }

  const d = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  if (isNaN(d.getTime())) {
    return String(dateInput);
  }

  const dateStr = d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const timeStr = d.toLocaleTimeString("en-US", {
    hour: "numeric",
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
 * Renders the full 1080x1350 editorial share card onto a Canvas 2D Context.
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

  // 1. Background Fill (Crisp Clean Warm White Minimal Editorial)
  ctx.fillStyle = "#FCFCFB";
  ctx.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT);

  // Top Signature Accent Bar (6px Amazon Orange Gradient)
  const barGradient = ctx.createLinearGradient(0, 0, CARD_WIDTH, 0);
  barGradient.addColorStop(0, "#FF9900");
  barGradient.addColorStop(0.5, "#FFB84D");
  barGradient.addColorStop(1, "#E47911");
  ctx.fillStyle = barGradient;
  ctx.fillRect(0, 0, CARD_WIDTH, 6);

  const marginX = 72;
  const contentWidth = CARD_WIDTH - marginX * 2; // 936px

  // Helper for subtle divider lines
  const drawDivider = (y: number) => {
    ctx.save();
    ctx.strokeStyle = "#E5E7EB";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(marginX, y);
    ctx.lineTo(CARD_WIDTH - marginX, y);
    ctx.stroke();
    ctx.restore();
  };

  const hasGraph = graphType !== "none" && history && history.length > 0;

  // Layout distribution parameters
  let cursorY = 64;

  // -------------------------------------------------------------
  // 1. HEADER SECTION
  // -------------------------------------------------------------
  // Eyebrow
  ctx.save();
  ctx.fillStyle = "#E47911";
  ctx.font = "bold 15px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  ctx.textBaseline = "top";
  ctx.fillText("AMAZON ML CHALLENGE 2026", marginX, cursorY);
  ctx.restore();

  cursorY += 28;

  // Dominant Team Name
  ctx.save();
  ctx.fillStyle = "#0F172A";
  ctx.font = "900 62px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  ctx.textBaseline = "top";
  const nameLines = wrapText(ctx, team.teamName || `Team #${team.teamId}`, contentWidth, 2);
  for (const line of nameLines) {
    ctx.fillText(line, marginX, cursorY);
    cursorY += 68;
  }
  ctx.restore();

  // Subtitle (Affiliation / Team ID)
  cursorY += 2;
  ctx.save();
  ctx.fillStyle = "#64748B";
  ctx.font = "500 17px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  ctx.textBaseline = "top";

  const orgs = team.organizations || [];
  const subtitleText =
    orgs.length > 0
      ? `${orgs.join(" · ")} • Contest ID: ${team.teamId}`
      : `Contest Team ID: ${team.teamId} • Leaderboard Profile`;
  ctx.fillText(subtitleText, marginX, cursorY);
  ctx.restore();

  cursorY += 36;
  drawDivider(cursorY);
  cursorY += hasGraph ? 36 : 56;

  // -------------------------------------------------------------
  // 2. CENTERPIECE METRICS (RANK & F1 SCORE)
  // -------------------------------------------------------------
  const rankVal = team.rank ? String(team.rank) : "—";
  const scoreVal = team.score ? String(team.score) : "0.000000";
  const rDelta = team.rankDelta ?? 0;
  const sDelta = team.scoreDelta ?? 0;
  const isNew = team.status === "new";

  if (cardType === "both") {
    const colWidth = (contentWidth - 48) / 2; // ~444px
    const col1X = marginX;
    const col2X = marginX + colWidth + 48;

    // --- Column 1: Rank ---
    ctx.save();
    ctx.fillStyle = "#64748B";
    ctx.font = "bold 16px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    ctx.textBaseline = "top";
    ctx.fillText("RANK", col1X, cursorY);

    ctx.fillStyle = rankVal === "1" ? "#E47911" : "#0F172A";
    ctx.font = "900 110px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, monospace";
    ctx.fillText(`#${rankVal}`, col1X, cursorY + 24);

    // Rank Movement
    const rankDeltaY = cursorY + 144;
    ctx.font = "bold 22px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    if (isNew) {
      ctx.fillStyle = "#2563EB";
      ctx.fillText("★ NEW ENTRY", col1X, rankDeltaY);
    } else if (rDelta > 0) {
      ctx.fillStyle = "#059669";
      ctx.fillText(`▲ +${rDelta} positions`, col1X, rankDeltaY);
    } else if (rDelta < 0) {
      ctx.fillStyle = "#DC2626";
      ctx.fillText(`▼ ${Math.abs(rDelta)} positions`, col1X, rankDeltaY);
    } else {
      ctx.fillStyle = "#64748B";
      ctx.fillText("— No change", col1X, rankDeltaY);
    }
    ctx.restore();

    // --- Column 2: F1 Score ---
    ctx.save();
    ctx.fillStyle = "#64748B";
    ctx.font = "bold 16px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    ctx.textBaseline = "top";
    ctx.fillText("F1 SCORE", col2X, cursorY);

    ctx.fillStyle = "#0F172A";
    ctx.font = "900 78px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, monospace";
    ctx.fillText(scoreVal, col2X, cursorY + 44);

    // F1 Movement
    const scoreDeltaY = cursorY + 144;
    ctx.font = "bold 22px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    if (isNew) {
      ctx.fillStyle = "#2563EB";
      ctx.fillText("First recorded checkpoint", col2X, scoreDeltaY);
    } else if (sDelta > 0.000001) {
      ctx.fillStyle = "#059669";
      ctx.fillText(`+${sDelta.toFixed(6)}`, col2X, scoreDeltaY);
      ctx.font = "500 16px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
      ctx.fillStyle = "#64748B";
      ctx.fillText("  since previous sync", col2X + ctx.measureText(`+${sDelta.toFixed(6)}`).width + 25, scoreDeltaY + 3);
    } else if (sDelta < -0.000001) {
      ctx.fillStyle = "#DC2626";
      ctx.fillText(`${sDelta.toFixed(6)}`, col2X, scoreDeltaY);
      ctx.font = "500 16px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
      ctx.fillStyle = "#64748B";
      ctx.fillText("  since previous sync", col2X + ctx.measureText(`${sDelta.toFixed(6)}`).width + 25, scoreDeltaY + 3);
    } else {
      ctx.fillStyle = "#64748B";
      ctx.fillText("— No score change", col2X, scoreDeltaY);
    }
    ctx.restore();

    cursorY += 190;
  } else if (cardType === "rank") {
    // Rank Only Hero
    ctx.save();
    ctx.fillStyle = "#64748B";
    ctx.font = "bold 18px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    ctx.textBaseline = "top";
    ctx.fillText("OFFICIAL CONTEST RANK", marginX, cursorY);

    ctx.fillStyle = rankVal === "1" ? "#E47911" : "#0F172A";
    ctx.font = "900 130px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, monospace";
    ctx.fillText(`#${rankVal}`, marginX, cursorY + 26);

    const rankDeltaY = cursorY + 168;
    ctx.font = "bold 24px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    if (isNew) {
      ctx.fillStyle = "#2563EB";
      ctx.fillText("★ NEW TO LEADERBOARD", marginX, rankDeltaY);
    } else if (rDelta > 0) {
      ctx.fillStyle = "#059669";
      ctx.fillText(`▲ +${rDelta} positions climbed`, marginX, rankDeltaY);
    } else if (rDelta < 0) {
      ctx.fillStyle = "#DC2626";
      ctx.fillText(`▼ ${Math.abs(rDelta)} positions dropped`, marginX, rankDeltaY);
    } else {
      ctx.fillStyle = "#64748B";
      ctx.fillText("— No rank movement from previous sync", marginX, rankDeltaY);
    }
    ctx.restore();

    cursorY += 215;
  } else if (cardType === "score") {
    // Score Only Hero
    ctx.save();
    ctx.fillStyle = "#64748B";
    ctx.font = "bold 18px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    ctx.textBaseline = "top";
    ctx.fillText("OFFICIAL F1 SCORE", marginX, cursorY);

    ctx.fillStyle = "#0F172A";
    ctx.font = "900 100px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, monospace";
    ctx.fillText(scoreVal, marginX, cursorY + 30);

    const scoreDeltaY = cursorY + 150;
    ctx.font = "bold 24px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    if (isNew) {
      ctx.fillStyle = "#2563EB";
      ctx.fillText("First recorded score checkpoint", marginX, scoreDeltaY);
    } else if (sDelta > 0.000001) {
      ctx.fillStyle = "#059669";
      ctx.fillText(`+${sDelta.toFixed(6)} score gain since previous sync`, marginX, scoreDeltaY);
    } else if (sDelta < -0.000001) {
      ctx.fillStyle = "#DC2626";
      ctx.fillText(`${sDelta.toFixed(6)} score delta since previous sync`, marginX, scoreDeltaY);
    } else {
      ctx.fillStyle = "#64748B";
      ctx.fillText("— No score change from previous sync", marginX, scoreDeltaY);
    }
    ctx.restore();

    cursorY += 195;
  }

  cursorY += hasGraph ? 24 : 48;
  drawDivider(cursorY);
  cursorY += hasGraph ? 32 : 56;

  // -------------------------------------------------------------
  // 3. HISTORICAL GRAPH SECTION OR EXPANDED PERFORMANCE STATS
  // -------------------------------------------------------------
  if (hasGraph) {
    const graphTitle = graphType === "rank" ? "RANK PROGRESSION" : "F1 SCORE PROGRESSION";
    const graphHeight = 330;

    // Graph Title & Checkpoints Count
    ctx.save();
    ctx.fillStyle = "#0F172A";
    ctx.font = "bold 18px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    ctx.textBaseline = "top";
    ctx.fillText(graphTitle, marginX, cursorY);

    ctx.fillStyle = "#64748B";
    ctx.font = "500 16px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, monospace";
    ctx.textAlign = "right";
    ctx.fillText(`${history.length} checkpoints`, CARD_WIDTH - marginX, cursorY);
    ctx.restore();

    cursorY += 34;

    // Render Vector Line Chart onto Canvas
    const sortedData = history.slice().sort((a, b) => {
      return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
    });

    const gPadding = {
      top: cursorY + 20,
      bottom: cursorY + graphHeight - 48,
      left: marginX + 64,
      right: CARD_WIDTH - marginX - 16,
    };
    const gWidth = gPadding.right - gPadding.left;
    const gHeight = gPadding.bottom - gPadding.top;

    const points = sortedData.map((d, index) => {
      const sVal = d.score !== null ? parseFloat(d.score) : 0;
      const rVal = d.rank !== null ? d.rank : null;
      const dateObj = new Date(d.timestamp);
      const dateStr = isNaN(dateObj.getTime())
        ? d.timestamp.split("+")[0]
        : dateObj.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      const timeStr = isNaN(dateObj.getTime())
        ? ""
        : dateObj.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
      return { index, rank: rVal, score: sVal, dateStr, timeStr, raw: d };
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

    // Grid Lines & Clean Y-Axis
    ctx.save();
    ctx.strokeStyle = "#E5E7EB";
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 5]);

    for (let i = 0; i <= 3; i++) {
      const ratio = i / 3;
      const gridY = gPadding.top + ratio * gHeight;
      ctx.beginPath();
      ctx.moveTo(gPadding.left, gridY);
      ctx.lineTo(gPadding.right, gridY);
      ctx.stroke();

      ctx.fillStyle = "#94A3B8";
      ctx.font = "500 13px -apple-system, BlinkMacSystemFont, monospace";
      ctx.textBaseline = "middle";
      ctx.textAlign = "right";
      const labelVal = isRankGraph
        ? `#${Math.round(effMin + ratio * (effMax - effMin))}`
        : (effMax - ratio * (effMax - effMin)).toFixed(4);
      ctx.fillText(labelVal, gPadding.left - 14, gridY);
    }
    ctx.setLineDash([]);
    ctx.restore();

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

    // Area Fill
    if (coords.length > 1) {
      ctx.save();
      const areaGradient = ctx.createLinearGradient(0, gPadding.top, 0, gPadding.bottom);
      areaGradient.addColorStop(0, "rgba(228, 121, 17, 0.16)");
      areaGradient.addColorStop(0.6, "rgba(228, 121, 17, 0.04)");
      areaGradient.addColorStop(1, "rgba(228, 121, 17, 0.0)");

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
      ctx.restore();
    }

    // Line Path
    ctx.save();
    ctx.strokeStyle = "#E47911";
    ctx.lineWidth = 4;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(coords[0].x, coords[0].y);
    for (let i = 1; i < coords.length; i++) {
      ctx.lineTo(coords[i].x, coords[i].y);
    }
    ctx.stroke();

    // Data Points & Direct Value Labels (e.g. 0.9918 or #12)
    for (let i = 0; i < coords.length; i++) {
      const c = coords[i];
      const isLatest = i === coords.length - 1;

      // Outer Glow Halo for Points
      ctx.fillStyle = isLatest ? "rgba(228, 121, 17, 0.2)" : "rgba(255, 153, 0, 0.15)";
      ctx.beginPath();
      ctx.arc(c.x, c.y, isLatest ? 10 : 8, 0, Math.PI * 2);
      ctx.fill();

      // Point Dot
      ctx.fillStyle = isLatest ? "#E47911" : "#FF9900";
      ctx.strokeStyle = "#FFFFFF";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(c.x, c.y, isLatest ? 7 : 5.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Point Value Label (F1 score or Rank)
      const valText = isRankGraph
        ? `#${c.point.rank ?? "—"}`
        : c.point.raw.score
        ? Number(c.point.raw.score).toFixed(4)
        : c.point.score.toFixed(4);

      // Determine label Y position (above point, or below if point is near top of graph)
      const labelY = c.y - 14 < gPadding.top ? c.y + 20 : c.y - 12;

      ctx.save();
      ctx.font = isLatest
        ? "bold 14px -apple-system, BlinkMacSystemFont, 'SF Mono', Monaco, monospace"
        : "600 13px -apple-system, BlinkMacSystemFont, 'SF Mono', Monaco, monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      // White halo stroke behind text for maximum legibility against background/lines
      if (typeof ctx.strokeText === "function") {
        ctx.strokeStyle = "#FCFCFB";
        ctx.lineWidth = 4;
        ctx.strokeText(valText, c.x, labelY);
      }

      // Main text
      ctx.fillStyle = isLatest ? "#E47911" : "#0F172A";
      ctx.fillText(valText, c.x, labelY);
      ctx.restore();
    }

    // X-Axis Start and End Timestamps
    if (coords.length > 0) {
      const first = coords[0];
      const last = coords[coords.length - 1];

      ctx.fillStyle = "#64748B";
      ctx.font = "500 14px -apple-system, BlinkMacSystemFont, monospace";
      ctx.textBaseline = "top";
      ctx.textAlign = "left";
      ctx.fillText(`${first.point.dateStr} ${first.point.timeStr}`, first.x, gPadding.bottom + 14);

      if (coords.length > 1) {
        ctx.textAlign = "right";
        ctx.fillText(`${last.point.dateStr} ${last.point.timeStr}`, last.x, gPadding.bottom + 14);
      }
      ctx.textAlign = "left";
    }
    ctx.restore();

    cursorY += graphHeight;
  } else {
    // -------------------------------------------------------------
    // NO GRAPH STATE — DYNAMICALLY REBALANCED PERFORMANCE METRICS
    // -------------------------------------------------------------
    ctx.save();
    ctx.fillStyle = "#0F172A";
    ctx.font = "bold 18px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    ctx.textBaseline = "top";
    ctx.fillText("COMPETITION STANDING BREAKDOWN", marginX, cursorY);
    ctx.restore();

    cursorY += 38;

    // 3 Clean Summary Stat Columns
    const statColW = (contentWidth - 48) / 3;
    const statsData = [
      { label: "STANDINGS PERCENTILE", val: team.rank ? `Top ${(Math.max(1, Math.round((Number(team.rank) / 4334) * 100)))}%` : "Top Tier" },
      { label: "TOTAL TEAMS", val: "4,334 Teams" },
      { label: "STATUS", val: isNew ? "New Entry" : "Active" },
    ];

    statsData.forEach((s, idx) => {
      const colX = marginX + idx * (statColW + 24);
      ctx.save();
      ctx.fillStyle = "#64748B";
      ctx.font = "bold 14px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
      ctx.textBaseline = "top";
      ctx.fillText(s.label, colX, cursorY);

      ctx.fillStyle = "#0F172A";
      ctx.font = "900 32px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, monospace";
      ctx.fillText(s.val, colX, cursorY + 24);
      ctx.restore();
    });

    cursorY += 80;
  }

  cursorY += hasGraph ? 24 : 48;
  drawDivider(cursorY);
  cursorY += hasGraph ? 32 : 54;

  // -------------------------------------------------------------
  // 4. TEAM MEMBERS SECTION
  // -------------------------------------------------------------
  const players = team.players || [];
  ctx.save();
  ctx.fillStyle = "#64748B";
  ctx.font = "bold 15px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  ctx.textBaseline = "top";
  ctx.fillText("TEAM MEMBERS", marginX, cursorY);
  ctx.restore();

  cursorY += 28;

  if (players.length > 0) {
    ctx.save();
    ctx.fillStyle = "#0F172A";
    ctx.font = "600 22px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    ctx.textBaseline = "top";

    if (players.length <= 2) {
      const line1 = players.map((p) => p.name).join("   ·   ");
      ctx.fillText(line1, marginX, cursorY);
      cursorY += 34;
    } else if (players.length <= 4) {
      const row1 = players.slice(0, 2).map((p) => p.name).join("   ·   ");
      const row2 = players.slice(2, 4).map((p) => p.name).join("   ·   ");
      ctx.fillText(row1, marginX, cursorY);
      cursorY += 34;
      ctx.fillText(row2, marginX, cursorY);
      cursorY += 34;
    } else {
      const row1 = players.slice(0, 2).map((p) => p.name).join("   ·   ");
      const row2 = `${players.slice(2, 4).map((p) => p.name).join("   ·   ")}   ·   +${players.length - 4} more`;
      ctx.fillText(row1, marginX, cursorY);
      cursorY += 34;
      ctx.fillText(row2, marginX, cursorY);
      cursorY += 34;
    }
    ctx.restore();
  } else {
    ctx.save();
    ctx.fillStyle = "#64748B";
    ctx.font = "500 18px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    ctx.textBaseline = "top";
    ctx.fillText("Solo participant / Independent challenger", marginX, cursorY);
    ctx.restore();
    cursorY += 34;
  }

  cursorY += hasGraph ? 24 : 44;
  drawDivider(cursorY);
  cursorY += 24;

  // -------------------------------------------------------------
  // 5. FOOTER SECTION
  // -------------------------------------------------------------
  const snapshotFormatted = formatSnapshotTimestamp(customTimestamp || team.lastUpdated);
  ctx.save();
  ctx.fillStyle = "#64748B";
  ctx.font = "500 15px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, monospace";
  ctx.textBaseline = "top";
  ctx.fillText(`Updated ${snapshotFormatted}`, marginX, cursorY);

  ctx.fillStyle = "#0F172A";
  ctx.font = "bold 16px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  ctx.textAlign = "right";
  ctx.fillText("Amazon ML Challenge Explorer", CARD_WIDTH - marginX, cursorY);
  ctx.restore();

  cursorY += 26;

  // Subtle bottom disclaimer
  ctx.save();
  ctx.fillStyle = "#94A3B8";
  ctx.font = "500 13px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  ctx.textBaseline = "top";
  ctx.fillText(
    "Unofficial leaderboard visualization · Data from captured leaderboard snapshots",
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
