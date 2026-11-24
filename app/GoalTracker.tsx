import type { Puzzle } from "../core/mod.ts";
import { hasCrate } from "../core/mod.ts";

export function GoalTracker({ puzzle }: { puzzle: Puzzle }) {
  const totalgoals = puzzle.layout.goals.length;
  let filledgoals = 0;
  for (let i = 0; i < puzzle.layout.goals.length; i++) {
    if (hasCrate(puzzle, puzzle.layout.goals[i])) {
      filledgoals += 1;
    }
  }

  return (
    <dl className="goals">
      <p>Goals filled: {filledgoals} of {totalgoals}</p>
    </dl>
  );
}
