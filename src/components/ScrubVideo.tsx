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
  const isSeeking = useRef(false);
  const lastSeekTime = useRef(0);

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

    const handleSeeking = () => {
      isSeeking.current = true;
    };
    const handleSeeked = () => {
      isSeeking.current = false;
    };

    video.addEventListener('seeking', handleSeeking);
    video.addEventListener('seeked', handleSeeked);

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      video.removeEventListener('seeking', handleSeeking);
      video.removeEventListener('seeked', handleSeeked);
    };
  }, [src]);

  useAnimationFrame(() => {
    const video = videoRef.current;
    if (!video || !video.duration || video.readyState < 1) return;
    const target = progress.get() * (video.duration - 0.06);
    
    // interpolation douce vers la position cible
    current.current += (target - current.current) * 0.1;
    
    const now = performance.now();
    // Évite de surcharger le décodeur : max 1 seek toutes les 33ms et pas pendant un seeking actif
    if (!isSeeking.current && now - lastSeekTime.current > 33) {
      if (Math.abs(video.currentTime - current.current) > 0.01) {
        isSeeking.current = true;
        video.currentTime = current.current;
        lastSeekTime.current = now;
      }
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
