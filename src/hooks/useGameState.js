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
        
        newSession: () => update(s => ({ ...s, configured: false })),
        reset: () => update(s => ({ ...s, configured: false })),
        
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
                
                // La foto heredada solo va a la imagen del Killer
                image: s.survivor_match_images[index] || '', 
                imageUrl: s.survivor_match_images[index] || '',
                killerImage: s.survivor_match_images[index] || '',
                
                // ¡CORRECCIÓN! Esto empieza vacío para que puedas subir una foto nueva
                survivorImage: '' 
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
            newAssigns[cardIndex] = {
                ...newAssigns[cardIndex],
                playerIndex: parseInt(newPlayerIndex, 10)
            };
            return { ...s, killer_assignments: newAssigns };
        }),

        uploadKillerImage: (index, url) => update(s => {
            const newAssigns = [...s.killer_assignments];
            newAssigns[index] = { ...newAssigns[index], killerImage: url, imageUrl: url };
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