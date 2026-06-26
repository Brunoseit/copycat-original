import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useAssets } from '@/lib/AssetsContext';
import { Upload, Trash2, Loader2, Plus, Image } from 'lucide-react';

const TYPES = [
  { key: 'killer', label: 'Killer' },
  { key: 'survivor', label: 'Superviviente' },
  { key: 'perk', label: 'Perk' },
];

export default function AssetManager() {
  const { custom } = useAssets();
  const [type, setType] = useState('killer');
  const [name, setName] = useState('');
  const [role, setRole] = useState('killer');
  const [character, setCharacter] = useState('');
  const [color, setColor] = useState('#7f1d1d');
  const [imageUrl, setImageUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const img = new Image();
    img.onload = () => {
      const ratio = Math.min(1, 400 / img.width);
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.width * ratio);
      canvas.height = Math.round(img.height * ratio);
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
      setImageUrl(canvas.toDataURL('image/jpeg', 0.6));
      setUploading(false);
    };
    img.onerror = () => setUploading(false);
    img.src = URL.createObjectURL(file);
  };

  const reset = () => { setName(''); setCharacter(''); setImageUrl(''); setColor('#7f1d1d'); };

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      await base44.entities.GameAsset.create({
        asset_type: type,
        name: name.trim(),
        role: type === 'perk' ? role : type,
        character: type === 'perk' ? character.trim() : '',
        image_url: imageUrl,
        color,
      });
      reset();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id) => base44.entities.GameAsset.delete(id).catch(() => {});

  return (
    <div className="space-y-6">
      <div className="bg-zinc-900/70 border border-zinc-800/60 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-zinc-300 mb-4 flex items-center gap-2"><Plus className="w-4 h-4 text-red-500" /> Añadir a la base de datos</h2>

        <div className="grid grid-cols-3 gap-2 mb-4">
          {TYPES.map((t) => (
            <button key={t.key} onClick={() => setType(t.key)}
              className={`py-2 rounded-lg text-sm font-medium transition-all ${type === t.key ? 'bg-red-800/60 border border-red-600/50 text-red-200' : 'bg-zinc-800/60 border border-zinc-700/40 text-zinc-400'}`}>
              {t.label}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nombre"
            className="w-full px-3 py-2.5 bg-zinc-800/80 border border-zinc-700/50 rounded-lg text-sm text-zinc-200 placeholder:text-zinc-600 outline-none focus:border-red-800/50" />

          {type === 'perk' && (
            <div className="grid grid-cols-2 gap-3">
              <select value={role} onChange={(e) => setRole(e.target.value)}
                className="px-3 py-2.5 bg-zinc-800/80 border border-zinc-700/50 rounded-lg text-sm text-zinc-200 outline-none focus:border-red-800/50">
                <option value="killer">Perk de Killer</option>
                <option value="survivor">Perk de Survi</option>
                <option value="general">General</option>
              </select>
              <input value={character} onChange={(e) => setCharacter(e.target.value)} placeholder="Personaje (opcional)"
                className="px-3 py-2.5 bg-zinc-800/80 border border-zinc-700/50 rounded-lg text-sm text-zinc-200 placeholder:text-zinc-600 outline-none focus:border-red-800/50" />
            </div>
          )}

          <div className="flex items-center gap-3">
            <label className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-zinc-800/60 border border-dashed border-zinc-600/50 hover:border-red-700/50 cursor-pointer transition-all">
              <input type="file" accept="image/*" onChange={handleUpload} className="hidden" />
              {uploading ? <Loader2 className="w-4 h-4 text-red-400 animate-spin" /> : <Upload className="w-4 h-4 text-red-500" />}
              <span className="text-sm text-zinc-400">{uploading ? 'Subiendo...' : 'Subir imagen'}</span>
            </label>
            <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="w-11 h-11 rounded-lg bg-transparent border border-zinc-700/50 cursor-pointer" title="Color de respaldo" />
          </div>

          {imageUrl && (
            <div className="flex items-center gap-2 text-xs text-green-400">
              <img src={imageUrl} alt="preview" className="w-10 h-10 rounded object-cover" /> Imagen lista
            </div>
          )}

          <button onClick={handleSave} disabled={!name.trim() || saving}
            className={`w-full py-2.5 rounded-lg text-sm font-semibold transition-all ${name.trim() && !saving ? 'bg-red-800 hover:bg-red-700 text-red-100' : 'bg-zinc-800/50 text-zinc-600 cursor-not-allowed'}`}>
            {saving ? 'Guardando...' : 'Guardar en la base de datos'}
          </button>
        </div>
      </div>

      {/* Existing custom assets */}
      <div className="bg-zinc-900/70 border border-zinc-800/60 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-zinc-300 mb-4">Personalizados ({custom.length})</h2>
        {custom.length === 0 ? (
          <p className="text-xs text-zinc-600">Aún no has añadido elementos personalizados.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {custom.map((a) => (
              <div key={a.id} className="flex items-center gap-2 bg-zinc-800/50 rounded-lg px-3 py-2">
                {a.image_url ? (
                  <img src={a.image_url} alt={a.name} className="w-8 h-8 rounded object-cover flex-shrink-0" />
                ) : (
                  <div className="w-8 h-8 rounded flex items-center justify-center flex-shrink-0" style={{ backgroundColor: a.color || '#555' }}>
                    <Image className="w-4 h-4 text-white/70" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-zinc-200 truncate">{a.name}</div>
                  <div className="text-[10px] text-zinc-500">{a.asset_type}</div>
                </div>
                <button onClick={() => handleDelete(a.id)} className="text-zinc-600 hover:text-red-400 transition-colors">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}