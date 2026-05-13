/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Shape = (string | number)[][];

export interface Tetromino {
  shape: Shape;
  color: string;
}

export interface Position {
  x: number;
  y: number;
}

export interface Player {
  pos: Position;
  tetromino: Shape;
  collided: boolean;
}

export type Grid = (string | number)[][];
