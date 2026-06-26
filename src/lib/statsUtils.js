// Aggregation helpers for MatchHistory records

export function overallWinRate(matches) {
  if (!matches.length) return { total: 0, wins: 0, rate: 0 };
  const wins = matches.filter(m => m.result === 'win').length;
  return { total: matches.length, wins, rate: Math.round((wins / matches.length) * 100) };
}

export function perPlayerStats(matches) {
  const map = {};
  matches.forEach((m) => {
    const key = m.player_name || (m.player_index != null ? `Jugador ${m.player_index + 1}` : 'Equipo');
    if (!map[key]) map[key] = { name: key, total: 0, wins: 0, losses: 0, killer: 0, survivor: 0 };
    map[key].total += 1;
    if (m.result === 'win') map[key].wins += 1; else map[key].losses += 1;
    if (m.role === 'killer') map[key].killer += 1; else map[key].survivor += 1;
  });
  return Object.values(map)
    .map(p => ({ ...p, rate: p.total ? Math.round((p.wins / p.total) * 100) : 0 }))
    .sort((a, b) => b.rate - a.rate);
}

export function buildUsage(matches, findChar, findPerk) {
  const chars = {};
  const perks = {};
  matches.forEach((m) => {
    if (m.character_id) {
      const name = findChar(m.character_id)?.nombre || m.character_name || m.character_id;
      chars[name] = (chars[name] || 0) + 1;
    }
    (m.perk_ids || []).forEach((pid) => {
      if (!pid) return;
      const name = findPerk(pid)?.nombre || pid;
      perks[name] = (perks[name] || 0) + 1;
    });
  });
  const toSorted = (obj) => Object.entries(obj).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);
  return { characters: toSorted(chars), perks: toSorted(perks) };
}