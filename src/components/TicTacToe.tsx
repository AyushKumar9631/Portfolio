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
    <div className="select-none text-center">
      <div className="engraved-panel inline-grid grid-cols-3 gap-[3px] p-[3px]">
        {board.map((c, i) => (
          <button
            key={i}
            type="button"
            onClick={() => handleClick(i)}
            aria-label={`Cell ${i + 1}${c ? `, ${c}` : ", empty"}`}
            className="engraved-cell flex h-9 w-9 cursor-pointer items-center justify-center bg-transparent font-display text-lg leading-none text-ink/70"
          >
            {c === "X" && <span className="engraved-mark">×</span>}
            {c === "O" && <span className="engraved-mark">○</span>}
          </button>
        ))}
      </div>
      <p className="mt-2 font-mono text-[9px] uppercase tracking-[0.14em] text-muted">
        {label}
        {unlocked && <span className="ml-1 text-accent-2">•</span>}
      </p>
    </div>
  );
}
