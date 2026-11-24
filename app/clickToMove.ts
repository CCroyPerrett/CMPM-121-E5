import { Position } from "../core/puzzle.ts";
import { Command } from "../core/session.ts";
import { Controller } from "./controllers.ts";

function findDirection(playerPos: Position, tilePos: Position): Command {
  let command: Command = { kind: "undo" };
  if (playerPos.x == tilePos.x && playerPos.y + 1 == tilePos.y) {
    command = { kind: "move", direction: "down" };
  }
  if (playerPos.x == tilePos.x && playerPos.y == tilePos.y + 1) {
    command = { kind: "move", direction: "up" };
  }
  if (playerPos.x + 1 == tilePos.x && playerPos.y == tilePos.y) {
    command = { kind: "move", direction: "right" };
  }
  if (playerPos.x == tilePos.x + 1 && playerPos.y == tilePos.y) {
    command = { kind: "move", direction: "left" };
  }
  return command;
}

export const clickToMove: Controller = {
  label: "Click an Adjacent Tile",
  attach(session, board) {
    const stop = board.onTileClick((clickedtile) => {
      const player = session.getState().puzzle.player;
      const direction = findDirection(player, clickedtile);

      if (direction.kind != "undo") {
        session.dispatch(direction);
      }
    });
    return stop!;
  },
};
