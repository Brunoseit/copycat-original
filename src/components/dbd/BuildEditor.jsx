import Combobox from './Combobox';
import { Swords } from 'lucide-react';

// Controlled character + 4 perks editor
export default function BuildEditor({
  role,
  characters,
  perks,
  value,
  onChange,
  disabled = false,
  characterLabel,
  compact = false,
}) {
  const v = value || { characterId: null, perkIds: ['', '', '', ''] };
  const perkIds = v.perkIds || ['', '', '', ''];

  const setChar = (id) => onChange({ ...v, characterId: id });
  const setPerk = (i, id) => {
    const next = [...perkIds];
    next[i] = id;
    onChange({ ...v, perkIds: next });
  };

  return (
    <div className="space-y-3">
      <Combobox
        label={characterLabel || (role === 'killer' ? 'Killer' : 'Superviviente')}
        options={characters}
        value={v.characterId}
        onChange={setChar}
        disabled={disabled}
        placeholder="Seleccionar personaje..."
      />

      <div className="space-y-2">
        <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
          <Swords className="w-3 h-3" /> Perks
        </label>
        {[0, 1, 2, 3].map((i) => (
          <Combobox
            key={i}
            options={perks}
            value={perkIds[i]}
            onChange={(id) => setPerk(i, id)}
            disabled={disabled}
            placeholder={`Perk ${i + 1}...`}
          />
        ))}
      </div>

    </div>
  );
}