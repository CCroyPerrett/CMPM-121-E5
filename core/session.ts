import { LEVELS } from "./levels.ts";
import {
  type Direction,
  isSolved,
  move,
  parsePuzzle,
  type Puzzle,
} from "./puzzle.ts";

// Command: everything a player, a test, or a replay can do to a session is one
// of these plain objects, handed to Session.dispatch().
export type Command =
  | { readonly kind: "move"; readonly direction: Direction }
  | { readonly kind: "restart" }
  | { readonly kind: "choose-level"; readonly level: number }
  | { kind: "undo" };

export interface SessionState {
  /** Index into LEVELS. */
  readonly level: number;
  readonly puzzle: Puzzle;
  readonly past: Puzzle[];
}

export function startLevel(level: number, past: Puzzle[]): SessionState {
  const { name, rows } = LEVELS[level];
  return { level, puzzle: parsePuzzle(name, rows), past: past };
}

/**
 * The rules for commands: given a state and a command, the next state. Returns
 * the same state object when the command changes nothing.
 */
export function update(state: SessionState, command: Command): SessionState {
  switch (command.kind) {
    case "move": {
      if (isSolved(state.puzzle)) return state;

      //make move
      const puzzle = move(state.puzzle, command.direction);
      const past = state.past;
      if (
        (state.puzzle.player.x == puzzle.player.x &&
          state.puzzle.player.y == puzzle.player.y) == false
      ) {
        past.push(state.puzzle);
      }

      return puzzle === state.puzzle ? state : { ...state, puzzle, past };
    }
    case "restart":
      return startLevel(state.level, state.past);
    case "choose-level":
      return startLevel(command.level, []);
    case "undo": {
      if (state.past.length == 0) {
        return state;
      }
      const newstate: SessionState = {
        level: state.level,
        puzzle: state.past[state.past.length - 1],
        past: state.past.slice(0, -1),
      };
      return newstate;
    }
  }
}

// Observer: a Session holds the current state and notifies its subscribers each
// time the state changes. It knows nothing about who is listening, or about
// React, the page, or the keyboard.
export class Session {
  #state: SessionState;
  readonly #listeners = new Set<() => void>();

  constructor(level = 0) {
    this.#state = startLevel(level, []);
  }

  // These two are arrow functions so they can be passed around on their own,
  // as React's useSyncExternalStore does, without losing `this`.
  getState = (): SessionState => this.#state;

  subscribe = (listener: () => void): () => void => {
    this.#listeners.add(listener);
    return () => this.#listeners.delete(listener);
  };

  dispatch(command: Command): void {
    const next = update(this.#state, command);
    if (next === this.#state) return;
    this.#state = next;
    for (const listener of this.#listeners) listener();
  }
}
