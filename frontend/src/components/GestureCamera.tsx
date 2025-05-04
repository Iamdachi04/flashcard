import React, { forwardRef } from 'react';
import Webcam from 'react-webcam';

interface Props { show: boolean; }

/** Webcam wrapper.  The parent can grab the <video> element via ref. */
const GestureCamera = forwardRef<Webcam, Props>(({ show }, ref) => {
  if (!show) return null;

  return (
    <div style={{ textAlign: 'center', marginTop: 20 }}>
      <Webcam
        ref={ref as any}
        audio={false}
        width={240}
        height={180}
        videoConstraints={{ facingMode: 'user' }}
        style={{ borderRadius: 8 }}
      />
      <p style={{ fontSize: 12, marginTop: 4, color: '#666' }}>
        Hold one gesture for&nbsp;≈1 s
      </p>
    </div>
  );
});

export default GestureCamera;
