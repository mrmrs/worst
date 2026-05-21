import { useCallback, useEffect, useRef, useState } from "react";
import {
  CHARACTER_TYPES,
  ENDING_COPY,
  ENTRANCE_TYPES,
  GROUNDED_FAIRY,
  LORE_INVOKE_THRESHOLD,
  LOST_WING,
  MAGICAL_ITEMS,
  MAGICAL_ITEM_BLURBS,
  MYSTERY,
  QUEST_COPY,
  buildEncounterDialogue,
  getQuestChecklist,
  getQuestDirection,
  pickRumor,
  pickUnheardLore,
} from "../data/worldContent";
import "../App.css";

const CELL_WIDTH = 11;
const CELL_HEIGHT = 16;
const FONT_SIZE = 16;
const MAX_PIXEL_RATIO = 2;
const CHARACTER_SECTOR_SIZE = 42;
const NPC_TALK_RADIUS = 1.35;
const CHARACTER_SPAWN_CHANCE = 0.52;
const ENCOUNTER_ITEM_CHANCE = 0.42;
const CASTLE_ROOM_SIZE = 19;
const ENTRANCE_SECTOR_SIZE = 64;
const ENTRANCE_COLLISION_RADIUS = 1.05;
const MIN_PASSABLE_SPEED = 0.05;
const MAX_MOVEMENT_STEP = 0.32;
const CASTLE_EXIT_GRACE_MS = 1200;
const HIGH_SCORE_KEY = "worstWorldHighScore";
const COMPLETION_KEY = "worstWorldCompleted";
const MEMORY_KEY = "worstWorldMemory";
const OVERWORLD_LEVEL_NAME = "The Wandering Wilds";
const EMPTY_SET = new Set();

const DIRECTIONS = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};

const D_PAD = [
  { direction: "up", className: "world-pad-up", rotation: 0 },
  { direction: "left", className: "world-pad-left", rotation: -90 },
  { direction: "down", className: "world-pad-down", rotation: 180 },
  { direction: "right", className: "world-pad-right", rotation: 90 },
];

const BIRD_CALLS = [
  ["wren", 1800, 4, 0.9],
  ["thrush", 950, 3, 0.45],
  ["lark", 2100, 5, 1.25],
  ["finch", 1600, 4, 0.65],
  ["warbler", 2300, 6, 1.4],
  ["sparrow", 1350, 3, 0.55],
  ["blackbird", 820, 4, 0.35],
  ["robin", 1150, 3, 0.5],
  ["swallow", 1900, 5, 1.1],
  ["nightingale", 1250, 7, 0.8],
  ["oriole", 1000, 3, 0.6],
  ["chickadee", 1700, 2, 0.95],
  ["jay", 750, 2, 0.22],
  ["magpie", 1050, 4, 0.75],
  ["kingfisher", 2400, 3, 1.5],
  ["cuckoo", 620, 2, 0.18],
  ["dove", 420, 3, 0.12],
  ["owl", 330, 2, 0.08],
  ["swift", 2200, 5, 1.35],
  ["starling", 1450, 6, 0.85],
  ["goldfinch", 1850, 5, 1.05],
  ["canary", 2000, 6, 1.2],
  ["heron", 520, 2, 0.16],
  ["crane", 680, 2, 0.2],
  ["bittern", 260, 1, 0.05],
  ["woodpecker", 900, 8, 0.3],
  ["curlew", 760, 4, 0.4],
  ["gull", 700, 3, 0.25],
  ["raven", 390, 2, 0.1],
  ["skylark", 2500, 8, 1.6],
  ["waxwing", 1750, 5, 1],
  ["phoebe", 1200, 2, 0.5],
].map(([name, base, chirps, lift], index) => ({ name, base, chirps, lift, index }));

const renderArrowIcon = (rotation) => (
  <svg
    aria-hidden="true"
    className="world-pad-icon"
    viewBox="0 0 24 24"
    style={{ transform: `rotate(${rotation}deg)` }}
  >
    <path d="M12 4L5.25 12.25H9.5V20H14.5V12.25H18.75L12 4Z" />
  </svg>
);

const formatChoiceLabel = (label) => label.replace(/^[ABC]\.\s*/i, "");

const cycleChoiceIndex = (current, direction, total) => (current + direction + total) % total;

const CHARACTER_TYPE_BY_ID = Object.fromEntries(
  CHARACTER_TYPES.map((type) => [type.id, type]),
);

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const lerp = (start, end, amount) => start + (end - start) * amount;
const smooth = (value) => value * value * (3 - 2 * value);

const hash2 = (x, y, seed = 0) => {
  const value = Math.sin(x * 127.1 + y * 311.7 + seed * 74.7) * 43758.5453123;
  return value - Math.floor(value);
};

const noise2 = (x, y, seed = 0) => {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const xf = x - xi;
  const yf = y - yi;
  const top = lerp(hash2(xi, yi, seed), hash2(xi + 1, yi, seed), smooth(xf));
  const bottom = lerp(
    hash2(xi, yi + 1, seed),
    hash2(xi + 1, yi + 1, seed),
    smooth(xf),
  );
  return lerp(top, bottom, smooth(yf));
};

const fbm = (x, y, seed, octaves = 5) => {
  let value = 0;
  let amplitude = 0.5;
  let frequency = 1;
  let total = 0;

  for (let octave = 0; octave < octaves; octave += 1) {
    value += noise2(x * frequency, y * frequency, seed + octave * 19.19) * amplitude;
    total += amplitude;
    amplitude *= 0.5;
    frequency *= 2;
  }

  return value / total;
};

const pick = (items, value) => {
  const index = clamp(Math.floor(value * items.length), 0, items.length - 1);
  return items[index];
};

const createTile = ({ char, fg, bg, biome, speed = 1, dither = 0.14 }) => ({
  char,
  fg,
  bg,
  biome,
  speed,
  dither,
});

const landmarkAt = (x, y) => {
  const sectorSize = 72;
  const sectorX = Math.floor(x / sectorSize);
  const sectorY = Math.floor(y / sectorSize);

  for (let offsetY = -1; offsetY <= 1; offsetY += 1) {
    for (let offsetX = -1; offsetX <= 1; offsetX += 1) {
      const sx = sectorX + offsetX;
      const sy = sectorY + offsetY;
      const spawn = hash2(sx, sy, 700);

      if (spawn < 0.72) {
        continue;
      }

      const centerX = sx * sectorSize + Math.floor(hash2(sx, sy, 701) * sectorSize);
      const centerY = sy * sectorSize + Math.floor(hash2(sx, sy, 702) * sectorSize);
      const dx = x - centerX;
      const dy = y - centerY;
      const distance = Math.max(Math.abs(dx), Math.abs(dy));

      if (distance > 5) {
        continue;
      }

      const kind = hash2(sx, sy, 703);

      if (kind < 0.34 && Math.abs(dx) <= 4 && Math.abs(dy) <= 3) {
        const edge = Math.abs(dx) === 4 || Math.abs(dy) === 3;
        const broken = hash2(x, y, 704) > 0.76;

        if (edge && !broken) {
          return createTile({
            char: "#",
            fg: "#f0d28a",
            bg: "#3c3328",
            biome: "ruins",
            speed: 0.85,
            dither: 0.24,
          });
        }

        if (!edge && hash2(x, y, 705) > 0.62) {
          return createTile({
            char: "+",
            fg: "#caa866",
            bg: "#30291f",
            biome: "ruins",
            speed: 0.92,
            dither: 0.2,
          });
        }
      }

      if (kind < 0.68 && distance <= 3) {
        return createTile({
          char: distance === 0 ? "o" : pick([".", ",", "+", "."], hash2(x, y, 706)),
          fg: "#ffc06a",
          bg: "#47311f",
          biome: "camp",
          speed: 1.1,
          dither: 0.18,
        });
      }

      if (kind < 0.84 && distance <= 5 && Math.abs(dx) + Math.abs(dy) > 3) {
        return createTile({
          char: pick(["I", "|", ":", "o"], hash2(x, y, 708)),
          fg: "#b7d8f1",
          bg: "#20283a",
          biome: "standing stones",
          speed: 0.9,
          dither: 0.25,
        });
      }

      if (kind < 0.92 && distance <= 4 && Math.abs(dx) <= 2 && Math.abs(dy) <= 2) {
        return createTile({
          char: pick(["O", "o", "(", ")"], hash2(x, y, 709)),
          fg: "#8a7a68",
          bg: "#1a1814",
          biome: "cave mouth",
          speed: 0.7,
          dither: 0.32,
        });
      }

      if (distance <= 4 && Math.abs(dx) + Math.abs(dy) > 2) {
        return createTile({
          char: pick(["&", "%", "*"], hash2(x, y, 707)),
          fg: "#bfd35b",
          bg: "#26371e",
          biome: "garden",
          speed: 0.9,
          dither: 0.22,
        });
      }
    }
  }

  return null;
};

const tileAt = (x, y) => {
  const height = clamp(
    fbm(x * 0.018, y * 0.018, 10, 5) * 0.7 +
      fbm(x * 0.004, y * 0.004, 20, 3) * 0.3,
    0,
    1,
  );
  const moisture = fbm((x + 2800) * 0.015, (y - 1900) * 0.015, 30, 5);
  const heat = clamp(
    fbm((x - 6000) * 0.006, (y + 1200) * 0.006, 40, 4) + (0.52 - height) * 0.28,
    0,
    1,
  );
  const detail = fbm(x * 0.13, y * 0.13, 50, 3);
  const speck = hash2(x, y, 60);
  const riverBand = Math.abs(fbm((x + 800) * 0.019, (y - 400) * 0.019, 70, 4) - 0.5);
  const trailBand = Math.abs(fbm((x - 1400) * 0.031, (y + 900) * 0.031, 80, 3) - 0.48);
  const magic = fbm((x + 4200) * 0.022, (y + 3100) * 0.022, 90, 4);
  const bloom = fbm((x - 2600) * 0.045, (y + 1500) * 0.045, 100, 3);
  const ember = fbm((x + 9000) * 0.018, (y - 7300) * 0.018, 110, 4);
  const canyonBand = Math.abs(fbm((x - 3200) * 0.024, (y + 2100) * 0.024, 130, 4) - 0.5);
  const karstBand = fbm((x + 5100) * 0.028, (y - 4400) * 0.028, 140, 4);

  if (height < 0.26) {
    return createTile({
      char: pick(["~", "~", "=", "-"], detail),
      fg: "#5aa1b0",
      bg: "#071720",
      biome: "deep water",
      speed: 0.55,
      dither: 0.28,
    });
  }

  if (height < 0.34 || (riverBand < 0.014 && height < 0.68 && moisture > 0.42)) {
    if (height >= 0.3 && heat > 0.52 && moisture > 0.48 && riverBand >= 0.014) {
      return createTile({
        char: pick(["*", "+", "o", "."], detail),
        fg: "#ff9a7a",
        bg: "#1a3a42",
        biome: "coral reef",
        speed: 0.68,
        dither: 0.26,
      });
    }

    if (height >= 0.28 && moisture > 0.66 && heat < 0.55) {
      return createTile({
        char: speck > 0.5 ? "Y" : pick([";", "y", "i", ";"], detail),
        fg: "#3d8a6a",
        bg: "#0a2428",
        biome: "kelp forest",
        speed: 0.62,
        dither: 0.3,
      });
    }

    return createTile({
      char: pick(["~", "=", "-", "~"], detail),
      fg: "#7fc9c2",
      bg: "#12333d",
      biome: riverBand < 0.014 ? "river" : "shallows",
      speed: 0.72,
      dither: 0.22,
    });
  }

  const landmark = height > 0.38 && height < 0.78 ? landmarkAt(x, y) : null;

  if (landmark) {
    return landmark;
  }

  if (magic > 0.82 && height > 0.42 && height < 0.7) {
    return createTile({
      char: pick(["*", "+", "x", "o"], detail),
      fg: "#9ee7ff",
      bg: "#182342",
      biome: "crystal glade",
      speed: 0.92,
      dither: 0.3,
    });
  }

  if (height >= 0.34 && height < 0.42 && moisture > 0.76) {
    return createTile({
      char: pick(["T", "Y", ";", "i"], detail),
      fg: "#4a9a72",
      bg: "#142820",
      biome: "mangrove",
      speed: 0.66,
      dither: 0.32,
    });
  }

  if (height < 0.38 && heat < 0.28) {
    return createTile({
      char: pick(["=", "-", ".", "*"], detail),
      fg: "#d8ecef",
      bg: "#4a5a62",
      biome: "ice shelf",
      speed: 0.74,
      dither: 0.28,
    });
  }

  if (height < 0.42) {
    return createTile({
      char: pick([".", ".", ",", "_"], detail),
      fg: heat > 0.56 ? "#f1d68a" : "#d8c47a",
      bg: heat > 0.56 ? "#5b4527" : "#4d452c",
      biome: "beach",
      speed: 1.04,
      dither: 0.14,
    });
  }

  if (moisture > 0.88 && heat < 0.42 && height > 0.4 && height < 0.58 && karstBand > 0.58) {
    return createTile({
      char: pick(["o", "O", ".", ":"], detail),
      fg: "#6a8a5a",
      bg: "#1a2418",
      biome: "bog",
      speed: 0.58,
      dither: 0.36,
    });
  }

  if (magic < 0.16 && moisture > 0.48 && height > 0.4 && height < 0.74) {
    return createTile({
      char: pick([".", ":", "`", "'"], detail),
      fg: "#9ec4bd",
      bg: "#17232a",
      biome: "haunted vale",
      speed: 0.82,
      dither: 0.34,
    });
  }

  if (moisture > 0.62 && moisture < 0.78 && heat > 0.48 && heat < 0.64 && height > 0.44 && height < 0.72) {
    return createTile({
      char: pick(["|", "/", "\\", "T"], detail),
      fg: "#7ec45a",
      bg: "#1a3218",
      biome: "bamboo grove",
      speed: 0.76,
      dither: 0.26,
    });
  }

  if (moisture > 0.78 && heat > 0.54 && height > 0.42 && height < 0.76) {
    return createTile({
      char: speck > 0.54 ? "T" : pick(["Y", "&", ";", "T"], detail),
      fg: "#55c96a",
      bg: "#082a1f",
      biome: "rainforest",
      speed: 0.64,
      dither: 0.34,
    });
  }

  if (moisture > 0.66 && bloom > 0.62 && heat > 0.35 && height < 0.7) {
    return createTile({
      char: pick(["m", "n", "o", "."], detail),
      fg: "#f7b0d6",
      bg: "#2b1832",
      biome: "mushroom ring",
      speed: 0.86,
      dither: 0.24,
    });
  }

  if (bloom > 0.77 && moisture > 0.34 && heat > 0.38 && height < 0.68) {
    return createTile({
      char: pick(["*", "+", "'", "."], detail),
      fg: "#f2d46f",
      bg: "#233719",
      biome: "flower meadow",
      speed: 1.12,
      dither: 0.16,
    });
  }

  if (heat > 0.76 && ember > 0.78 && height > 0.5 && height < 0.72) {
    return createTile({
      char: pick(["~", "=", "!", "*"], detail),
      fg: "#ff6b3d",
      bg: "#220a08",
      biome: "lava flow",
      speed: 0.38,
      dither: 0.38,
    });
  }

  if (heat > 0.72 && ember > 0.68 && height >= 0.62) {
    return createTile({
      char: pick(["A", "^", "!", "*"], detail),
      fg: "#ff8a4f",
      bg: "#2b1210",
      biome: "volcanic slope",
      speed: 0.58,
      dither: 0.36,
    });
  }

  if (heat > 0.7 && ember > 0.7 && height > 0.48 && height < 0.78) {
    return createTile({
      char: pick(["`", ".", "*", ":"], detail),
      fg: "#ffad66",
      bg: "#3b1d16",
      biome: "ember heath",
      speed: 0.78,
      dither: 0.32,
    });
  }

  if (canyonBand < 0.011 && height > 0.48 && height < 0.74 && moisture < 0.45) {
    return createTile({
      char: pick(["|", "/", "\\", "v"], detail),
      fg: "#c49a6a",
      bg: "#2a2018",
      biome: "canyon",
      speed: 0.68,
      dither: 0.34,
    });
  }

  if (heat > 0.65 && moisture > 0.34 && moisture < 0.55 && ember > 0.55 && height > 0.46 && height < 0.66) {
    return createTile({
      char: pick(["^", "!", "~", "*"], detail),
      fg: "#c8e8f0",
      bg: "#2a3a38",
      biome: "geyser basin",
      speed: 0.72,
      dither: 0.3,
    });
  }

  if (trailBand < 0.019 && height < 0.76) {
    return createTile({
      char: pick(["=", "-", ".", ":"], detail),
      fg: "#d8b46b",
      bg: "#3b2a18",
      biome: "trail",
      speed: 1.45,
      dither: 0.1,
    });
  }

  if (heat > 0.58 && moisture < 0.14 && height > 0.4 && height < 0.48) {
    return createTile({
      char: pick(["_", "-", ".", "_"], detail),
      fg: "#e8e4d0",
      bg: "#6a6458",
      biome: "salt flat",
      speed: 0.88,
      dither: 0.2,
    });
  }

  if (heat > 0.66 && moisture < 0.3 && height > 0.42 && height < 0.68) {
    return createTile({
      char: pick([".", ":", "`", "~"], detail),
      fg: "#eac46a",
      bg: "#5a3d20",
      biome: "dune desert",
      speed: 0.84,
      dither: 0.28,
    });
  }

  if (height > 0.78 && height <= 0.84 && moisture > 0.4 && heat < 0.52) {
    return createTile({
      char: pick(["*", "'", ".", "+"], detail),
      fg: "#d4e8a0",
      bg: "#3a4a32",
      biome: "alpine meadow",
      speed: 0.94,
      dither: 0.18,
    });
  }

  if (height > 0.84) {
    return createTile({
      char: pick(["A", "^", "^", "*"], detail),
      fg: heat < 0.4 ? "#fff8df" : "#d5cfb8",
      bg: heat < 0.4 ? "#6b6a5d" : "#4b4a44",
      biome: heat < 0.4 ? "snow peak" : "mountain",
      speed: 0.52,
      dither: 0.32,
    });
  }

  if (heat > 0.55 && moisture < 0.22 && height > 0.48 && height < 0.7) {
    return createTile({
      char: pick(["-", "/", "\\", "v"], detail),
      fg: "#d4825a",
      bg: "#3a2418",
      biome: "badlands",
      speed: 0.8,
      dither: 0.32,
    });
  }

  if (magic > 0.35 && magic < 0.55 && moisture < 0.35 && height > 0.5 && height < 0.68) {
    return createTile({
      char: pick(["|", "I", "!", "|"], detail),
      fg: "#b8a882",
      bg: "#3a3428",
      biome: "petrified forest",
      speed: 0.76,
      dither: 0.28,
    });
  }

  if (height > 0.66 && moisture < 0.42) {
    return createTile({
      char: pick(["^", "n", "o", "%"], detail),
      fg: heat > 0.54 ? "#c4aa82" : "#b8b2a2",
      bg: heat > 0.54 ? "#3b3028" : "#303033",
      biome: "rocky area",
      speed: 0.72,
      dither: 0.3,
    });
  }

  if (height > 0.72) {
    return createTile({
      char: pick(["^", "^", "n", "A"], detail),
      fg: "#c0ad73",
      bg: "#393327",
      biome: "hills",
      speed: 0.78,
      dither: 0.24,
    });
  }

  if (heat > 0.68 && moisture < 0.34) {
    return createTile({
      char: pick([".", ".", ":", "`"], detail),
      fg: "#d6aa5a",
      bg: "#4d3a21",
      biome: "desert",
      speed: 0.9,
      dither: 0.26,
    });
  }

  if (heat < 0.32 && moisture < 0.32 && height > 0.42 && height < 0.58) {
    return createTile({
      char: pick([".", "'", "*", "."], detail),
      fg: "#c8d4c0",
      bg: "#4a5248",
      biome: "tundra",
      speed: 0.84,
      dither: 0.26,
    });
  }

  if (heat > 0.62 && moisture > 0.28 && moisture < 0.46 && height > 0.44 && height < 0.64) {
    return createTile({
      char: speck > 0.72 ? "T" : pick([".", "'", ",", "."], detail),
      fg: "#c4a85a",
      bg: "#4a4220",
      biome: "savanna",
      speed: 0.96,
      dither: 0.2,
    });
  }

  if (moisture > 0.38 && moisture < 0.52 && heat > 0.42 && heat < 0.58 && height > 0.44 && height < 0.6) {
    return createTile({
      char: pick(["'", '"', ".", ","], detail),
      fg: "#d8c878",
      bg: "#4a4828",
      biome: "prairie",
      speed: 1.06,
      dither: 0.16,
    });
  }

  if (moisture > 0.72 && heat > 0.36) {
    return createTile({
      char: pick([";", ",", "i", "."], detail),
      fg: "#72b878",
      bg: "#193127",
      biome: "marsh",
      speed: 0.7,
      dither: 0.24,
    });
  }

  if (heat < 0.38 && moisture > 0.58 && height > 0.44 && height < 0.74) {
    return createTile({
      char: speck > 0.55 ? "T" : pick(["*", "+", "T", "|"], detail),
      fg: "#3d7a5a",
      bg: "#142218",
      biome: "taiga",
      speed: 0.74,
      dither: 0.3,
    });
  }

  if (moisture > 0.58) {
    return createTile({
      char: speck > 0.6 ? "T" : pick(["*", "*", "+", "T"], detail),
      fg: "#4aa861",
      bg: "#102718",
      biome: "forest",
      speed: 0.8,
      dither: 0.28,
    });
  }

  if (heat < 0.29) {
    return createTile({
      char: pick(["*", ".", ",", "."], detail),
      fg: "#e9e5c9",
      bg: "#575d4f",
      biome: "frost",
      speed: 0.86,
      dither: 0.3,
    });
  }

  if (moisture < 0.28) {
    return createTile({
      char: pick([".", ",", ".", ":"], detail),
      fg: "#b7bc66",
      bg: "#3b3b21",
      biome: "scrub",
      speed: 1,
      dither: 0.18,
    });
  }

  return createTile({
    char: pick([".", ",", "'", '"'], detail),
    fg: "#a7d76d",
    bg: "#1d3b24",
    biome: "grassland",
    speed: 1.08,
    dither: 0.14,
  });
};

const positiveModulo = (value, size) => ((value % size) + size) % size;

const castleTileAt = (x, y, seed = 0) => {
  const roomSize = CASTLE_ROOM_SIZE;
  const localX = positiveModulo(x + Math.floor(seed * 7), roomSize);
  const localY = positiveModulo(y + Math.floor(seed * 11), roomSize);
  const roomX = Math.floor((x + seed) / roomSize);
  const roomY = Math.floor((y - seed) / roomSize);
  const roomNoise = hash2(roomX, roomY, 1200);
  const inRoom = localX > 3 && localX < 15 && localY > 3 && localY < 15 && roomNoise > 0.18;
  const inHorizontalHall = localY >= 8 && localY <= 10;
  const inVerticalHall = localX >= 8 && localX <= 10;
  const inHall = inHorizontalHall || inVerticalHall;
  const inStartCorridor = Math.abs(y) <= 1 && x > 1 && x < 9;
  const detail = hash2(x, y, 1201 + seed);
  const shimmer = fbm((x + seed) * 0.11, (y - seed) * 0.11, 1202, 3);
  const isReturnStair =
    (Math.abs(x) <= 1 && Math.abs(y) <= 1) ||
    (!inStartCorridor && localX === 9 && localY === 9 && hash2(roomX, roomY, 1230 + seed) > 0.72);

  if (isReturnStair) {
    return createTile({
      char: "<",
      fg: "#fff0b8",
      bg: "#22170d",
      biome: "moon stair",
      speed: 1.12,
      dither: 0.2,
    });
  }

  if (inStartCorridor) {
    return createTile({
      char: pick([".", ".", ":", ","], detail),
      fg: "#9a8f77",
      bg: "#17131a",
      biome: "castle corridor",
      speed: 1,
      dither: 0.3,
    });
  }

  if (!inRoom && !inHall) {
    return createTile({
      char: pick(["#", "#", "%", "8"], detail),
      fg: "#6f6a79",
      bg: "#111018",
      biome: "castle wall",
      speed: 0,
      dither: 0.42,
    });
  }

  if (detail > 0.985) {
    return createTile({
      char: "!",
      fg: "#ffd27a",
      bg: "#2b1d16",
      biome: "torch hall",
      speed: 1,
      dither: 0.24,
    });
  }

  if (shimmer > 0.76 && inRoom) {
    return createTile({
      char: pick(["~", "=", "-"], detail),
      fg: "#72d9d7",
      bg: "#10262f",
      biome: "mirror pool",
      speed: 0.72,
      dither: 0.3,
    });
  }

  if (roomNoise > 0.82 && inRoom) {
    return createTile({
      char: pick(["+", "x", "*", "."], detail),
      fg: "#d7c4ff",
      bg: "#231833",
      biome: "crown chamber",
      speed: 1,
      dither: 0.22,
    });
  }

  if (inRoom && detail < 0.08) {
    return createTile({
      char: pick(["c", "u", "n"], detail * 10),
      fg: "#b9e27b",
      bg: "#182416",
      biome: "ghost kitchen",
      speed: 0.95,
      dither: 0.2,
    });
  }

  if (inHall && (localX === 8 || localX === 10 || localY === 8 || localY === 10) && detail > 0.88) {
    return createTile({
      char: "+",
      fg: "#dfc17d",
      bg: "#201711",
      biome: "locked gate",
      speed: 0.9,
      dither: 0.22,
    });
  }

  return createTile({
    char: pick([".", ".", ",", ":"], detail),
    fg: inRoom ? "#b7b2c7" : "#9a8f77",
    bg: inRoom ? "#1b1924" : "#17131a",
    biome: inRoom ? "underground castle" : "castle corridor",
    speed: 1,
    dither: inRoom ? 0.24 : 0.3,
  });
};

const getTileForWorld = (world, x, y) => {
  if (world.level === "castle") {
    return castleTileAt(x, y, world.levelSeed);
  }

  return tileAt(x, y);
};

const canEnterTile = (world, x, y) =>
  getTileForWorld(world, Math.round(x), Math.round(y)).speed > MIN_PASSABLE_SPEED;

const canReachNearbyTile = (world, targetX, targetY) => {
  if (!canEnterTile(world, targetX, targetY)) {
    return false;
  }

  const originX = Math.round(world.x);
  const originY = Math.round(world.y);
  const dx = targetX - originX;
  const dy = targetY - originY;

  if (Math.abs(dx) > 1 || Math.abs(dy) > 1) {
    return false;
  }

  if (dx === 0 || dy === 0) {
    return true;
  }

  return canEnterTile(world, originX + dx, originY) || canEnterTile(world, originX, originY + dy);
};

const moveWorld = (world, input, speed, delta) => {
  const totalX = input.x * speed * delta;
  const totalY = input.y * speed * delta;
  const totalDistance = Math.hypot(totalX, totalY);

  if (totalDistance <= 0) {
    return 0;
  }

  const steps = Math.max(1, Math.ceil(totalDistance / MAX_MOVEMENT_STEP));
  const stepX = totalX / steps;
  const stepY = totalY / steps;
  let movedDistance = 0;

  for (let step = 0; step < steps; step += 1) {
    if (canEnterTile(world, world.x + stepX, world.y + stepY)) {
      world.x += stepX;
      world.y += stepY;
      movedDistance += Math.hypot(stepX, stepY);
      continue;
    }

    let movedThisStep = false;

    if (Math.abs(stepX) > 0 && canEnterTile(world, world.x + stepX, world.y)) {
      world.x += stepX;
      movedDistance += Math.abs(stepX);
      movedThisStep = true;
    }

    if (Math.abs(stepY) > 0 && canEnterTile(world, world.x, world.y + stepY)) {
      world.y += stepY;
      movedDistance += Math.abs(stepY);
      movedThisStep = true;
    }

    if (!movedThisStep) {
      break;
    }
  }

  return movedDistance;
};

const getStoredHighScore = () => {
  const value = Number(window.localStorage.getItem(HIGH_SCORE_KEY));
  return Number.isFinite(value) ? value : 0;
};

const clearInputState = (input) => {
  input.pointer.active = false;
  input.pointer.dx = 0;
  input.pointer.dy = 0;
  input.keys.clear();
  Object.keys(input.buttons).forEach((direction) => {
    input.buttons[direction] = false;
  });
};

const getWorldScope = (world) => `${world.level}:${Math.floor(world.levelSeed || 0)}`;

const getWeightedCharacterType = (terrain, world, sectorX, sectorY) => {
  const biomeWeights = {
    forest: ["fairy", "hermit", "wizard", "crow", "cat", "thief"],
    taiga: ["hermit", "crow", "skeleton", "wizard", "cat"],
    beach: ["mermaid", "fairy", "shopkeeper", "scholar", "ghost"],
    mangrove: ["toad", "mermaid", "ghoul", "crow", "hermit"],
    "ice shelf": ["ghost", "scholar", "skeleton", "mermaid"],
    "deep water": ["mermaid", "ghost", "scholar", "wizard"],
    river: ["mermaid", "fairy", "thief", "crow"],
    shallows: ["mermaid", "fairy", "shopkeeper", "crow"],
    "kelp forest": ["mermaid", "toad", "ghoul", "scholar"],
    "coral reef": ["mermaid", "fairy", "shopkeeper", "crow"],
    "dune desert": ["thief", "shopkeeper", "wizard", "skeleton", "monster"],
    desert: ["thief", "shopkeeper", "wizard", "skeleton", "crow"],
    badlands: ["skeleton", "thief", "crow", "monster", "wizard"],
    "salt flat": ["skeleton", "scholar", "ghost", "crow"],
    canyon: ["thief", "skeleton", "crow", "hermit", "monster"],
    "rocky area": ["skeleton", "monster", "scholar", "mason", "wizard"],
    mountain: ["hermit", "skeleton", "crow", "wizard", "mason"],
    "snow peak": ["ghost", "hermit", "skeleton", "scholar"],
    "alpine meadow": ["fairy", "hermit", "crow", "goose", "cat"],
    rainforest: ["fairy", "monster", "wizard", "ghoul", "toad"],
    "bamboo grove": ["fairy", "toad", "hermit", "wizard", "cat"],
    bog: ["ghoul", "toad", "ghost", "hermit", "crow"],
    "flower meadow": ["fairy", "cat", "crow", "shopkeeper", "wizard"],
    "mushroom ring": ["fairy", "ghoul", "toad", "wizard", "shopkeeper"],
    "haunted vale": ["ghost", "ghost", "ghoul", "skeleton", "scholar"],
    "standing stones": ["skeleton", "scholar", "hermit", "wizard", "ghost"],
    ruins: ["skeleton", "ghost", "mason", "hermit", "scholar"],
    camp: ["goose", "shopkeeper", "cat", "thief", "scholar"],
    "crystal glade": ["wizard", "fairy", "scholar", "ghost", "mermaid"],
    "lava flow": ["monster", "wizard", "skeleton", "ghoul"],
    "volcanic slope": ["monster", "wizard", "skeleton", "mason"],
    "ember heath": ["monster", "wizard", "skeleton", "crow"],
    marsh: ["toad", "ghoul", "mermaid", "crow", "hermit"],
    tundra: ["ghost", "crow", "skeleton", "hermit"],
    savanna: ["crow", "thief", "cat", "goose", "monster"],
    prairie: ["goose", "crow", "shopkeeper", "cat", "scholar"],
    "petrified forest": ["skeleton", "ghost", "scholar", "hermit", "wizard"],
    "geyser basin": ["wizard", "scholar", "monster", "skeleton"],
    hills: ["hermit", "crow", "skeleton", "shopkeeper"],
    scrub: ["crow", "thief", "cat", "shopkeeper"],
    frost: ["ghost", "scholar", "cat", "skeleton"],
    grassland: ["goose", "crow", "cat", "shopkeeper", "fairy"],
    garden: ["fairy", "cat", "crow", "hermit", "goose"],
    "cave mouth": ["skeleton", "ghost", "ghoul", "hermit", "thief"],
    trail: ["goose", "thief", "shopkeeper", "crow"],
    "underground castle": ["skeleton", "ghost", "goose", "mason", "cat"],
    "castle corridor": ["skeleton", "ghost", "goose", "ghoul"],
    "crown chamber": ["skeleton", "wizard", "goose", "scholar"],
    "ghost kitchen": ["ghost", "ghoul", "goose", "skeleton"],
    "mirror pool": ["ghost", "fairy", "mermaid", "scholar"],
    "torch hall": ["skeleton", "ghost", "mason", "wizard"],
    "locked gate": ["skeleton", "thief", "goose", "wizard"],
  };
  const ids =
    biomeWeights[terrain.biome] ||
    (world.level === "castle"
      ? ["skeleton", "ghost", "ghoul", "monster", "scholar"]
      : CHARACTER_TYPES.map((type) => type.id));
  const id = pick(ids, hash2(sectorX, sectorY, 904 + (world.levelSeed || 0)));

  return CHARACTER_TYPE_BY_ID[id] || CHARACTER_TYPES[0];
};

const generateCharacterForSector = (sectorX, sectorY, world) => {
  const worldSeed = world.levelSeed || 0;
  const spawnRoll = hash2(sectorX, sectorY, 900 + worldSeed);
  const spawnThreshold = world.level === "castle" ? 0.2 : CHARACTER_SPAWN_CHANCE;

  if (spawnRoll < spawnThreshold) {
    return null;
  }

  for (let attempt = 0; attempt < (world.level === "castle" ? 12 : 1); attempt += 1) {
    const x =
      sectorX * CHARACTER_SECTOR_SIZE +
      5 +
      Math.floor(hash2(sectorX, sectorY, 901 + worldSeed + attempt * 17) * (CHARACTER_SECTOR_SIZE - 10));
    const y =
      sectorY * CHARACTER_SECTOR_SIZE +
      5 +
      Math.floor(hash2(sectorX, sectorY, 902 + worldSeed + attempt * 23) * (CHARACTER_SECTOR_SIZE - 10));
    const terrain = getTileForWorld(world, x, y);

    if (terrain.speed < 0.62) {
      continue;
    }

    const type = getWeightedCharacterType(terrain, world, sectorX, sectorY);

    return {
      id: `${getWorldScope(world)}:${sectorX}:${sectorY}`,
      type: type.id,
      x,
      y,
    };
  }

  return null;
};

const getCharacterPosition = (character, world, time = 0) => {
  const type = CHARACTER_TYPE_BY_ID[character.type];
  const seed = hash2(character.x, character.y, 920);
  const phase = time * 0.001 * type.tempo + seed * Math.PI * 2;
  const driftX = Math.sin(phase) * type.wander;
  const driftY = Math.cos(phase * 0.83 + seed * 4) * type.wander * 0.62;
  const nextX = character.x + driftX;
  const nextY = character.y + driftY;
  const terrain = getTileForWorld(world, Math.round(nextX), Math.round(nextY));

  if (terrain.speed < 0.58) {
    return {
      x: character.x + driftX * 0.25,
      y: character.y + driftY * 0.25,
    };
  }

  return { x: nextX, y: nextY };
};

const getCharactersInBounds = (
  startX,
  endX,
  startY,
  endY,
  world,
  resolvedEncounters = EMPTY_SET,
  time = 0,
) => {
  const minSectorX = Math.floor(startX / CHARACTER_SECTOR_SIZE) - 1;
  const maxSectorX = Math.floor(endX / CHARACTER_SECTOR_SIZE) + 1;
  const minSectorY = Math.floor(startY / CHARACTER_SECTOR_SIZE) - 1;
  const maxSectorY = Math.floor(endY / CHARACTER_SECTOR_SIZE) + 1;
  const characters = [];

  for (let sectorY = minSectorY; sectorY <= maxSectorY; sectorY += 1) {
    for (let sectorX = minSectorX; sectorX <= maxSectorX; sectorX += 1) {
      const character = generateCharacterForSector(sectorX, sectorY, world);
      const position = character ? getCharacterPosition(character, world, time) : null;

      if (
        character &&
        !resolvedEncounters.has(character.id) &&
        position.x >= startX - 2 &&
        position.x <= endX + 2 &&
        position.y >= startY - 2 &&
        position.y <= endY + 2
      ) {
        characters.push({ ...character, currentX: position.x, currentY: position.y });
      }
    }
  }

  return characters;
};

const createEncounter = (character, { seenCount = 0, loreCount = 0, loreHeard = EMPTY_SET } = {}) => {
  const type = CHARACTER_TYPE_BY_ID[character.type];
  const hashAt = (seed) => hash2(character.x, character.y, seed);
  const loreMature = loreCount >= 7;
  const { intro, question } = buildEncounterDialogue(type, hashAt, { seenCount, loreMature });
  const loreEntry = pickUnheardLore(type, loreHeard, hashAt);
  const loreLine = loreEntry?.line || null;

  return {
    ...type,
    ...character,
    type: type.id,
    intro,
    question,
    loreLine,
    loreKey: loreEntry?.key || null,
  };
};

const getNearbyCharacter = (
  world,
  resolvedEncounters = EMPTY_SET,
  time = 0,
  { npcMemory = {}, loreHeard = EMPTY_SET } = {},
) => {
  const { x, y } = world;
  const sectorX = Math.floor(x / CHARACTER_SECTOR_SIZE);
  const sectorY = Math.floor(y / CHARACTER_SECTOR_SIZE);
  let nearest = null;
  let nearestDistance = Infinity;

  for (let offsetY = -1; offsetY <= 1; offsetY += 1) {
    for (let offsetX = -1; offsetX <= 1; offsetX += 1) {
      const character = generateCharacterForSector(sectorX + offsetX, sectorY + offsetY, world);

      if (!character || resolvedEncounters.has(character.id)) {
        continue;
      }

      const position = getCharacterPosition(character, world, time);
      const distance = Math.hypot(position.x - x, position.y - y);

      if (distance < NPC_TALK_RADIUS && distance < nearestDistance) {
        nearest = { ...character, x: position.x, y: position.y };
        nearestDistance = distance;
      }
    }
  }

  if (!nearest) {
    return null;
  }

  const seenCount = npcMemory[nearest.type] || 0;

  return createEncounter(nearest, {
    seenCount,
    loreCount: loreHeard.size,
    loreHeard,
  });
};

const computeGuideEntrance = (worldX, worldY) => {
  const sectorX = Math.floor(worldX / ENTRANCE_SECTOR_SIZE) + 1;
  const sectorY = Math.floor(worldY / ENTRANCE_SECTOR_SIZE);

  for (let attempt = 0; attempt < 16; attempt += 1) {
    const x =
      sectorX * ENTRANCE_SECTOR_SIZE +
      8 +
      Math.floor(hash2(sectorX, sectorY, 1315 + attempt) * (ENTRANCE_SECTOR_SIZE - 18));
    const y =
      sectorY * ENTRANCE_SECTOR_SIZE +
      8 +
      Math.floor(hash2(sectorX, sectorY, 1325 + attempt) * (ENTRANCE_SECTOR_SIZE - 18));
    const terrain = tileAt(x, y);

    if (terrain.speed >= 0.72 && terrain.biome !== "deep water" && terrain.biome !== "river") {
      return { sectorX, sectorY, x, y };
    }
  }

  return {
    sectorX,
    sectorY,
    x: sectorX * ENTRANCE_SECTOR_SIZE + 32,
    y: sectorY * ENTRANCE_SECTOR_SIZE + 28,
  };
};

const generateEntranceForSector = (sectorX, sectorY, guideEntrance = null) => {
  if (
    guideEntrance &&
    guideEntrance.sectorX === sectorX &&
    guideEntrance.sectorY === sectorY
  ) {
    const terrain = tileAt(guideEntrance.x, guideEntrance.y);

    if (terrain.speed >= 0.72 && terrain.biome !== "deep water" && terrain.biome !== "river") {
      const type = pick(ENTRANCE_TYPES, hash2(sectorX, sectorY, 1303));

      return {
        ...type,
        id: `entrance:guide:${sectorX}:${sectorY}`,
        x: guideEntrance.x,
        y: guideEntrance.y,
        seed: Math.floor(hash2(sectorX, sectorY, 1304) * 100000),
        guided: true,
      };
    }
  }

  const spawnRoll = hash2(sectorX, sectorY, 1300);

  if (spawnRoll < 0.56) {
    return null;
  }

  const x =
    sectorX * ENTRANCE_SECTOR_SIZE +
    7 +
    Math.floor(hash2(sectorX, sectorY, 1301) * (ENTRANCE_SECTOR_SIZE - 14));
  const y =
    sectorY * ENTRANCE_SECTOR_SIZE +
    7 +
    Math.floor(hash2(sectorX, sectorY, 1302) * (ENTRANCE_SECTOR_SIZE - 14));
  const terrain = tileAt(x, y);

  if (terrain.speed < 0.72 || terrain.biome === "deep water" || terrain.biome === "river") {
    return null;
  }

  const type = pick(ENTRANCE_TYPES, hash2(sectorX, sectorY, 1303));

  return {
    ...type,
    id: `entrance:${sectorX}:${sectorY}`,
    x,
    y,
    seed: Math.floor(hash2(sectorX, sectorY, 1304) * 100000),
  };
};

const getEntrancesInBounds = (startX, endX, startY, endY, guideEntrance = null) => {
  const minSectorX = Math.floor(startX / ENTRANCE_SECTOR_SIZE) - 1;
  const maxSectorX = Math.floor(endX / ENTRANCE_SECTOR_SIZE) + 1;
  const minSectorY = Math.floor(startY / ENTRANCE_SECTOR_SIZE) - 1;
  const maxSectorY = Math.floor(endY / ENTRANCE_SECTOR_SIZE) + 1;
  const entrances = [];

  for (let sectorY = minSectorY; sectorY <= maxSectorY; sectorY += 1) {
    for (let sectorX = minSectorX; sectorX <= maxSectorX; sectorX += 1) {
      const entrance = generateEntranceForSector(sectorX, sectorY, guideEntrance);

      if (
        entrance &&
        entrance.x >= startX - 2 &&
        entrance.x <= endX + 2 &&
        entrance.y >= startY - 2 &&
        entrance.y <= endY + 2
      ) {
        entrances.push(entrance);
      }
    }
  }

  return entrances;
};

const getNearbyEntrance = (world, guideEntrance = null) => {
  if (world.level !== "overworld") {
    return null;
  }

  const sectorX = Math.floor(world.x / ENTRANCE_SECTOR_SIZE);
  const sectorY = Math.floor(world.y / ENTRANCE_SECTOR_SIZE);

  for (let offsetY = -1; offsetY <= 1; offsetY += 1) {
    for (let offsetX = -1; offsetX <= 1; offsetX += 1) {
      const entrance = generateEntranceForSector(
        sectorX + offsetX,
        sectorY + offsetY,
        guideEntrance,
      );

      if (entrance && Math.hypot(entrance.x - world.x, entrance.y - world.y) < ENTRANCE_COLLISION_RADIUS) {
        return entrance;
      }
    }
  }

  return null;
};

const isCastleGoalExitReady = (castleGoal, time) =>
  !castleGoal?.exitReadyAt || time >= castleGoal.exitReadyAt;

const isNearCastleExit = (world, castleGoal = null, time = Number.POSITIVE_INFINITY) => {
  if (world.level !== "castle") {
    return false;
  }

  if (
    castleGoal?.complete &&
    castleGoal.exit &&
    isCastleGoalExitReady(castleGoal, time) &&
    Math.hypot(world.x - castleGoal.exit.x, world.y - castleGoal.exit.y) < 1.4 &&
    canReachNearbyTile(world, castleGoal.exit.x, castleGoal.exit.y)
  ) {
    return true;
  }

  for (let y = -1; y <= 1; y += 1) {
    for (let x = -1; x <= 1; x += 1) {
      const stairX = Math.round(world.x) + x;
      const stairY = Math.round(world.y) + y;
      const tile = castleTileAt(stairX, stairY, world.levelSeed);

      if (tile.biome === "moon stair" && canReachNearbyTile(world, stairX, stairY)) {
        return true;
      }
    }
  }

  return false;
};

const getNearbyCastleTorch = (world) => {
  if (world.level !== "castle") {
    return null;
  }

  for (let y = -1; y <= 1; y += 1) {
    for (let x = -1; x <= 1; x += 1) {
      const torchX = Math.round(world.x) + x;
      const torchY = Math.round(world.y) + y;
      const tile = castleTileAt(torchX, torchY, world.levelSeed);

      if (tile.biome === "torch hall" && canReachNearbyTile(world, torchX, torchY)) {
        return {
          id: `${world.levelSeed}:${torchX}:${torchY}`,
          x: torchX,
          y: torchY,
        };
      }
    }
  }

  return null;
};

const isNearLostWing = (world, quest) =>
  world.level === "overworld" &&
  !quest.wingFound &&
  Math.hypot(world.x - LOST_WING.x, world.y - LOST_WING.y) < 1.2;

const isNearGroundedFairy = (world, quest) =>
  world.level === "overworld" &&
  !quest.fairyHelped &&
  Math.hypot(world.x - GROUNDED_FAIRY.x, world.y - GROUNDED_FAIRY.y) < 1.4;

const canInvokeEnding = (quest, castleGoal, loreCount) => {
  if (!quest.fairyHelped || quest.endingInvoked) {
    return false;
  }

  const torchesDone = Boolean(castleGoal?.complete || quest.returnedFromCastle);
  const loreReady = loreCount >= LORE_INVOKE_THRESHOLD;

  return torchesDone && (loreReady || (castleGoal?.litTorches?.size ?? 0) >= 3);
};

const isOnLitMoonStair = (world, castleGoal, time) =>
  world.level === "castle" &&
  castleGoal?.complete &&
  castleGoal.exit &&
  isCastleGoalExitReady(castleGoal, time) &&
  Math.hypot(world.x - castleGoal.exit.x, world.y - castleGoal.exit.y) < 1.4 &&
  canReachNearbyTile(world, castleGoal.exit.x, castleGoal.exit.y);

const getNearbyInteract = (
  world,
  quest,
  castleGoal,
  time = Number.POSITIVE_INFINITY,
  loreCount = 0,
  resolvedEncounters = EMPTY_SET,
  { npcMemory = {}, loreHeard = EMPTY_SET } = {},
) => {
  if (isOnLitMoonStair(world, castleGoal, time) && canInvokeEnding(quest, castleGoal, loreCount)) {
    return { type: "invoke", label: `speak ${MYSTERY.king} on moon stair` };
  }

  if (isNearLostWing(world, quest)) {
    return { type: "wing", label: "pick up the lost fairy wing" };
  }

  if (isNearGroundedFairy(world, quest)) {
    return {
      type: "fairy",
      label: quest.wingFound ? "return the fairy wing" : "listen to the grounded fairy",
    };
  }

  const entrance = getNearbyEntrance(world, quest.guideEntrance);

  if (entrance) {
    return { type: "entrance", label: `enter ${entrance.name}`, entrance };
  }

  if (
    castleGoal?.complete &&
    castleGoal.exit &&
    !isCastleGoalExitReady(castleGoal, time) &&
    Math.hypot(world.x - castleGoal.exit.x, world.y - castleGoal.exit.y) < 1.4
  ) {
    return { type: "wait", label: QUEST_COPY.moonStairWaiting };
  }

  if (isNearCastleExit(world, castleGoal, time) && world.returnPosition) {
    return { type: "castle-exit", label: "take moon stair up" };
  }

  const torch = getNearbyCastleTorch(world);

  if (torch && castleGoal && !castleGoal.litTorches.has(torch.id)) {
    return {
      type: "torch",
      label: `light castle torch ${castleGoal.litTorches.size + 1}/${castleGoal.required}`,
      torch,
    };
  }

  const nearbyCharacter = getNearbyCharacter(world, resolvedEncounters, time, {
    npcMemory,
    loreHeard,
  });

  if (nearbyCharacter) {
    return {
      type: "npc",
      label: `talk to ${nearbyCharacter.name}`,
      character: nearbyCharacter,
    };
  }

  return null;
};

const persistCompletionMemory = (world, discoveries, loreHeard, inventory) => {
  window.localStorage.setItem(COMPLETION_KEY, "1");
  window.localStorage.setItem(
    MEMORY_KEY,
    JSON.stringify({
      completedAt: Date.now(),
      bestScore: world.score,
      loreCount: loreHeard.size,
      biomes: discoveries.biomes.size,
      characters: discoveries.characters.size,
      inventory: [...inventory],
    }),
  );
};

const getInputVector = (input) => {
  let x = 0;
  let y = 0;

  input.keys.forEach((direction) => {
    x += DIRECTIONS[direction].x;
    y += DIRECTIONS[direction].y;
  });

  Object.entries(input.buttons).forEach(([direction, active]) => {
    if (active) {
      x += DIRECTIONS[direction].x;
      y += DIRECTIONS[direction].y;
    }
  });

  if (input.pointer.active) {
    x += clamp(input.pointer.dx / 72, -1, 1);
    y += clamp(input.pointer.dy / 72, -1, 1);
  }

  const length = Math.hypot(x, y);

  if (length > 1) {
    return { x: x / length, y: y / length, active: true };
  }

  return { x, y, active: length > 0.02 };
};

const keyToDirection = (key) => {
  const normalizedKey = key.toLowerCase();

  if (normalizedKey === "arrowup" || normalizedKey === "w") return "up";
  if (normalizedKey === "arrowdown" || normalizedKey === "s") return "down";
  if (normalizedKey === "arrowleft" || normalizedKey === "a") return "left";
  if (normalizedKey === "arrowright" || normalizedKey === "d") return "right";

  return null;
};

const syncCanvasSize = (canvas) => {
  const pixelRatio = Math.min(window.devicePixelRatio || 1, MAX_PIXEL_RATIO);
  const rect = canvas.getBoundingClientRect();
  const width = Math.max(1, Math.floor(rect.width * pixelRatio));
  const height = Math.max(1, Math.floor(rect.height * pixelRatio));

  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
  }

  return {
    pixelRatio,
    width: width / pixelRatio,
    height: height / pixelRatio,
  };
};

const getTileFrame = (tile, x, y, time) => {
  const frame = Math.floor(time * 0.006 + hash2(x, y, 830) * 8);
  const animatedGlyphs = {
    "deep water": ["~", "=", "~", "-"],
    river: ["~", "-", "=", "~"],
    shallows: ["-", "~", ".", "="],
    "kelp forest": [";", "y", "Y", ";"],
    "coral reef": ["*", "+", "o", "."],
    mangrove: ["T", "Y", ";", "i"],
    "ice shelf": ["=", "-", ".", "*"],
    beach: [".", ",", "_", "."],
    bog: ["o", "O", ".", ":"],
    "bamboo grove": ["|", "/", "\\", "T"],
    "dune desert": [".", ":", "`", "~"],
    desert: [".", ".", ":", "`"],
    badlands: ["-", "/", "\\", "v"],
    "salt flat": ["_", "-", ".", "_"],
    canyon: ["|", "/", "\\", "v"],
    "rocky area": ["^", "n", "o", "%"],
    mountain: ["A", "^", "*", "^"],
    "snow peak": ["*", "^", "*", "."],
    "alpine meadow": ["*", "'", "+", "."],
    forest: ["T", "*", "T", "+"],
    taiga: ["T", "*", "|", "+"],
    rainforest: ["T", "Y", "&", ";"],
    tundra: [".", "'", "*", "."],
    savanna: ["T", ".", "'", ","],
    prairie: ["'", '"', ".", ","],
    marsh: [";", ",", "i", "."],
    "petrified forest": ["|", "I", "!", "|"],
    "geyser basin": ["^", "!", "~", "*"],
    "cave mouth": ["O", "o", "(", ")"],
    "flower meadow": ["*", "+", "'", "."],
    "crystal glade": ["*", "+", "x", "o"],
    "haunted vale": [".", ":", "`", "'"],
    "lava flow": ["~", "=", "!", "*"],
    "volcanic slope": ["A", "^", "!", "*"],
    "ember heath": ["`", ".", "*", ":"],
    "mushroom ring": ["m", "n", "o", "."],
    "standing stones": ["I", "|", ":", "o"],
    "moon stair": ["<", "<", "^", "<"],
    "torch hall": ["!", "i", "!", "|"],
    "mirror pool": ["~", "=", "-", "~"],
    "ghost kitchen": ["c", "u", "n", "o"],
    "crown chamber": ["+", "*", "x", "+"],
  };
  const glyphs = animatedGlyphs[tile.biome];

  if (!glyphs) {
    return tile;
  }

  return {
    ...tile,
    char: glyphs[frame % glyphs.length],
  };
};

const drawAmbientMotes = (context, width, height, position, time) => {
  context.save();
  context.font = `700 13px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace`;
  context.textAlign = "center";
  context.textBaseline = "middle";

  for (let index = 0; index < 54; index += 1) {
    const seed = index * 13.37;
    const driftX = time * (0.008 + hash2(index, 1, 880) * 0.018);
    const driftY = Math.sin(time * 0.001 + seed) * 12;
    const x = (hash2(index, 2, 881) * width + driftX - position.x * 0.9) % width;
    const y = (hash2(index, 3, 882) * height + driftY - position.y * 0.45) % height;
    const wrappedX = x < 0 ? x + width : x;
    const wrappedY = y < 0 ? y + height : y;
    const twinkle = (Math.sin(time * 0.004 + seed) + 1) / 2;

    context.globalAlpha = 0.08 + twinkle * 0.2;
    context.fillStyle = position.level === "castle" ? (index % 4 === 0 ? "#d7c4ff" : "#72d9d7") : index % 5 === 0 ? "#9ee7ff" : "#ffe9a3";
    context.fillText(index % 7 === 0 ? "*" : ".", wrappedX, wrappedY);
  }

  context.restore();
};

const drawWorld = (
  canvas,
  position,
  resolvedEncounters = EMPTY_SET,
  time = 0,
  quest = { wingFound: false, fairyHelped: false },
  castleGoal = null,
) => {
  const context = canvas.getContext("2d");
  const { pixelRatio, width, height } = syncCanvasSize(canvas);

  context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
  context.imageSmoothingEnabled = false;
  context.fillStyle = "#030403";
  context.fillRect(0, 0, width, height);
  context.font = `700 ${FONT_SIZE}px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace`;
  context.textAlign = "center";
  context.textBaseline = "middle";

  const startX = Math.floor(position.x - width / CELL_WIDTH / 2) - 2;
  const endX = Math.ceil(position.x + width / CELL_WIDTH / 2) + 2;
  const startY = Math.floor(position.y - height / CELL_HEIGHT / 2) - 2;
  const endY = Math.ceil(position.y + height / CELL_HEIGHT / 2) + 2;

  for (let worldY = startY; worldY <= endY; worldY += 1) {
    for (let worldX = startX; worldX <= endX; worldX += 1) {
      const baseTile = getTileForWorld(position, worldX, worldY);
      const litTorch =
        position.level === "castle" &&
        castleGoal?.litTorches.has(`${position.levelSeed}:${worldX}:${worldY}`);
      const tile = litTorch
        ? { ...baseTile, char: "*", fg: "#fff0b8", bg: "#47311f", biome: "lit torch" }
        : getTileFrame(baseTile, worldX, worldY, time);
      const screenX = Math.round((worldX - position.x) * CELL_WIDTH + width / 2);
      const screenY = Math.round((worldY - position.y) * CELL_HEIGHT + height / 2);
      const parity = Math.abs(worldX + worldY) % 2;
      const noise = hash2(worldX, worldY, 500);

      context.fillStyle = tile.bg;
      context.fillRect(screenX, screenY, CELL_WIDTH + 1, CELL_HEIGHT + 1);

      if (parity === 0 || noise > 0.72) {
        context.fillStyle = `rgba(0, 0, 0, ${tile.dither})`;
        context.fillRect(screenX, screenY, CELL_WIDTH + 1, CELL_HEIGHT + 1);
      }

      if (noise < 0.09) {
        context.fillStyle = "rgba(255, 244, 186, 0.08)";
        context.fillRect(screenX + 1, screenY + 1, 2, 2);
      }

      context.fillStyle = tile.fg;
      context.fillText(tile.char, screenX + CELL_WIDTH / 2, screenY + CELL_HEIGHT / 2 + 1);
    }
  }

  if (position.level === "overworld") {
    if (!quest.wingFound) {
      const pulse = (Math.sin(time * 0.008) + 1) / 2;
      const screenX = Math.round((LOST_WING.x - position.x) * CELL_WIDTH + width / 2);
      const screenY = Math.round((LOST_WING.y - position.y) * CELL_HEIGHT + height / 2);

      context.fillStyle = LOST_WING.bg;
      context.fillRect(screenX - 1, screenY - 1, CELL_WIDTH + 3, CELL_HEIGHT + 3);
      context.fillStyle = `rgba(246, 166, 255, ${0.16 + pulse * 0.26})`;
      context.fillRect(screenX - 2, screenY - 2, CELL_WIDTH + 5, CELL_HEIGHT + 5);
      context.fillStyle = LOST_WING.fg;
      context.fillText(LOST_WING.char, screenX + CELL_WIDTH / 2, screenY + CELL_HEIGHT / 2 + 1);
    }

    if (!quest.fairyHelped) {
      const bob = Math.sin(time * 0.006) * 2;
      const screenX = Math.round((GROUNDED_FAIRY.x - position.x) * CELL_WIDTH + width / 2);
      const screenY = Math.round((GROUNDED_FAIRY.y - position.y) * CELL_HEIGHT + height / 2 + bob);

      context.fillStyle = GROUNDED_FAIRY.bg;
      context.fillRect(screenX - 1, screenY - 1, CELL_WIDTH + 3, CELL_HEIGHT + 3);
      context.fillStyle = GROUNDED_FAIRY.fg;
      context.fillText(GROUNDED_FAIRY.char, screenX + CELL_WIDTH / 2, screenY + CELL_HEIGHT / 2 + 1);
    }

    getEntrancesInBounds(startX, endX, startY, endY, quest.guideEntrance).forEach((entrance) => {
      const pulse = (Math.sin(time * 0.006 + hash2(entrance.x, entrance.y, 1310) * 8) + 1) / 2;
      const blessed = quest.fairyHelped;
      const guided = entrance.guided;
      const screenX = Math.round((entrance.x - position.x) * CELL_WIDTH + width / 2);
      const screenY = Math.round((entrance.y - position.y) * CELL_HEIGHT + height / 2);

      context.fillStyle = entrance.bg;
      context.fillRect(screenX - 2, screenY - 2, CELL_WIDTH + 5, CELL_HEIGHT + 5);
      context.fillStyle = `rgba(255, 207, 106, ${
        guided ? 0.35 + pulse * 0.45 : blessed ? 0.22 + pulse * 0.34 : 0.15 + pulse * 0.25
      })`;
      context.fillRect(screenX - 1, screenY - 1, CELL_WIDTH + 3, CELL_HEIGHT + 3);
      context.fillStyle = entrance.fg;
      context.fillText(entrance.char, screenX + CELL_WIDTH / 2, screenY + CELL_HEIGHT / 2 + 1);
    });
  }

  if (position.level === "castle" && castleGoal?.complete && castleGoal.exit) {
    const pulse = (Math.sin(time * 0.01) + 1) / 2;
    const screenX = Math.round((castleGoal.exit.x - position.x) * CELL_WIDTH + width / 2);
    const screenY = Math.round((castleGoal.exit.y - position.y) * CELL_HEIGHT + height / 2);

    context.fillStyle = "#22170d";
    context.fillRect(screenX - 2, screenY - 2, CELL_WIDTH + 5, CELL_HEIGHT + 5);
    context.fillStyle = `rgba(255, 240, 184, ${0.22 + pulse * 0.32})`;
    context.fillRect(screenX - 1, screenY - 1, CELL_WIDTH + 3, CELL_HEIGHT + 3);
    context.fillStyle = "#fff0b8";
    context.fillText("<", screenX + CELL_WIDTH / 2, screenY + CELL_HEIGHT / 2 + 1);
  }

  getCharactersInBounds(startX, endX, startY, endY, position, resolvedEncounters, time).forEach((character) => {
    const type = CHARACTER_TYPE_BY_ID[character.type];
    const bob = Math.sin(time * 0.006 + hash2(character.x, character.y, 833) * 6) * 2;
    const screenX = Math.round((character.currentX - position.x) * CELL_WIDTH + width / 2);
    const screenY = Math.round((character.currentY - position.y) * CELL_HEIGHT + height / 2 + bob);

    context.fillStyle = type.bg;
    context.fillRect(screenX - 1, screenY - 1, CELL_WIDTH + 3, CELL_HEIGHT + 3);
    context.fillStyle = "rgba(255, 255, 255, 0.18)";
    context.fillRect(screenX, screenY, CELL_WIDTH + 1, 1);
    context.fillStyle = type.fg;
    context.fillText(type.glyph, screenX + CELL_WIDTH / 2, screenY + CELL_HEIGHT / 2 + 1);
  });

  drawAmbientMotes(context, width, height, position, time);

  const centerX = width / 2;
  const centerY = height / 2;
  context.fillStyle = "rgba(0, 0, 0, 0.38)";
  context.fillRect(centerX - CELL_WIDTH, centerY - CELL_HEIGHT, CELL_WIDTH * 3, CELL_HEIGHT * 3);
  context.fillStyle = "#fff2a8";
  context.fillText("@", centerX + CELL_WIDTH / 2, centerY + CELL_HEIGHT / 2 + 1);

  const vignette = context.createRadialGradient(
    centerX,
    centerY,
    Math.min(width, height) * 0.18,
    centerX,
    centerY,
    Math.max(width, height) * 0.68,
  );
  vignette.addColorStop(0, "rgba(0, 0, 0, 0)");
  vignette.addColorStop(1, "rgba(0, 0, 0, 0.55)");
  context.fillStyle = vignette;
  context.fillRect(0, 0, width, height);
};

const Home = () => {
  const canvasRef = useRef(null);
  const frameRef = useRef(null);
  const toastTimeoutRef = useRef(null);
  const resolvedEncountersRef = useRef(new Set());
  const npcMemoryRef = useRef({});
  const loreHeardRef = useRef(new Set());
  const questRef = useRef({
    wingFound: false,
    fairyHelped: false,
    castleEntered: false,
    returnedFromCastle: false,
    endingInvoked: false,
    guideEntrance: null,
  });
  const castleGoalRef = useRef(null);
  const discoveriesRef = useRef({
    biomes: new Set(),
    characters: new Set(),
    places: new Set(),
    items: new Set(),
    levels: new Set(["overworld"]),
    notes: [],
  });
  const inventoryRef = useRef(new Set());
  const audioRef = useRef({
    context: null,
    master: null,
    interval: null,
    stepAt: 0,
  });
  const worldRef = useRef({
    level: "overworld",
    levelName: OVERWORLD_LEVEL_NAME,
    levelSeed: 0,
    returnPosition: null,
    x: 0,
    y: 0,
    distance: 0,
    bonus: 0,
    score: 0,
    lastTime: 0,
    lastHudTime: 0,
  });
  const encounterRef = useRef(null);
  const highlightedChoiceRef = useRef(0);
  const resolveEncounterRef = useRef(null);
  const nearbyInteractRef = useRef(null);
  const tryInteractRef = useRef(null);
  const inputRef = useRef({
    keys: new Set(),
    buttons: {
      up: false,
      down: false,
      left: false,
      right: false,
    },
    pointer: {
      active: false,
      startX: 0,
      startY: 0,
      dx: 0,
      dy: 0,
    },
  });
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(getStoredHighScore);
  const bestScoreRef = useRef(bestScore);
  const [encounter, setEncounter] = useState(null);
  const [highlightedChoice, setHighlightedChoice] = useState(0);
  const [toast, setToast] = useState(null);
  const [audioOn, setAudioOn] = useState(false);
  const [inventory, setInventory] = useState([]);
  const [rumor, setRumor] = useState(QUEST_COPY.startRumor);
  const [quest, setQuest] = useState(questRef.current);
  const [castleGoal, setCastleGoal] = useState(null);
  const [nearbyInteract, setNearbyInteract] = useState(null);
  const [endingScene, setEndingScene] = useState(null);
  const [worldMemory, setWorldMemory] = useState(() => {
    try {
      return JSON.parse(window.localStorage.getItem(MEMORY_KEY) || "null");
    } catch {
      return null;
    }
  });
  const [journal, setJournal] = useState({
    biomes: 0,
    characters: 0,
    places: 0,
    items: 0,
    levels: 1,
    notes: [],
  });
  const [hud, setHud] = useState({
    x: 0,
    y: 0,
    biome: tileAt(0, 0).biome,
    glyph: tileAt(0, 0).char,
    distance: 0,
    score: 0,
    loreCount: 0,
    levelName: OVERWORLD_LEVEL_NAME,
  });

  const saveBestScore = useCallback((nextScore) => {
    if (nextScore <= bestScoreRef.current) {
      return;
    }

    bestScoreRef.current = nextScore;
    window.localStorage.setItem(HIGH_SCORE_KEY, String(nextScore));
    setBestScore(nextScore);
  }, []);

  const showToast = useCallback((nextToast, duration = 4200) => {
    if (toastTimeoutRef.current) {
      window.clearTimeout(toastTimeoutRef.current);
    }

    setToast(nextToast);
    toastTimeoutRef.current = window.setTimeout(() => {
      setToast(null);
      toastTimeoutRef.current = null;
    }, duration);
  }, []);

  const recordDiscovery = useCallback((kind, value, note) => {
    const discoveries = discoveriesRef.current;
    const bucket = discoveries[kind];

    if (!bucket || bucket.has(value)) {
      return false;
    }

    bucket.add(value);

    if (note) {
      discoveries.notes = [note, ...discoveries.notes].slice(0, 4);
    }

    setJournal({
      biomes: discoveries.biomes.size,
      characters: discoveries.characters.size,
      places: discoveries.places.size,
      items: discoveries.items.size,
      levels: discoveries.levels.size,
      notes: discoveries.notes,
    });

    return true;
  }, []);

  const addInventoryItem = useCallback(
    (item) => {
      if (inventoryRef.current.has(item)) {
        return false;
      }

      inventoryRef.current.add(item);
      setInventory([...inventoryRef.current]);
      recordDiscovery("items", item, MAGICAL_ITEM_BLURBS[item] || `Found ${item}.`);
      return true;
    },
    [recordDiscovery],
  );

  const playEffect = useCallback((type) => {
    const audio = audioRef.current;

    if (!audio.context || !audio.master) {
      return;
    }

    const context = audio.context;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const now = context.currentTime;
    const frequency = {
      step: 180,
      encounter: 660,
      portal: 220,
      reward: 880,
      mischief: 330,
    }[type] || 440;

    oscillator.type = type === "mischief" ? "triangle" : "sine";
    oscillator.frequency.setValueAtTime(frequency, now);
    oscillator.frequency.exponentialRampToValueAtTime(type === "portal" ? frequency * 1.8 : frequency * 0.7, now + 0.22);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(type === "step" ? 0.025 : 0.08, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.28);
    oscillator.connect(gain);
    gain.connect(audio.master);
    oscillator.start(now);
    oscillator.stop(now + 0.3);
  }, []);

  const playBirdCall = useCallback((bird) => {
    const audio = audioRef.current;

    if (!audio.context || !audio.master) {
      return;
    }

    const context = audio.context;
    const now = context.currentTime;

    for (let index = 0; index < bird.chirps; index += 1) {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      const filter = context.createBiquadFilter();
      const start = now + index * (0.045 + (bird.index % 4) * 0.012);
      const frequency = bird.base + Math.sin(index + bird.index) * 120;

      oscillator.type = bird.index % 3 === 0 ? "square" : "sine";
      oscillator.frequency.setValueAtTime(frequency, start);
      oscillator.frequency.exponentialRampToValueAtTime(frequency * (1 + bird.lift * 0.16), start + 0.055);
      filter.type = "bandpass";
      filter.frequency.value = frequency * 1.2;
      filter.Q.value = 7 + bird.lift * 2;
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(0.018, start + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.09);
      oscillator.connect(filter);
      filter.connect(gain);
      gain.connect(audio.master);
      oscillator.start(start);
      oscillator.stop(start + 0.11);
    }
  }, []);

  const toggleAudio = useCallback(async () => {
    const audio = audioRef.current;

    if (audio.interval) {
      window.clearInterval(audio.interval);
      audio.interval = null;
      audio.master?.gain.exponentialRampToValueAtTime(0.0001, audio.context.currentTime + 0.25);
      setAudioOn(false);
      return;
    }

    const AudioContext = window.AudioContext || window.webkitAudioContext;

    if (!AudioContext) {
      showToast({ scoreDelta: 0, body: "This browser does not know the old songs.", jumped: 0 }, 2600);
      return;
    }

    if (!audio.context) {
      audio.context = new AudioContext();
      audio.master = audio.context.createGain();
      audio.master.gain.value = 0.0001;
      audio.master.connect(audio.context.destination);
    }

    await audio.context.resume();
    audio.master.gain.cancelScheduledValues(audio.context.currentTime);
    audio.master.gain.exponentialRampToValueAtTime(0.16, audio.context.currentTime + 0.4);

    const scales = {
      overworld: [261.63, 293.66, 329.63, 392, 440, 493.88, 523.25, 659.25],
      castle: [174.61, 196, 233.08, 261.63, 293.66, 349.23, 392, 466.16],
      water: [246.94, 293.66, 369.99, 440, 493.88, 587.33],
      meadow: [329.63, 392, 493.88, 523.25, 659.25, 783.99],
      haunted: [164.81, 196, 246.94, 293.66, 329.63, 392],
    };
    let step = 0;

    const playNote = () => {
      const context = audio.context;
      const now = context.currentTime;
      const world = worldRef.current;
      const biome = getTileForWorld(world, Math.round(world.x), Math.round(world.y)).biome;
      const minute = Math.floor(now / 60);
      const variation = [0.94, 1, 1.06, 1.125][minute % 4];
      const notes =
        world.level === "castle"
          ? scales.castle
          : biome.includes("water") ||
              biome === "river" ||
              biome === "shallows" ||
              biome === "kelp forest" ||
              biome === "coral reef" ||
              biome === "mangrove"
            ? scales.water
            : biome.includes("meadow") ||
                biome.includes("glade") ||
                biome === "prairie" ||
                biome === "alpine meadow" ||
                biome === "savanna"
              ? scales.meadow
              : biome.includes("haunted") ||
                  biome.includes("frost") ||
                  biome === "tundra" ||
                  biome === "ice shelf" ||
                  biome === "bog"
                ? scales.haunted
                : scales.overworld;
      const oscillator = context.createOscillator();
      const harmony = context.createOscillator();
      const gain = context.createGain();
      const harmonyGain = context.createGain();
      const filter = context.createBiquadFilter();
      const baseFrequency =
        notes[(step + minute + Math.floor(hash2(world.x, world.y, 1410) * notes.length)) % notes.length] *
        variation;
      const harmonyFrequency = (notes[(step + 2 + minute) % notes.length] * variation) / (world.level === "castle" ? 2 : 1);

      oscillator.type = world.level === "castle" ? "sine" : "triangle";
      oscillator.frequency.value = baseFrequency / (world.level === "castle" ? 2 : 1);
      harmony.type = "sine";
      harmony.frequency.value = harmonyFrequency;
      filter.type = "lowpass";
      filter.frequency.value = world.level === "castle" ? 560 + minute * 18 : 1180 + Math.sin(step * 0.7 + minute) * 220;
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(world.level === "castle" ? 0.038 : 0.05, now + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + (world.level === "castle" ? 2.35 : 1.8));
      harmonyGain.gain.setValueAtTime(0.0001, now);
      harmonyGain.gain.exponentialRampToValueAtTime(step % 3 === 0 ? 0.025 : 0.0001, now + 0.18);
      harmonyGain.gain.exponentialRampToValueAtTime(0.0001, now + 2.6);
      oscillator.connect(filter);
      filter.connect(gain);
      gain.connect(audio.master);
      harmony.connect(harmonyGain);
      harmonyGain.connect(audio.master);
      oscillator.start(now);
      harmony.start(now + 0.05);
      oscillator.stop(now + 2.8);
      harmony.stop(now + 2.8);

      if (world.level === "overworld" && step % 4 === 2) {
        const bird = BIRD_CALLS[(minute * 7 + step + Math.floor(hash2(world.x, world.y, 1420) * 32)) % BIRD_CALLS.length];
        playBirdCall(bird);
      }

      if (step % 9 === 0) {
        playEffect(world.level === "castle" ? "portal" : "reward");
      }

      step += 1;
    };

    playNote();
    audio.interval = window.setInterval(playNote, 1250);
    setAudioOn(true);
  }, [playBirdCall, playEffect, showToast]);

  useEffect(() => {
    encounterRef.current = encounter;
    highlightedChoiceRef.current = 0;
    setHighlightedChoice(0);
  }, [encounter]);

  const hasBellflowerBlessing = useCallback(
    () => inventoryRef.current.has("bellflower blessing"),
    [],
  );

  const startEnding = useCallback(() => {
    const nextQuest = { ...questRef.current, endingInvoked: true };
    questRef.current = nextQuest;
    setQuest(nextQuest);
    clearInputState(inputRef.current);
    recordDiscovery("places", "moon-invoke", `Spoke ${MYSTERY.king} on the Moon Stair.`);
    setEndingScene({ step: 0 });
    playEffect("portal");
  }, [playEffect, recordDiscovery]);

  const tryInteract = useCallback(() => {
    if (encounterRef.current || endingScene) {
      return;
    }

    const world = worldRef.current;
    const time = world.lastTime || performance.now();
    const interact = getNearbyInteract(
      world,
      questRef.current,
      castleGoalRef.current,
      time,
      loreHeardRef.current.size,
      resolvedEncountersRef.current,
      { npcMemory: npcMemoryRef.current, loreHeard: loreHeardRef.current },
    );

    if (!interact || interact.type === "wait") {
      return;
    }

    if (interact.type === "invoke") {
      startEnding();
      return;
    }

    if (interact.type === "wing") {
      const nextQuest = { ...questRef.current, wingFound: true };
      questRef.current = nextQuest;
      setQuest(nextQuest);
      addInventoryItem(LOST_WING.item);
      world.bonus += 100;
      setRumor(QUEST_COPY.wingFoundRumor);
      recordDiscovery("places", LOST_WING.id, "Found the lost fairy wing.");
      showToast({ scoreDelta: 100, body: QUEST_COPY.wingToast, jumped: 0 }, 5200);
      playEffect("reward");
      return;
    }

    if (interact.type === "fairy") {
      if (questRef.current.wingFound) {
        const guideEntrance = computeGuideEntrance(world.x, world.y);
        const nextQuest = {
          ...questRef.current,
          fairyHelped: true,
          guideEntrance,
        };
        questRef.current = nextQuest;
        setQuest(nextQuest);
        inventoryRef.current.delete(LOST_WING.item);
        inventoryRef.current.add("bellflower blessing");
        setInventory([...inventoryRef.current]);
        world.bonus += 450;
        setRumor(QUEST_COPY.postFairyHint);
        recordDiscovery("characters", GROUNDED_FAIRY.id, "Returned the fairy wing.");
        recordDiscovery("items", "bellflower blessing", "Earned bellflower blessing.");
        loreHeardRef.current.add("quest:bellflower");
        showToast({ scoreDelta: 450, body: QUEST_COPY.fairyToast, jumped: 0 }, 6200);
        playEffect("reward");
      } else {
        setRumor(QUEST_COPY.fairyHint);
        showToast({ scoreDelta: 0, body: QUEST_COPY.fairyHint, jumped: 0 }, 3600);
      }
      return;
    }

    if (interact.type === "torch" && interact.torch && castleGoalRef.current) {
      const torch = interact.torch;

      if (castleGoalRef.current.litTorches.has(torch.id)) {
        return;
      }

      const nextLitTorches = new Set(castleGoalRef.current.litTorches).add(torch.id);
      const justCompleted =
        nextLitTorches.size >= castleGoalRef.current.required && !castleGoalRef.current.complete;
      const nextGoal = {
        ...castleGoalRef.current,
        litTorches: nextLitTorches,
        complete: castleGoalRef.current.complete || justCompleted,
        exit: justCompleted ? { x: torch.x, y: torch.y } : castleGoalRef.current.exit,
        exitReadyAt: justCompleted ? time + CASTLE_EXIT_GRACE_MS : castleGoalRef.current.exitReadyAt,
      };
      castleGoalRef.current = nextGoal;
      setCastleGoal(nextGoal);
      world.bonus += justCompleted ? 600 : 150;
      recordDiscovery("places", `torch:${torch.id}`, "Lit a castle torch.");
      showToast(
        {
          scoreDelta: justCompleted ? 600 : 150,
          body: justCompleted
            ? QUEST_COPY.castleTorch(0)
            : QUEST_COPY.castleTorch(nextGoal.required - nextGoal.litTorches.size),
          jumped: 0,
        },
        justCompleted ? 6200 : 3600,
      );
      playEffect(justCompleted ? "reward" : "portal");
      return;
    }

    if (interact.type === "entrance" && interact.entrance) {
      const entrance = interact.entrance;
      const returnPosition = { x: entrance.x + 1.8, y: entrance.y + 1.8 };
      const nextGoal = {
        seed: entrance.seed,
        required: 3,
        litTorches: new Set(),
        complete: false,
        exit: null,
        exitReadyAt: 0,
      };
      const nextQuest = { ...questRef.current, castleEntered: true };
      questRef.current = nextQuest;
      setQuest(nextQuest);
      world.level = "castle";
      world.levelName = `Under ${entrance.name}`;
      world.levelSeed = entrance.seed;
      world.returnPosition = returnPosition;
      world.x = 4;
      world.y = 0;
      world.bonus += 250;
      castleGoalRef.current = nextGoal;
      setCastleGoal(nextGoal);
      clearInputState(inputRef.current);
      recordDiscovery("places", entrance.id, `Entered ${entrance.name}.`);
      recordDiscovery("levels", `castle:${entrance.seed}`, `Found ${world.levelName}.`);
      loreHeardRef.current.add("place:under-castle");
      recordDiscovery(
        "places",
        "lore:under-castle",
        "Under the soil, halls repeat the king's bargain — half kingdom, half lullaby.",
      );
      setRumor(QUEST_COPY.castleEnterHint);
      showToast(
        {
          scoreDelta: 250,
          body: `${entrance.toast} ${QUEST_COPY.castleEnterHint}`,
          jumped: 0,
        },
        6800,
      );
      playEffect("portal");
      return;
    }

    if (interact.type === "castle-exit" && world.returnPosition) {
      const hadCompletedCastle = Boolean(castleGoalRef.current?.complete);
      world.level = "overworld";
      world.levelName = OVERWORLD_LEVEL_NAME;
      world.levelSeed = 0;
      world.x = world.returnPosition.x;
      world.y = world.returnPosition.y;
      world.returnPosition = null;
      world.bonus += 120;
      const nextQuest = {
        ...questRef.current,
        returnedFromCastle: questRef.current.returnedFromCastle || hadCompletedCastle,
      };
      questRef.current = nextQuest;
      setQuest(nextQuest);
      castleGoalRef.current = null;
      setCastleGoal(null);
      clearInputState(inputRef.current);
      recordDiscovery("places", "castle-exit", "Returned from the underground castle.");
      setRumor(pickRumor(hash2(world.x, world.y, 1350), loreHeardRef.current.size, questRef.current));
      showToast({ scoreDelta: 120, body: QUEST_COPY.castleExit, jumped: 0 }, 4200);
      playEffect("portal");
      return;
    }

    if (interact.type === "npc" && interact.character) {
      const nearbyCharacter = interact.character;
      const seenCount = npcMemoryRef.current[nearbyCharacter.type] || 0;
      npcMemoryRef.current[nearbyCharacter.type] = seenCount + 1;

      if (nearbyCharacter.loreKey && nearbyCharacter.loreLine) {
        loreHeardRef.current.add(nearbyCharacter.loreKey);
        recordDiscovery("characters", `${nearbyCharacter.type}:lore`, nearbyCharacter.loreLine);

        if (hasBellflowerBlessing()) {
          loreHeardRef.current.add(`${nearbyCharacter.loreKey}:blessing`);
          recordDiscovery(
            "characters",
            `${nearbyCharacter.type}:blessing-lore`,
            "The bellflower blessing coaxes one more syllable loose.",
          );
          world.bonus += 35;
        }
      }

      const rememberedCharacter =
        seenCount > 0
          ? {
              ...nearbyCharacter,
              bio: `${nearbyCharacter.bio} They remember meeting you ${seenCount === 1 ? "once" : `${seenCount} times`} before.`,
            }
          : nearbyCharacter;
      clearInputState(inputRef.current);
      encounterRef.current = rememberedCharacter;
      setEncounter(rememberedCharacter);
      recordDiscovery("characters", rememberedCharacter.type, `Met ${rememberedCharacter.name}.`);
      setRumor(
        pickRumor(
          hash2(rememberedCharacter.x, rememberedCharacter.y, 1360),
          loreHeardRef.current.size,
          questRef.current,
        ),
      );
      playEffect("encounter");
    }
  }, [
    addInventoryItem,
    endingScene,
    hasBellflowerBlessing,
    playEffect,
    recordDiscovery,
    showToast,
    startEnding,
  ]);

  tryInteractRef.current = tryInteract;

  const advanceEnding = useCallback(
    (choice = "continue") => {
      if (!endingScene) {
        return;
      }

      if (endingScene.step === "stair" && choice !== "continue") {
        const world = worldRef.current;
        persistCompletionMemory(
          world,
          discoveriesRef.current,
          loreHeardRef.current,
          inventoryRef.current,
        );
        setWorldMemory(JSON.parse(window.localStorage.getItem(MEMORY_KEY) || "null"));
        world.bonus += 1000;
        world.score = Math.max(0, Math.floor(world.distance + world.bonus));
        saveBestScore(world.score);
        setScore(world.score);
        setEndingScene({
          step: "credits",
          body: choice === "climb" ? ENDING_COPY.climb : ENDING_COPY.stay,
        });
        playEffect("reward");
        return;
      }

      if (endingScene.step === "credits") {
        return;
      }

      const nextStep = endingScene.step + 1;

      if (nextStep === 3) {
        setEndingScene({ step: "stair" });
        return;
      }

      setEndingScene({ step: nextStep });
    },
    [endingScene, playEffect, saveBestScore],
  );

  const restartWithMemory = useCallback(() => {
    resolvedEncountersRef.current = new Set();
    npcMemoryRef.current = {};
    encounterRef.current = null;
    setEncounter(null);
    setEndingScene(null);
    castleGoalRef.current = null;
    setCastleGoal(null);
    clearInputState(inputRef.current);

    const memory = worldMemory;
    questRef.current = {
      wingFound: false,
      fairyHelped: false,
      castleEntered: false,
      returnedFromCastle: false,
      endingInvoked: false,
      guideEntrance: null,
    };
    setQuest(questRef.current);
    loreHeardRef.current = new Set();
    discoveriesRef.current = {
      biomes: new Set(),
      characters: new Set(),
      places: new Set(),
      items: new Set(),
      levels: new Set(["overworld"]),
      notes: memory ? [ENDING_COPY.memory] : [],
    };
    inventoryRef.current = new Set();
    setInventory([]);
    setJournal({
      biomes: 0,
      characters: 0,
      places: 0,
      items: 0,
      levels: 1,
      notes: discoveriesRef.current.notes,
    });

    worldRef.current = {
      level: "overworld",
      levelName: OVERWORLD_LEVEL_NAME,
      levelSeed: 0,
      returnPosition: null,
      x: 0,
      y: 0,
      distance: 0,
      bonus: memory ? 120 : 0,
      score: memory ? 120 : 0,
      lastTime: 0,
      lastHudTime: 0,
    };

    setScore(memory ? 120 : 0);
    setRumor(QUEST_COPY.startRumor);
    setToast(null);
    nearbyInteractRef.current = null;
    setNearbyInteract(null);
  }, [worldMemory]);

  useEffect(
    () => () => {
      if (toastTimeoutRef.current) {
        window.clearTimeout(toastTimeoutRef.current);
      }

      if (audioRef.current.interval) {
        window.clearInterval(audioRef.current.interval);
      }
    },
    [],
  );

  const updateFrame = useCallback((time) => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    const world = worldRef.current;
    const delta = world.lastTime ? Math.min((time - world.lastTime) / 1000, 0.05) : 0;
    world.lastTime = time;

    const input = getInputVector(inputRef.current);
    const currentTile = getTileForWorld(world, Math.round(world.x), Math.round(world.y));
    const speed = 8.5 * currentTile.speed;
    const paused = Boolean(encounterRef.current || endingScene);

    if (!paused && input.active) {
      const movedDistance = moveWorld(world, input, speed, delta);

      if (movedDistance > 0) {
        world.distance += movedDistance;

        if (time - audioRef.current.stepAt > 360) {
          audioRef.current.stepAt = time;
          playEffect("step");
        }
      }
    }

    world.score = Math.max(0, Math.floor(world.distance + world.bonus));
    drawWorld(canvas, world, resolvedEncountersRef.current, time, questRef.current, castleGoalRef.current);
    const nextNearbyInteract = getNearbyInteract(
      world,
      questRef.current,
      castleGoalRef.current,
      time,
      loreHeardRef.current.size,
      resolvedEncountersRef.current,
      { npcMemory: npcMemoryRef.current, loreHeard: loreHeardRef.current },
    );
    const nextLabel = nextNearbyInteract?.label || "";
    const prevLabel = nearbyInteractRef.current?.label || "";

    if (nextLabel !== prevLabel) {
      nearbyInteractRef.current = nextNearbyInteract;
      setNearbyInteract(nextNearbyInteract);
    }

    if (time - world.lastHudTime > 140) {
      const tile = getTileForWorld(world, Math.round(world.x), Math.round(world.y));
      world.lastHudTime = time;
      saveBestScore(world.score);
      setScore(world.score);
      recordDiscovery("biomes", `${world.level}:${tile.biome}`, `Found ${tile.biome}.`);
      setHud({
        x: Math.round(world.x),
        y: Math.round(world.y),
        biome: tile.biome,
        glyph: tile.char,
        distance: Math.floor(world.distance),
        score: world.score,
        loreCount: loreHeardRef.current.size,
        levelName: world.levelName,
      });
    }

    frameRef.current = window.requestAnimationFrame(updateFrame);
  }, [endingScene, playEffect, recordDiscovery, saveBestScore]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.metaKey || event.altKey || event.ctrlKey) {
        return;
      }

      if (endingScene) {
        const key = event.key.toLowerCase();

        if (key === "enter" || key === " ") {
          event.preventDefault();
          if (endingScene.step === "stair") {
            return;
          }
          if (endingScene.step === "credits") {
            restartWithMemory();
            return;
          }
          advanceEnding();
          return;
        }

        return;
      }

      if (encounterRef.current) {
        const key = event.key.toLowerCase();

        if (key === "arrowup" || key === "w" || key === "arrowdown" || key === "s") {
          event.preventDefault();
          const direction = key === "arrowup" || key === "w" ? -1 : 1;
          const nextIndex = cycleChoiceIndex(
            highlightedChoiceRef.current,
            direction,
            encounterRef.current.question.choices.length,
          );
          highlightedChoiceRef.current = nextIndex;
          setHighlightedChoice(nextIndex);
          return;
        }

        if (key === "enter") {
          event.preventDefault();
          resolveEncounterRef.current?.(highlightedChoiceRef.current);
          return;
        }

        return;
      }

      const key = event.key.toLowerCase();

      if (key === "enter" || key === " " || key === "e") {
        event.preventDefault();
        tryInteractRef.current?.();
        return;
      }

      const direction = keyToDirection(event.key);

      if (direction) {
        event.preventDefault();
        inputRef.current.keys.add(direction);
      }
    };

    const handleKeyUp = (event) => {
      const direction = keyToDirection(event.key);

      if (direction) {
        event.preventDefault();
        inputRef.current.keys.delete(direction);
      }
    };

    const clearPointerControls = () => {
      clearInputState(inputRef.current);
    };

    const handleResize = () => {
      if (canvasRef.current) {
        syncCanvasSize(canvasRef.current);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("blur", clearPointerControls);
    window.addEventListener("pointerup", clearPointerControls);
    window.addEventListener("resize", handleResize);

    frameRef.current = window.requestAnimationFrame(updateFrame);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("blur", clearPointerControls);
      window.removeEventListener("pointerup", clearPointerControls);
      window.removeEventListener("resize", handleResize);
      if (frameRef.current) {
        window.cancelAnimationFrame(frameRef.current);
      }
    };
  }, [advanceEnding, endingScene, restartWithMemory, updateFrame]);

  const handlePointerDown = useCallback((event) => {
    if (encounterRef.current || endingScene) {
      return;
    }

    const pointer = inputRef.current.pointer;
    pointer.active = true;
    pointer.startX = event.clientX;
    pointer.startY = event.clientY;
    pointer.dx = 0;
    pointer.dy = 0;
    event.currentTarget.setPointerCapture?.(event.pointerId);
  }, [endingScene]);

  const handlePointerMove = useCallback((event) => {
    const pointer = inputRef.current.pointer;

    if (!pointer.active) {
      return;
    }

    pointer.dx = event.clientX - pointer.startX;
    pointer.dy = event.clientY - pointer.startY;
  }, []);

  const handlePointerEnd = useCallback(() => {
    const pointer = inputRef.current.pointer;
    pointer.active = false;
    pointer.dx = 0;
    pointer.dy = 0;
  }, []);

  const setPadDirection = useCallback((event, direction, active) => {
    event.preventDefault();
    event.stopPropagation();

    if (active && (encounterRef.current || endingScene)) {
      return;
    }

    inputRef.current.buttons[direction] = active;
  }, [endingScene]);

  const resolveEncounter = useCallback(
    (choiceIndex) => {
      const currentEncounter = encounterRef.current;

      if (!currentEncounter) {
        return;
      }

      const choice = currentEncounter.question.choices[choiceIndex];
      const world = worldRef.current;
      const nextResolved = new Set(resolvedEncountersRef.current);
      const jumped = choice.jump || 0;
      const angle = hash2(currentEncounter.x, currentEncounter.y, 940 + choiceIndex) * Math.PI * 2;

      nextResolved.add(currentEncounter.id);
      resolvedEncountersRef.current = nextResolved;
      clearInputState(inputRef.current);

      world.bonus += choice.score;

      if (jumped) {
        world.x += Math.cos(angle) * jumped;
        world.y += Math.sin(angle) * jumped;
        world.distance += jumped * 0.35;
      }

      world.score = Math.max(0, Math.floor(world.distance + world.bonus));
      saveBestScore(world.score);
      setScore(world.score);
      setEncounter(null);
      encounterRef.current = null;
      setRumor(
        pickRumor(
          hash2(currentEncounter.x, currentEncounter.y, 1370 + choiceIndex),
          loreHeardRef.current.size,
          questRef.current,
        ),
      );

      const foundItem =
        hash2(currentEncounter.x, currentEncounter.y, 1380 + choiceIndex + world.score) >
        1 - ENCOUNTER_ITEM_CHANCE
          ? pick(MAGICAL_ITEMS, hash2(currentEncounter.x, currentEncounter.y, 1390 + choiceIndex))
          : null;
      const itemAdded = foundItem ? addInventoryItem(foundItem) : false;
      const itemBonus = itemAdded ? 90 : 0;
      const loreBonus = currentEncounter.loreLine ? 35 : 0;
      const blessingBonus =
        currentEncounter.loreLine && inventoryRef.current.has("bellflower blessing") ? 35 : 0;

      if (blessingBonus) {
        loreHeardRef.current.add(`${currentEncounter.loreKey || currentEncounter.type}:blessing`);
        recordDiscovery(
          "characters",
          `${currentEncounter.type}:blessing-lore`,
          "The bellflower blessing coaxes one more syllable loose.",
        );
      }

      world.bonus += itemBonus + loreBonus + blessingBonus;
      world.score = Math.max(0, Math.floor(world.distance + world.bonus));
      saveBestScore(world.score);
      setScore(world.score);
      recordDiscovery(
        "characters",
        `${currentEncounter.id}:resolved:${choiceIndex}`,
        `${currentEncounter.name} answered your choice.`,
      );

      const itemText = itemAdded
        ? ` You also found ${foundItem}.${MAGICAL_ITEM_BLURBS[foundItem] ? ` ${MAGICAL_ITEM_BLURBS[foundItem]}` : ""}`
        : foundItem
          ? ` The ${foundItem} already in your pack hums in recognition.`
          : "";
      const loreText =
        loreBonus || blessingBonus ? " Another tale settles into your journal." : "";
      const nextResult = {
        body: `${choice.result}${itemText}${loreText}`,
        scoreDelta: choice.score + itemBonus + loreBonus + blessingBonus,
        jumped,
      };

      showToast(nextResult, itemAdded || loreBonus || blessingBonus ? 5200 : 4200);
      playEffect(itemAdded || loreBonus || blessingBonus ? "reward" : "encounter");
    },
    [addInventoryItem, playEffect, recordDiscovery, saveBestScore, showToast],
  );

  resolveEncounterRef.current = resolveEncounter;

  const questActs = getQuestChecklist(quest, castleGoal, hud.loreCount);
  const questDirection = getQuestDirection(quest, hud.x, hud.y);
  const endingBodies = [
    `${ENDING_COPY.speak} «${MYSTERY.king}»`,
    ENDING_COPY.moon,
    ENDING_COPY.kingdom,
  ];

  return (
    <main className="home-world" aria-label="Worst Games open world">
      <canvas
        ref={canvasRef}
        className="world-canvas"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerEnd}
        onPointerCancel={handlePointerEnd}
      />

      <section className="world-hud" aria-live="polite">
        <span>{hud.levelName}</span>
        <span>score {score}</span>
        <span>best {bestScore}</span>
        <span>{hud.biome}</span>
        <span>
          {hud.glyph} {hud.x}, {hud.y}
        </span>
        <span>{hud.distance} steps</span>
      </section>

      <nav className="world-links" aria-label="Games">
        <button type="button" onClick={toggleAudio}>{audioOn ? "sound on" : "sound off"}</button>
      </nav>

      {nearbyInteract && !endingScene && (
        <div className="world-nearby">
          <span>{nearbyInteract.label}</span>
          <button type="button" className="world-interact" onClick={() => tryInteractRef.current?.()}>
            Interact
          </button>
        </div>
      )}

      <section className="world-log" aria-label="Run log">
        <strong>Quest</strong>
        <ul className="world-quest-acts">
          {questActs.map((act) => (
            <li key={act.id} className={act.done ? "is-done" : act.current ? "is-current" : ""}>
              <span>{act.done ? "✓" : "○"}</span>
              <span>
                {act.label}
                {act.detail ? ` (${act.detail})` : ""}
              </span>
            </li>
          ))}
        </ul>
        {questDirection && !quest.endingInvoked && (
          <p className="world-quest-direction">Head {questDirection}</p>
        )}
        <p className="world-quest-rumor">{rumor}</p>
        {quest.fairyHelped && !quest.castleEntered && (
          <p className="world-quest-blessing">Bellflower blessing: doorways pulse brighter on the grass.</p>
        )}
        {worldMemory && <p className="world-quest-memory">You have finished this tale once. The wilds remember you.</p>}
        <strong>Inventory</strong>
        <p>{inventory.length ? inventory.slice(0, 5).join(" / ") : "empty pockets"}</p>
        <strong>Tales</strong>
        <p>
          {journal.biomes} biomes / {journal.characters} folk / {journal.places} places / {journal.items} charms
        </p>
        {journal.notes.slice(0, 2).map((note) => (
          <p key={note}>{note}</p>
        ))}
      </section>

      {encounter && (
        <section
          className="world-encounter"
          role="dialog"
          aria-modal="true"
          aria-label={`${encounter.name} encounter`}
        >
          <div className="world-encounter-card" style={{ "--encounter-accent": encounter.fg }}>
            <pre className="world-encounter-sketch" aria-hidden="true">
              {encounter.sketch.join("\n")}
            </pre>
            <div className="world-encounter-text">
              <p>
                <strong>
                  {encounter.glyph} {encounter.name}
                </strong>
              </p>
              <p>{encounter.bio}</p>
              <p>{encounter.intro}</p>
              {encounter.loreLine && <p className="world-encounter-lore">{encounter.loreLine}</p>}
              <p>{encounter.question.prompt}</p>
            </div>
            <div className="world-encounter-choices">
              {encounter.question.choices.map((choice, index) => (
                <button
                  key={choice.label}
                  className={index === highlightedChoice ? "is-selected" : ""}
                  type="button"
                  onClick={() => resolveEncounter(index)}
                >
                  <b>{String.fromCharCode(65 + index)}</b>
                  <span>{formatChoiceLabel(choice.label)}</span>
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {endingScene && (
        <section className="world-ending" role="dialog" aria-modal="true" aria-label="Moon Stair ending">
          <div className="world-ending-card">
            {endingScene.step === "stair" ? (
              <>
                <p>{ENDING_COPY.stairChoice}</p>
                <div className="world-ending-actions">
                  <button type="button" onClick={() => advanceEnding("climb")}>
                    Climb to weather
                  </button>
                  <button type="button" onClick={() => advanceEnding("stay")}>
                    Stay beneath the moon
                  </button>
                </div>
              </>
            ) : endingScene.step === "credits" ? (
              <>
                <p>{endingScene.body || ENDING_COPY.credits}</p>
                <p>{ENDING_COPY.credits}</p>
                {worldMemory && <p className="world-quest-memory">{ENDING_COPY.memory}</p>}
                <button type="button" onClick={restartWithMemory}>
                  Walk the wilds again
                </button>
              </>
            ) : (
              <>
                <p>{endingBodies[endingScene.step] || ENDING_COPY.credits}</p>
                <button type="button" onClick={() => advanceEnding()}>
                  Continue
                </button>
              </>
            )}
          </div>
        </section>
      )}

      {toast && (
        <aside className="world-toast" aria-live="polite">
          <strong>
            {toast.scoreDelta >= 0 ? "+" : ""}
            {toast.scoreDelta} points
          </strong>
          <span>
            {toast.jumped ? `carried ${toast.jumped} tiles / ` : ""}
            {toast.body}
          </span>
        </aside>
      )}

      <div className="world-pad" aria-label="Movement controls">
        {D_PAD.map((control) => (
          <button
            key={control.direction}
            className={control.className}
            type="button"
            aria-label={control.direction}
            onPointerDown={(event) => setPadDirection(event, control.direction, true)}
            onPointerUp={(event) => setPadDirection(event, control.direction, false)}
            onPointerCancel={(event) => setPadDirection(event, control.direction, false)}
            onPointerLeave={(event) => setPadDirection(event, control.direction, false)}
          >
            {renderArrowIcon(control.rotation)}
          </button>
        ))}
        <button
          type="button"
          className="world-pad-interact"
          aria-label="interact"
          disabled={!nearbyInteract || Boolean(endingScene)}
          onClick={() => tryInteractRef.current?.()}
        >
          ◉
        </button>
      </div>
    </main>
  );
};

export default Home;
