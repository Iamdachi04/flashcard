import * as handpose from '@tensorflow-models/handpose';

export type Gesture = 'easy' | 'hard' | 'wrong' | 'unknown';

export async function loadHandModel() {
  return handpose.load();
}

const THUMB_TIP = 4;
const INDEX_TIP = 8;

export function classifyGesture(landmarks: number[][]): Gesture {
  if (!landmarks.length) return 'unknown';

  const thumb = landmarks[THUMB_TIP];
  const index = landmarks[INDEX_TIP];
  const dy    = thumb[1] - index[1];          // y-axis difference

  // thumbs-up / thumbs-down (40 px vertical gap heuristic)
  if (Math.abs(dy) > 40) {
    return dy < 0 ? 'easy' : 'hard';
  }

  // open-palm “wrong”: hand span wider than 80 px
  const dx = Math.abs(thumb[0] - index[0]);
  if (Math.hypot(dx, dy) > 80) return 'wrong';

  return 'unknown';
}
