// @ts-nocheck
import { useState, useEffect } from 'react';

export default function useGameState() {
    const [state, setState] = useState(() => {
        const saved = localStorage.getItem('dbd_copycat_state');
        return saved ? JSON.parse(saved) : {
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
            survivor_expanded: [false, false, false],
            killer_assignments: [],
        };
    });

    useEffect(() => {
        localStorage.setItem('dbd_copycat_state', JSON.stringify(state));
    }, [state]);

    const update = (fn) => setState(prev => fn(prev));

    const saveToHistory = (result, charId = null) => {
        const history = localStorage.getItem('dbd_match_history');
        const list = history ? JSON.parse(history) : [];
        list.push({ id: Date.now().toString(), result, cycle: state.cycle, characterId: charId });
        localStorage.setItem('dbd_match_history', JSON.stringify(list));
    };

    // ¡CORRECCIÓN 2! Función de limpieza profunda para reiniciar todo a 0
    const resetStateToStart = (s) => ({
        ...s,
        configured: false,
        streak: 0,
        cycle: 1,
        phase: 'survivor',
        survivor_matches: Array(s.num_players || 3).fill({ result: null }),
        survivor_match_images: Array(s.num_players || 3).fill(''),
        survivor_expanded: Array(s.num_players || 3).fill(false),
        killer_assignments: []
    });

    return { 
        state, 
        loading: false,
        winCondition: 2, 
        helpers: { emptyBuild: () => ({}) },
        
        configure: (num, diff, names) => update(s => ({ 
            ...s, configured: true, num_players: num, difficulty: diff, player_names: names,
            survivor_matches: Array(num).fill({ result: null }),
            survivor_match_images: Array(num).fill(''),
            survivor_expanded: Array(num).fill(false)
        })),
        
        // Aplicamos la limpieza profunda a los botones de Nueva Sesión y Cambiar Configuración
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
                survivorImage: '' // Empieza vacío
            }));

            return { 
                ...s, 
                phase: 'killer',
                killer_assignments: assignments
            };
        }),

        completeCycle: () => update(s => ({ 
            ...s, 
            cycle: s.cycle + 1, 
            phase: 'survivor',
            survivor_matches: Array(s.num_players).fill({ result: null }),
            survivor_match_images: Array(s.num_players).fill(''),
            // Limpiamos los assignments de killers pero mantenemos la racha
            killer_assignments: [] 
        })),

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
            // Mantenemos la foto que ya existía en esa tarjeta aunque cambiemos de jugador
            const existingImage = newAssigns[cardIndex].survivorImage;
            
            newAssigns[cardIndex] = {
                ...newAssigns[cardIndex],
                playerIndex: parseInt(newPlayerIndex, 10),
                survivorImage: existingImage 
            };
            return { ...s, killer_assignments: newAssigns };
        }),

       // Función única y limpia para subir la imagen de los supervivientes enfrentados
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
    }; // Cierra el return
} // Cierra la función principal