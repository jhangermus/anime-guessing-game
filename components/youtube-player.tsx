import React from 'react';

interface YouTubePlayerProps {
  url: string;
  title: string;
  onClose: () => void;
}

export function YouTubePlayer({ url, title, onClose }: YouTubePlayerProps) {
  // Extraer el ID del video de la URL de YouTube
  const getYouTubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const videoId = getYouTubeId(url);

  if (!videoId) return null;

  return (
    <div className="w-full bg-white rounded-lg shadow-md overflow-hidden">
      <div className="flex justify-between items-center p-3 bg-amber-50 border-b border-amber-200">
        <h3 className="text-lg font-medium text-amber-900">{title}</h3>
        <button
          onClick={onClose}
          className="text-amber-700 hover:text-amber-900"
        >
          ✕
        </button>
      </div>
      <div className="relative pt-[56.25%]">
        <iframe
          className="absolute top-0 left-0 w-full h-full"
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    </div>
  );
} 