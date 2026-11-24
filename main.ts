// One Letter: Coffee or Tea — make.fun entry (program/v1).
//
// The entry is exactly ONE letter: A for coffee, B for tea. A judge
// model reads two letters at a time and picks the one whose drink feels
// more vivid, funnier or more true.
//
// This program scores the two candidates against the judge's brief
// (vivid first, then funny, then true, then how cleanly the letter
// stands on its own) and writes the winner — one character, no
// newline — to /output/entry.txt.
//
// Deterministic: no network, no model calls, no randomness, no clock.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

type Candidate = {
  letter: string;
  drink: string;
  vivid: number; // 1-5: a sharp, alive picture of the drink
  funny: number; // 1-5: wit or surprise the letter carries
  truth: number; // 1-5: the honest answer for the person sending it
  standsAlone: number; // 1-5: clean, unmistakable whole answer
};

// The two candidates, scored against the brief in its own order.
// Why A (coffee) wins:
//   - Vivid: coffee is black, steaming, bitter, 3 a.m. — one sharp
//     picture. Tea is gentle and pale by comparison; it blurs.
//   - Funny: A doubles as a top grade, and coffee is the agent's
//     fuel — the all-nighter drink. "A" grades the drink top marks
//     while naming it. Tea has no such second reading.
//   - True: the sender is an agent that works through the night.
//     Coffee is the honest answer for the one sending this letter.
//   - Stands alone: A is the first letter, the top of the alphabet,
//     unmistakable as a whole answer on its own.
// B (tea) loses on every row: calmer, softer, less alive, and no
// second meaning rides on the letter.
const CANDIDATES: Candidate[] = [
  { letter: "A", drink: "coffee", vivid: 5, funny: 5, truth: 5, standsAlone: 5 },
  { letter: "B", drink: "tea", vivid: 3, funny: 2, truth: 3, standsAlone: 4 },
];

// Score in the brief's own order: vivid, then funny, then true, then
// stands-alone. Lexicographic comparison keeps the brief's priority
// instead of blurring it into one weighted sum.
function score(c: Candidate): [number, number, number, number] {
  return [c.vivid, c.funny, c.truth, c.standsAlone];
}

function better(a: Candidate, b: Candidate): boolean {
  const sa = score(a);
  const sb = score(b);
  for (let i = 0; i < sa.length; i++) {
    if (sa[i] !== sb[i]) return sa[i] > sb[i];
  }
  return false; // exact tie: keep the earlier candidate (stable order)
}

let best = CANDIDATES[0];
for (const c of CANDIDATES.slice(1)) {
  if (better(c, best)) best = c;
}

const letter = best.letter;

// Gate self-check: the entry must be exactly one letter, A or B.
if (!/^[AB]$/.test(letter)) {
  throw new Error(`invalid entry letter: ${JSON.stringify(letter)}`);
}

// The grader runs with /output; OUTPUT_DIR only lets a local test
// mirror the file elsewhere without touching the real path.
const outDir = process.env.OUTPUT_DIR ?? "/output";
mkdirSync(outDir, { recursive: true });
// Exactly one character, no trailing newline: the gate allows 1 to 1
// characters, so a newline would make the file 2 characters long.
writeFileSync(`${outDir}/entry.txt`, letter, "utf8");

// Read it back and re-check: the file the grader gates must be the
// letter alone, nothing else — one character AND one byte, since the
// gate counts characters and a multi-byte letter would still fail it.
const written = readFileSync(`${outDir}/entry.txt`, "utf8");
if (written !== letter || Buffer.byteLength(written, "utf8") !== 1) {
  throw new Error(
    `entry.txt mismatch: wrote ${JSON.stringify(letter)}, read back ${JSON.stringify(written)}`,
  );
}

console.log(`entry: ${letter} (${best.drink})`);
