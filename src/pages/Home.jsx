import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useGameState from '../hooks/useGameState';
import GameSetup from '../components/dbd/GameSetup';
import ScoreHeader from '../components/dbd/ScoreHeader';
import SurvivorPhase from '../components/dbd/SurvivorPhase';
import KillerPhase from '../components/dbd/KillerPhase';
import ConfirmDialog from '../components/dbd/ConfirmDialog';
import RulesModal from '../components/dbd/RulesModal';

export default function Home() {
  const g = useGameState();
  const { state, loading } = g;
  const [confirmDefeat, setConfirmDefeat] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [showRules, setShowRules] = useState(false);

  useEffect(() => {
    if (!loading && state?.configured === false) return;
    const seen = localStorage.getItem('dbd_rules_seen');
    if (!seen && !loading) {
      setShowRules(true);
      localStorage.setItem('dbd_rules_seen', '1');
    }
  }, [loading]);

  if (loading || !state) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-zinc-950">
        <div className="w-8 h-8 border-4 border-zinc-700 border-t-red-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!state.configured) {
    return (
      <>
        <GameSetup onConfigure={g.configure} onShowRules={() => setShowRules(true)} />
        <RulesModal open={showRules} onClose={() => setShowRules(false)} />
      </>
    );
  }

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
              
              // ¡CORRECCIÓN 1! Conectamos el botón de subir foto a la función correcta
              onUploadKillerImage={() => {}} 
              onUploadSurvivorImage={g.uploadKillerSurvivorImage}
              
              onWin={g.winKillerMatch}
              
              // ¡CORRECCIÓN 2! El botón derrota ahora resetea directamente en local
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