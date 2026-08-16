"use client";

import { useRef, useState } from "react";

type Cell = "X" | "O" | null;
type Status = "playing" | "won" | "lost" | "draw";

const WIN_LINES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

// Keypad numbering, 1-9 top-left to bottom-right — index = number - 1.
const PASSCODE = "9631";

const CELL = 30; // px, one board square in the 90x90 viewBox

function calcWinner(board: Cell[]): Cell {
  for (const [a, b, c] of WIN_LINES) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) return board[a];
  }
  return null;
}

function botMove(board: Cell[]): number {
  const empty = board.map((c, i) => (c ? -1 : i)).filter((i) => i >= 0);

  for (const i of empty) {
    const copy = board.slice();
    copy[i] = "O";
    if (calcWinner(copy) === "O") return i;
  }
  for (const i of empty) {
    const copy = board.slice();
    copy[i] = "X";
    if (calcWinner(copy) === "X") return i;
  }
  if (board[4] === null) return 4;
  const corners = [0, 2, 6, 8].filter((i) => board[i] === null);
  if (corners.length) return corners[Math.floor(Math.random() * corners.length)];
  return empty[Math.floor(Math.random() * empty.length)];
}

// Center point of cell i, for drawing marks and hit-testing.
function cellCenter(i: number) {
  const col = i % 3;
  const row = Math.floor(i / 3);
  return { cx: col * CELL + CELL / 2, cy: row * CELL + CELL / 2 };
}

// Two crossing, faintly curved ink strokes — a hand-drawn X, not a glyph.
function XMark({ cx, cy }: { cx: number; cy: number }) {
  return (
    <g className="stroke-ink/80" strokeWidth={2.4} strokeLinecap="round" fill="none">
      <path d={`M ${cx - 8} ${cy - 8} Q ${cx - 1} ${cy - 0.5} ${cx + 8} ${cy + 8}`} />
      <path d={`M ${cx - 8} ${cy + 8} Q ${cx - 1} ${cy + 0.5} ${cx + 8} ${cy - 8}`} />
    </g>
  );
}

// A slightly imperfect, tilted ellipse — a hand-drawn O — in the bronze
// accent so it reads as a distinct "ink" from the X.
function OMark({ cx, cy }: { cx: number; cy: number }) {
  return (
    <ellipse
      cx={cx}
      cy={cy}
      rx={8.75}
      ry={7.75}
      transform={`rotate(-8 ${cx} ${cy})`}
      className="stroke-accent-2/85"
      strokeWidth={2.3}
      fill="none"
    />
  );
}

export default function TicTacToe({ onUnlock }: { onUnlock?: () => void }) {
  const [board, setBoard] = useState<Cell[]>(Array(9).fill(null));
  const [status, setStatus] = useState<Status>("playing");
  const [unlocked, setUnlocked] = useState(false);
  const seq = useRef("");
  const busy = useRef(false);

  function finish(next: Cell[]) {
    const w = calcWinner(next);
    if (w === "X") {
      setStatus("won");
      return true;
    }
    if (w === "O") {
      setStatus("lost");
      return true;
    }
    if (next.every((c) => c !== null)) {
      setStatus("draw");
      return true;
    }
    return false;
  }

  async function tryUnlock(nextSeq: string) {
    seq.current = nextSeq.slice(-4);
    if (unlocked || seq.current !== PASSCODE) return;
    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sequence: seq.current.split("").map(Number) }),
      });
      if (res.ok) {
        setUnlocked(true);
        onUnlock?.();
      }
    } catch {
      // hidden control — fail silently, no error UI
    }
  }

  function handleClick(idx: number) {
    tryUnlock(seq.current + String(idx + 1));

    if (busy.current) return;

    if (status !== "playing") {
      const fresh: Cell[] = Array(9).fill(null);
      fresh[idx] = "X";
      setBoard(fresh);
      setStatus("playing");
      if (!finish(fresh)) {
        busy.current = true;
        setTimeout(() => {
          const withBot = fresh.slice();
          withBot[botMove(withBot)] = "O";
          setBoard(withBot);
          finish(withBot);
          busy.current = false;
        }, 380);
      }
      return;
    }

    if (board[idx]) return;

    const next = board.slice();
    next[idx] = "X";
    setBoard(next);
    if (finish(next)) return;

    busy.current = true;
    setTimeout(() => {
      const withBot = next.slice();
      withBot[botMove(withBot)] = "O";
      setBoard(withBot);
      finish(withBot);
      busy.current = false;
    }, 380);
  }

  const label =
    status === "won" ? "You win" : status === "lost" ? "Bot wins" : status === "draw" ? "Draw" : "Your move";

  return (
    <div className="inline-block -rotate-[3deg] select-none text-center">
      <svg
        viewBox="0 0 90 90"
        width={90}
        height={90}
        className="overflow-visible"
        role="group"
        aria-label="Tic-tac-toe board"
      >
        {/* Four hand-drawn lines only — no outer frame. */}
        <g className="stroke-ink/45" strokeWidth={1.8} strokeLinecap="round" fill="none">
          <path d="M 30 1.3 Q 28.1 30 30 88.8" />
          <path d="M 60 2.5 Q 61.9 32.5 60 88.8" />
          <path d="M 1.3 30 Q 30 28.1 88.8 30" />
          <path d="M 2.5 60 Q 32.5 61.9 88.8 60" />
        </g>

        {board.map((c, i) => {
          const { cx, cy } = cellCenter(i);
          const col = i % 3;
          const row = Math.floor(i / 3);
          return (
            <g key={i}>
              <rect
                x={col * CELL}
                y={row * CELL}
                width={CELL}
                height={CELL}
                fill="transparent"
                className="cursor-pointer outline-none hover:fill-ink/[0.04] focus:outline-none focus-visible:fill-ink/10"
                tabIndex={0}
                role="button"
                aria-label={`Cell ${i + 1}${c ? `, ${c}` : ", empty"}`}
                onClick={() => handleClick(i)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleClick(i);
                  }
                }}
              />
              {c === "X" && <XMark cx={cx} cy={cy} />}
              {c === "O" && <OMark cx={cx} cy={cy} />}
            </g>
          );
        })}
      </svg>
      <p className="mt-1 font-mono text-[8px] uppercase tracking-[0.14em] text-muted">
        {label}
        {unlocked && <span className="ml-1 text-accent-2">•</span>}
      </p>
    </div>
  );
}
