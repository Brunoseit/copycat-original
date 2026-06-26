import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ImageLightbox({ src, alt = 'Imagen', onClose }) {
  if (!src) return null;
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
        onClick={onClose}
      >
        <button
          className="absolute top-4 right-4 p-2 rounded-full bg-zinc-800/80 text-zinc-300 hover:text-white hover:bg-zinc-700/80 transition-all z-10"
          onClick={onClose}
        >
          <X className="w-5 h-5" />
        </button>
        <motion.img
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          src={src}
          alt={alt}
          className="max-w-full max-h-[90vh] rounded-xl object-contain shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        />
      </motion.div>
    </AnimatePresence>
  );
}