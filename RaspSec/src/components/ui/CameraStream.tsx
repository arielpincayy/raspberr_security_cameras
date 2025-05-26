// src/components/ui/CameraStream.tsx
import React, { useRef, useEffect } from 'react';
import Hls from 'hls.js';

interface CameraStreamProps {
  src: string | undefined;
  onOnline?: () => void;
  onOffline?: () => void;
}

const CameraStream: React.FC<CameraStreamProps> = ({ src, onOnline, onOffline }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    let hls: Hls | undefined;

    if (!src || !src.trim() || !videoRef.current) {
      return;
    }

    if (Hls.isSupported()) {
      hls = new Hls();

      hls.on(Hls.Events.ERROR, function (event, data) {
        if (data.fatal && onOffline) {
          onOffline();
        }
      });

      hls.on(Hls.Events.MANIFEST_PARSED, function () {
        if (onOnline) {
          onOnline();
        }
      });

      hls.loadSource(src.trim());
      hls.attachMedia(videoRef.current);
    } else if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
      videoRef.current.src = src.trim();
    }

    return () => {
      if (hls) {
        hls.destroy();
      }
    };
  }, [src, onOnline, onOffline]);

  return (
    <video
      ref={videoRef}
      controls
      autoPlay
      muted
      playsInline
      style={{ width: '100%', borderRadius: 8 }}
      preload="auto"
      onError={onOffline}
      onLoadedData={onOnline}
    />
  );
};

export default CameraStream;
