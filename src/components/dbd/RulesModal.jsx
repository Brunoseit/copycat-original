import { X, Skull, Users, Trophy, RefreshCw, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function RulesModal({ open, onClose }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={onClose}
        >
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full sm:max-w-lg bg-zinc-900 border border-zinc-700/60 rounded-t-2xl sm:rounded-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 z-10 bg-zinc-900 border-b border-zinc-800/60 px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Skull className="w-5 h-5 text-red-500" />
                <h2 className="text-base font-bold text-white">Cómo jugar DBD Copycat</h2>
              </div>
              <button onClick={onClose} className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/60 transition-all">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="px-5 py-5 space-y-6 text-sm">
              {/* Concepto */}
              <section>
                <h3 className="text-xs font-semibold text-red-400 uppercase tracking-wider mb-2">¿Qué es el Copycat Challenge?</h3>
                <p className="text-zinc-300 leading-relaxed">
                  Un challenge cooperativo para grupos de amigos en Dead by Daylight. La idea: los Killers que enfrentáis como supervivientes son los que tendréis que jugar vosotros en la siguiente ronda, y los supervivientes que enfrentéis como Killers son los que tendréis que jugar después.
                </p>
              </section>

              {/* Ciclo */}
              <section>
                <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">El ciclo de juego</h3>
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <div className="w-7 h-7 rounded-full bg-blue-900/50 border border-blue-700/40 flex items-center justify-center text-blue-300 font-bold text-xs flex-shrink-0 mt-0.5">1</div>
                    <div>
                      <p className="font-semibold text-zinc-200 flex items-center gap-1.5"><Users className="w-3.5 h-3.5 text-blue-400" /> Ronda de Supervivientes</p>
                      <p className="text-zinc-400 mt-0.5">Jugáis juntos como equipo de supervivientes. Por cada partida ganada, el Killer que enfrentasteis se añade a vuestra pool. Hay que escapar una cantidad mínima según la dificultad elegida.</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-7 h-7 rounded-full bg-red-900/50 border border-red-700/40 flex items-center justify-center text-red-300 font-bold text-xs flex-shrink-0 mt-0.5">2</div>
                    <div>
                      <p className="font-semibold text-zinc-200 flex items-center gap-1.5"><Skull className="w-3.5 h-3.5 text-red-400" /> Ronda de Killers</p>
                      <p className="text-zinc-400 mt-0.5">Cada jugador recibe el Killer de su partida de supervivientes y debe jugarlo. Hay que matar el número requerido de supervivientes. Los supervivientes enfrentados se guardan para la siguiente ronda.</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-7 h-7 rounded-full bg-green-900/50 border border-green-700/40 flex items-center justify-center text-green-300 font-bold text-xs flex-shrink-0 mt-0.5">3</div>
                    <div>
                      <p className="font-semibold text-zinc-200 flex items-center gap-1.5"><RefreshCw className="w-3.5 h-3.5 text-green-400" /> Siguiente ciclo</p>
                      <p className="text-zinc-400 mt-0.5">Si todos los Killers ganan, el ciclo avanza. Los supervivientes enfrentados forman la pool de la siguiente ronda de supervivientes para cada jugador.</p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Victoria y derrota */}
              <section>
                <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">Condiciones</h3>
                <div className="space-y-2">
                  <div className="bg-green-950/30 border border-green-800/30 rounded-xl px-4 py-3">
                    <p className="text-green-300 font-semibold text-xs mb-1 flex items-center gap-1.5"><Trophy className="w-3.5 h-3.5" /> Victoria Supervivientes</p>
                    <p className="text-zinc-400 text-xs">Escapan el número mínimo de jugadores según la dificultad (varía por número de jugadores y dificultad elegida).</p>
                  </div>
                  <div className="bg-red-950/30 border border-red-800/30 rounded-xl px-4 py-3">
                    <p className="text-red-300 font-semibold text-xs mb-1 flex items-center gap-1.5"><Skull className="w-3.5 h-3.5" /> Victoria Killer</p>
                    <p className="text-zinc-400 text-xs">El Killer debe matar el número requerido de supervivientes según la dificultad.</p>
                  </div>
                  <div className="bg-zinc-800/40 border border-zinc-700/30 rounded-xl px-4 py-3">
                    <p className="text-zinc-300 font-semibold text-xs mb-1 flex items-center gap-1.5"><X className="w-3.5 h-3.5 text-red-400" /> Derrota global</p>
                    <p className="text-zinc-400 text-xs">Si un Killer pierde su partida, la racha se reinicia. Se puede registrar una derrota desde el botón rojo en la cabecera.</p>
                  </div>
                </div>
              </section>

              {/* Screenshots */}
              <section>
                <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Screenshots</h3>
                <p className="text-zinc-400 leading-relaxed">
                  Sube capturas de pantalla en cada tarjeta para llevar registro. Las fotos de la ronda de supervivientes aparecen en las tarjetas de Killer y viceversa en el siguiente ciclo. Toca una foto para verla a pantalla completa.
                </p>
              </section>

              <button
                onClick={onClose}
                className="w-full py-3 rounded-xl bg-red-800/80 hover:bg-red-700/80 text-red-100 font-bold text-sm border border-red-700/50 transition-all active:scale-[0.98]"
              >
                ¡Entendido, a jugar!
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}