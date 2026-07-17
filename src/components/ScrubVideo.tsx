import { useAnimationFrame, type MotionValue } from 'motion/react';
import { useEffect, useRef } from 'react';

// Vidéo pilotée par le scroll : le personnage marche quand l'utilisateur scrolle.
// La vidéo est téléchargée en blob pour un seek image par image parfaitement fluide.
export default function ScrubVideo({ src, progress, className = '' }: {
  src: string;
  progress: MotionValue<number>;
  className?: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const current = useRef(0);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    let objectUrl: string | null = null;
    let cancelled = false;

    // Blob local => seeks instantanés, pas de buffering réseau à chaque frame
    fetch(src)
      .then(r => (r.ok ? r.blob() : Promise.reject(new Error(String(r.status)))))
      .then(blob => {
        if (cancelled) return;
        objectUrl = URL.createObjectURL(blob);
        video.src = objectUrl;
        video.load();
      })
      .catch(() => {
        if (!cancelled) {
          video.src = src;
          video.load();
        }
      });

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [src]);

  useAnimationFrame(() => {
    const video = videoRef.current;
    if (!video || !video.duration || video.readyState < 1) return;
    const target = progress.get() * (video.duration - 0.06);
    // interpolation douce vers la position cible
    current.current += (target - current.current) * 0.12;
    if (Math.abs(video.currentTime - current.current) > 0.01) {
      video.currentTime = current.current;
    }
  });

  return (
    <video
      ref={videoRef}
      muted
      playsInline
      preload="auto"
      className={className}
    />
  );
}
