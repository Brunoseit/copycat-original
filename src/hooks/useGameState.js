// @ts-nocheck
import { useState, useEffect } from 'react';
import { useSocket } from '../lib/SocketContext';

export default function useGameState() {
    const { socket, room } = useSocket();

    const [state, setState] = useState({
        configured: false,
        num_players: 3,
        difficulty: 'normal',
        player_names: ['Jugador 1', 'Jugador 2', 'Jugador 3'],
        streak: 0,
        high_score: 0,
        cycle: 1,
        phase: 'survivor',
        survivor_matches: [{ result: null }, { result: null }, { result: null }],
        survivor_match_images: ['', '', ''],
        survivor_pool: [{ image: '', faced: [] }, { image: '', faced: [] }, { image: '', faced: [] }],
        survivor_expanded: [false, false, false],
        killer_assignments: [],
    });

    // Sincronización: Escuchar cambios del servidor
    useEffect(() => {
        if (!socket) return;
        
        const handleUpdate = (data) => {
            // El servidor ahora envía { room, gameState }
            if (data.room === room) {
                console.log(`[${room}] Sincronizando estado recibido del servidor.`);
                setState({ ...data.gameState });
            }
        };

        socket.on('update-state', handleUpdate);
        return () => socket.off('update-state', handleUpdate);
    }, [socket, room]);

    // Función envoltorio para emitir cambios al servidor
    const update = (fn) => {
        setState(prev => {
            const next = fn(prev);
            // Solo emitimos si tenemos una sala activa
            if (room && socket) {
                socket.emit('game-update', { room, gameState: next });
            }
            return { ...next };
        });
    };

    const saveToHistory = (result, charId = null) => {
        const history = localStorage.getItem('dbd_match_history');
        const list = history ? JSON.parse(history) : [];
        list.push({ id: Date.now().toString(), result, cycle: state.cycle, characterId: charId });
        localStorage.setItem('dbd_match_history', JSON.stringify(list));
    };

    const resetStateToStart = (s) => ({
        ...s,
        configured: false,
        streak: 0,
        cycle: 1,
        phase: 'survivor',
        survivor_matches: Array(s.num_players || 3).fill({ result: null }),
        survivor_match_images: Array(s.num_players || 3).fill(''),
        survivor_pool: Array(s.num_players || 3).fill({ image: '', faced: [] }),
        survivor_expanded: Array(s.num_players || 3).fill(false),
        killer_assignments: []
    });

    return { 
        state, 
        loading: false,
        winCondition: 2, 
        helpers: { emptyBuild: () => ({}) },
        
        joinRoom: (roomName) => {
            // joinRoom ya no necesita lógica aquí, el SocketContext se encarga de emitir al servidor
        },

        configure: (num, diff, names) => update(s => ({ 
            ...s, configured: true, num_players: num, difficulty: diff, player_names: names,
            survivor_matches: Array(num).fill({ result: null }),
            survivor_match_images: Array(num).fill(''),
            survivor_pool: Array(num).fill({ image: '', faced: [] }),
            survivor_expanded: Array(num).fill(false)
        })),
        
        newSession: () => update(s => resetStateToStart(s)),
        reset: () => update(s => resetStateToStart(s)),
        
        winSurvivorMatch: (index) => update(s => {
            const newMatches = [...s.survivor_matches];
            if (newMatches[index].result === 'win') return s;
            newMatches[index] = { ...newMatches[index], result: 'win' };
            const nextStreak = s.streak + 1;
            saveToHistory('win', newMatches[index].characterId);
            return { ...s, survivor_matches: newMatches, streak: nextStreak, high_score: Math.max(nextStreak, s.high_score) };
        }),
        
        defeat: () => update(s => {
            saveToHistory('loss');
            return { 
                ...s, 
                streak: 0, 
                cycle: 1, 
                phase: 'survivor',
                survivor_matches: Array(s.num_players).fill({ result: null }),
                survivor_match_images: Array(s.num_players).fill(''),
                survivor_pool: Array(s.num_players).fill({ image: '', faced: [] }),
                killer_assignments: []
            };
        }),

        uploadSurvivorImage: (index, url) => update(s => {
            const newImages = [...s.survivor_match_images];
            newImages[index] = url;
            return { ...s, survivor_match_images: newImages };
        }),

        toggleSurvivorExpand: (index) => update(s => {
            const newExpanded = [...s.survivor_expanded];
            newExpanded[index] = !newExpanded[index];
            return { ...s, survivor_expanded: newExpanded };
        }),
        
        saveSurvivorBuild: (index, build) => update(s => {
            const newMatches = [...s.survivor_matches];
            newMatches[index] = { ...newMatches[index], ...build };
            return { ...s, survivor_matches: newMatches };
        }),

        resetHighScore: () => update(s => ({ ...s, high_score: 0 })),
        
        startKillerPhase: () => update(s => {
            const assignments = s.survivor_matches.map((match, index) => ({
                playerIndex: index,
                characterId: match.characterId || null,
                killerId: match.characterId || null, 
                perkIds: match.perkIds || [],
                result: null,
                image: s.survivor_match_images[index] || '', 
                imageUrl: s.survivor_match_images[index] || '',
                killerImage: s.survivor_match_images[index] || '',
                survivorImage: '',
                faced: []
            }));

            return { ...s, phase: 'killer', killer_assignments: assignments };
        }),

        completeCycle: () => update(s => {
            const nextPool = Array(s.num_players).fill({ image: '', faced: [] });
            s.killer_assignments.forEach((assign, idx) => {
                const pIndex = assign.playerIndex ?? idx;
                if (pIndex >= 0 && pIndex < s.num_players) {
                    nextPool[pIndex] = {
                        image: assign.survivorImage || '',
                        faced: assign.faced || []
                    };
                }
            });

            return { 
                ...s, 
                cycle: s.cycle + 1, 
                phase: 'survivor',
                survivor_matches: Array(s.num_players).fill({ result: null }),
                survivor_match_images: Array(s.num_players).fill(''), 
                survivor_pool: nextPool, 
                killer_assignments: [] 
            };
        }),

        updateKillerAssignment: (index, data) => update(s => {
            const newAssigns = [...s.killer_assignments];
            newAssigns[index] = { ...newAssigns[index], ...data };
            return { ...s, killer_assignments: newAssigns };
        }),
        
        winKillerMatch: (index) => update(s => {
            const newAssigns = [...s.killer_assignments];
            if (newAssigns[index].result === 'win') return s;
            newAssigns[index] = { ...newAssigns[index], result: 'win' };
            const nextStreak = s.streak + 1;
            saveToHistory('win', newAssigns[index].characterId);
            return { ...s, killer_assignments: newAssigns, streak: nextStreak, high_score: Math.max(nextStreak, s.high_score) };
        }),

        reassignKiller: (cardIndex, newPlayerIndex) => update(s => {
            const newAssigns = [...s.killer_assignments];
            const existingImage = newAssigns[cardIndex].survivorImage;
            const existingFaced = newAssigns[cardIndex].faced;
            newAssigns[cardIndex] = {
                ...newAssigns[cardIndex],
                playerIndex: parseInt(newPlayerIndex, 10),
                survivorImage: existingImage,
                faced: existingFaced
            };
            return { ...s, killer_assignments: newAssigns };
        }),

        uploadKillerSurvivorImage: (index, url) => update(s => {
            const newAssigns = [...s.killer_assignments];
            newAssigns[index] = { ...newAssigns[index], survivorImage: url };
            return { ...s, killer_assignments: newAssigns };
        }),

        saveKillerMatch: (index, build) => update(s => {
            const newAssigns = [...s.killer_assignments];
            newAssigns[index] = { ...newAssigns[index], ...build };
            return { ...s, killer_assignments: newAssigns };
        })
    };
}