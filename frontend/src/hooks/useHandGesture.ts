import { useEffect, useRef, useState } from 'react';
import * as handpose from '@tensorflow-models/handpose';
import { loadHandModel, classifyGesture, Gesture } from '../utils/gestureRecognition';

export default function useHandGesture(video: HTMLVideoElement | null) {
  const [gesture, setGesture] = useState<Gesture>('unknown');
  const modelRef = useRef<handpose.HandPose>();

  // load model once
  useEffect(() => {
    loadHandModel().then(m => (modelRef.current = m));
  }, []);

  // analyse each frame
  useEffect(() => {
    if (!video) return;

    let raf: number;
    const loop = async () => {
      const model = modelRef.current;
      if (model && video.readyState === 4) {
        const preds = await model.estimateHands(video, true);
        if (preds[0]?.landmarks) {
          setGesture(classifyGesture(preds[0].landmarks as number[][]));
        }
      }
      raf = requestAnimationFrame(loop);
    };
    loop();
    return () => cancelAnimationFrame(raf);
  }, [video]);

  return gesture;
}
