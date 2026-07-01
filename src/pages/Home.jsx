import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useGameState from '../hooks/useGameState';
import GameSetup from '../components/dbd/GameSetup';
import ScoreHeader from '../components/dbd/ScoreHeader';
import SurvivorPhase from '../components/dbd/SurvivorPhase';
import KillerPhase from '../components/dbd/KillerPhase';
import ConfirmDialog from '../components/dbd/ConfirmDialog';
import RulesModal from '../components/dbd/RulesModal';
import GauntletSetup from '../components/dbd/GauntletSetup.jsx';
import GauntletActive from '../components/dbd/GauntletActive';
import { useSocket } from '@/lib/SocketContext';
import { Play, Loader2, Gamepad2, Flame } from 'lucide-react';

export default function Home() {
  const { socket, room, isCreator } = useSocket();
  const g = useGameState();
  const { state, loading } = g;
  
  const [mode, setMode] = useState(null);
  const [confirmDefeat, setConfirmDefeat] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [showRules, setShowRules] = useState(false);

  // Sincronización instantánea y blindada
  useEffect(() => {
    if (!socket || !room) return;
    
    const syncWithServer = () => {
      // Pedimos datos directos mediante callback, sin esperar eventos flotantes
      socket.emit('request-sync', room, (data) => {
        if (data) {
          if (data.mode) setMode(data.mode);
          if (data.gameState) {
            g.forceSync(data.gameState);
          }
        }
      });
    };

    // 1. Sincronizar inmediatamente al abrir la página
    syncWithServer();

    // 2. Escuchar si cambian el modo estando dentro
    const handleRoomInfo = (data) => {
      if (data.mode) setMode(data.mode);
    };

    // 3. Volver a sincronizar si hubo un micro-corte de internet
    socket.on('connect', syncWithServer);
    socket.on('room-info', handleRoomInfo);
    
    return () => {
      socket.off('connect', syncWithServer);
      socket.off('room-info', handleRoomInfo);
    };
  }, [socket, room]);

  // Fallback de seguridad
  useEffect(() => {
    if (state && state.configured && mode !== 'copycat') {
      setMode('copycat');
    }
  }, [state, mode]);

  useEffect(() => {
    if (!loading && state?.configured === false) return;
    const seen = localStorage.getItem('dbd_rules_seen');
    if (!seen && !loading && mode === 'copycat') {
      setShowRules(true);
      localStorage.setItem('dbd_rules_seen', '1');
    }
  }, [loading, state?.configured, mode]);

  const handleSelectMode = (selectedMode) => {
    socket.emit('set-mode', { room, mode: selectedMode });
    setMode(selectedMode);
  };

  if (!mode) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white p-6 flex flex-col items-center justify-center">
        {isCreator ? (
          <div className="max-w-3xl w-full space-y-8">
            <div className="text-center space-y-2">
              <h1 className="text-4xl font-bold text-white flex items-center justify-center gap-3">
                <Gamepad2 className="w-10 h-10 text-blue-500" />
                Sala: {room}
              </h1>
              <p className="text-zinc-400 text-lg">Selecciona el desafío para esta sesión</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.div 
                whileHover={{ scale: 1.03 }}
                onClick={() => handleSelectMode('copycat')}
                className="bg-zinc-900 border border-zinc-700 hover:border-red-600 p-8 rounded-2xl cursor-pointer transition-all flex flex-col justify-between shadow-xl"
              >
                <div className="space-y-4">
                  <div className="bg-red-900/20 w-fit p-3 rounded-lg">
                    <Play className="w-8 h-8 text-red-500" />
                  </div>
                  <h2 className="text-2xl font-bold text-white">Copycat Challenge</h2>
                  <p className="text-zinc-400 leading-relaxed">
                    Juega y copia las builds de los supervivientes y killers. Sobrevive a las rondas y mantén tu racha.
                  </p>
                </div>
              </motion.div>
              
              <motion.div 
                whileHover={{ scale: 1.03 }}
                onClick={() => handleSelectMode('gauntlet')}
                className="bg-zinc-900 border border-zinc-700 hover:border-orange-500 p-8 rounded-2xl cursor-pointer transition-all flex flex-col justify-between shadow-xl"
              >
                <div className="space-y-4">
                  <div className="bg-orange-900/20 w-fit p-3 rounded-lg">
                    <Flame className="w-8 h-8 text-orange-500" />
                  </div>
                  <h2 className="text-2xl font-bold text-white">Survivor Gauntlet</h2>
                  <p className="text-zinc-400 leading-relaxed">
                    Escapa con cada superviviente de tu roster. La dificultad sube: pierdes 1 slot de perk cada 10 victorias consecutivas.
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-6 bg-zinc-900 border border-zinc-800 p-12 rounded-2xl shadow-2xl">
            <Loader2 className="w-16 h-16 text-blue-500 animate-spin" />
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-white">Esperando al líder...</h2>
              <p className="text-zinc-400">El creador de la sala está eligiendo el modo de juego.</p>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (loading || !state) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-zinc-950">
        <div className="w-8 h-8 border-4 border-zinc-700 border-t-red-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (mode === 'copycat' && !state.configured) {
    return (
      <>
        <GameSetup onConfigure={g.configure} onShowRules={() => setShowRules(true)} />
        <RulesModal open={showRules} onClose={() => setShowRules(false)} />
      </>
    );
  }

  if (mode === 'copycat' && state.configured) {
    return (
      <div className="min-h-screen bg-zinc-950">
        <ScoreHeader
          state={state}
          winCondition={g.winCondition}
          onDefeat={() => setConfirmDefeat(true)}
          onReset={() => setConfirmReset(true)}
          onShowRules={() => setShowRules(true)}
        />
        <RulesModal open={showRules} onClose={() => setShowRules(false)} />

        <AnimatePresence mode="wait">
          <motion.div
            key={state.phase + state.cycle}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
          >
            {state.phase === 'survivor' ? (
              <SurvivorPhase
                state={state}
                helpers={g.helpers}
                onSaveBuild={g.saveSurvivorBuild}
                onUploadImage={g.uploadSurvivorImage}
                onToggleExpand={g.toggleSurvivorExpand}
                onWin={(i) => g.winSurvivorMatch(i, state.survivor_matches[i])}
                onStartKiller={g.startKillerPhase}
              />
            ) : (
              <KillerPhase
                state={state}
                onUpdateAssignment={g.updateKillerAssignment}
                onReassign={g.reassignKiller}
                onSaveFaced={g.saveKillerMatch}
                onUploadKillerImage={() => {}} 
                onUploadSurvivorImage={g.uploadKillerSurvivorImage}
                onWin={g.winKillerMatch}
                onLose={() => g.defeat()} 
                onCompleteCycle={g.completeCycle}
              />
            )}
          </motion.div>
        </AnimatePresence>

        <ConfirmDialog
          open={confirmReset}
          onOpenChange={setConfirmReset}
          title="¿Cambiar configuración?"
          description="Se perderá el progreso actual (ciclo y partidas en curso). El récord se conserva."
          confirmText="Sí, cambiar config"
          onConfirm={() => { g.reset(); setConfirmReset(false); }}
        />

        <ConfirmDialog
          open={confirmDefeat}
          onOpenChange={setConfirmDefeat}
          title="¿Registrar derrota?"
          description="La racha actual se reiniciará a 0 y volverás a la ronda de supervivientes (Fase 1). La configuración de jugadores y dificultad se mantiene."
          confirmText="Sí, reiniciar ciclo"
          onConfirm={() => { g.defeat(); setConfirmDefeat(false); }}
        />

        <div className="fixed inset-0 pointer-events-none z-[-1]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E")`,
            backgroundSize: '256px 256px',
          }}
        />
      </div>
    );
  }

  // 5. MODO GAUNTLET: CONFIGURACIÓN INICIAL
  if (mode === 'gauntlet' && !state.gauntlet_configured) {
    return (
      <GauntletSetup 
        onConfigure={g.configureGauntlet} 
        onCancel={() => handleSelectMode(null)} 
      />
    );
  }

  // 6. MODO GAUNTLET: JUEGO ACTIVO
  if (mode === 'gauntlet' && state.gauntlet_configured) {
    return (
      <GauntletActive 
        state={state} 
        onWin={g.winGauntlet} 
        onLose={g.loseGauntlet}
        onReset={() => setConfirmReset(true)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-white">
      <h2>Modo de juego no soportado.</h2>
    </div>
  );
}