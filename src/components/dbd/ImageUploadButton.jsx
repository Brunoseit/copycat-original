import { useState, useRef } from 'react';
import { Camera, Loader2, ZoomIn, Trash2 } from 'lucide-react';
import ImageLightbox from './ImageLightbox';

// Resizes image via canvas then converts to base64 - avoids field size limits
function resizeImage(file, maxW = 1600, quality = 0.88) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const ratio = Math.min(1, maxW / img.width);
      const w = Math.round(img.width * ratio);
      const h = Math.round(img.height * ratio);
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      canvas.getContext('2d').drawImage(img, 0, 0, w, h);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

export default function ImageUploadButton({ onUpload, onDelete, currentImage, disabled = false, compact = false }) {
  const [loading, setLoading] = useState(false);
  const [lightbox, setLightbox] = useState(false);
  const fileInputRef = useRef(null);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    try {
      const dataUrl = await resizeImage(file);
      onUpload(dataUrl);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative">
      <input ref={fileInputRef} type="file" accept="image/*" capture="environment" onChange={handleFile} className="hidden" />
      {lightbox && <ImageLightbox src={currentImage} onClose={() => setLightbox(false)} />}

      {currentImage ? (
        <div className="relative rounded-lg overflow-hidden border border-zinc-700/50 group/image">
          <img
            src={currentImage}
            alt="Screenshot"
            className="w-full h-32 sm:h-40 object-cover cursor-zoom-in"
            onClick={() => setLightbox(true)}
          />
          <div className="absolute top-2 left-2 opacity-0 group-hover/image:opacity-100 transition-opacity pointer-events-none">
            <span className="bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded flex items-center gap-1">
              <ZoomIn className="w-3 h-3" /> Ver
            </span>
          </div>
          {!disabled && (
            <div className="absolute bottom-2 right-2 flex items-center gap-1.5 opacity-0 group-hover/image:opacity-100 active:opacity-100 transition-all">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1 px-2.5 py-1.5 bg-zinc-800/90 hover:bg-zinc-700/90 rounded-lg text-xs text-zinc-300"
              >
                <Camera className="w-3.5 h-3.5" /> Cambiar
              </button>
              {onDelete && (
                <button
                  type="button"
                  onClick={onDelete}
                  className="flex items-center gap-1 px-2.5 py-1.5 bg-red-900/80 hover:bg-red-800/80 rounded-lg text-xs text-red-200"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Borrar
                </button>
              )}
            </div>
          )}
        </div>
      ) : (
        <button
          type="button"
          disabled={disabled || loading}
          onClick={() => fileInputRef.current?.click()}
          className={`w-full flex items-center justify-center gap-2 rounded-lg border border-dashed border-zinc-600/50
            bg-zinc-800/40 hover:border-red-700/50 hover:bg-red-950/20
            disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200
            ${compact ? 'py-2 px-3' : 'py-4 px-4'}`}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 text-red-400 animate-spin" />
              <span className="text-sm text-zinc-400">Procesando...</span>
            </>
          ) : (
            <>
              <Camera className="w-4 h-4 text-red-500" />
              <span className="text-sm text-zinc-400">{compact ? 'Subir imagen' : 'Subir screenshot'}</span>
            </>
          )}
        </button>
      )}
    </div>
  );
}