'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import HeroThumb from '@/components/HeroThumb';
import type { ThumbSlot } from '@/lib/thumbs';

type Item = ThumbSlot & { custom: string | null };

const GROUPS = [
  { key: 'all', label: 'All' },
  { key: 'home', label: 'Home & Video page', match: (w: string) => w.startsWith('Home · Hero') || w.startsWith('Video page') },
  { key: 'vertical', label: 'Vertical Cinema', match: (w: string) => w.includes('Vertical Cinema') },
  { key: 'ai', label: 'AI Lab', match: (w: string) => w.startsWith('AI Lab') },
] as const;
type GroupKey = typeof GROUPS[number]['key'];

/** Long edge cap for uploads; the site never shows a thumbnail larger than this. */
const MAX_EDGE = 1280;
/** Stay under the server's limit (base64 characters). */
const MAX_B64 = 780_000;

// Shrink in the browser before upload: a phone photo is several MB, and the
// database caps each save at about 1 MB. Output is always a JPEG.
async function shrinkImage(file: File): Promise<string> {
  const src = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.src = src;
    await img.decode();
    const scale = Math.min(1, MAX_EDGE / Math.max(img.naturalWidth, img.naturalHeight));
    const w = Math.max(1, Math.round(img.naturalWidth * scale));
    const h = Math.max(1, Math.round(img.naturalHeight * scale));
    const canvas = document.createElement('canvas');
    canvas.width = w; canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('canvas');
    ctx.fillStyle = '#0E0E0E'; // transparent PNGs land on the site's ink colour
    ctx.fillRect(0, 0, w, h);
    ctx.drawImage(img, 0, 0, w, h);
    for (const q of [0.86, 0.78, 0.68, 0.55]) {
      const d = canvas.toDataURL('image/jpeg', q);
      if (d.length - d.indexOf(',') - 1 <= MAX_B64) return d;
    }
    throw new Error('too big');
  } finally {
    URL.revokeObjectURL(src);
  }
}

export default function ThumbsAdmin() {
  const [items, setItems] = useState<Item[] | null>(null);
  const [loadErr, setLoadErr] = useState('');
  const [group, setGroup] = useState<GroupKey>('all');
  const [q, setQ] = useState('');

  useEffect(() => {
    fetch('/api/admin/thumbs')
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((d) => setItems(d.items || []))
      .catch(() => setLoadErr('Could not load the video list. Refresh to try again.'));
  }, []);

  const shown = useMemo(() => {
    if (!items) return [];
    const g = GROUPS.find((x) => x.key === group);
    const needle = q.trim().toLowerCase();
    return items.filter((it) =>
      (!g || !('match' in g) || it.where.some(g.match)) &&
      (!needle || it.title.toLowerCase().includes(needle)));
  }, [items, group, q]);

  const customCount = items?.filter((i) => i.custom).length ?? 0;
  const update = (videoId: string, custom: string | null) =>
    setItems((xs) => xs && xs.map((x) => (x.videoId === videoId ? { ...x, custom } : x)));

  return (
    <>
      <div className="adm-sechead">
        <h2 className="adm-sechead-t">Thumb<em>nails</em></h2>
        <span className="adm-sechead-c">
          {items ? `${items.length} videos · ${customCount} custom` : 'loading…'}
        </span>
      </div>
      <p className="adm-hint">
        Upload an image or paste an image link to replace a video’s thumbnail. It shows on the site
        within about a minute. Vertical videos look best with a portrait (9:16) image, the rest with
        a widescreen (16:9) one. Reset brings back the original.
      </p>

      <div className="adm-thumb-bar">
        <div className="adm-thumb-chips">
          {GROUPS.map((g) => (
            <button key={g.key} className={'adm-thumb-chip' + (group === g.key ? ' on' : '')} onClick={() => setGroup(g.key)}>
              {g.label}
            </button>
          ))}
        </div>
        <input className="adm-input adm-thumb-search" placeholder="Search by title" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>

      {loadErr && <p className="adm-msg err">{loadErr}</p>}
      {items && shown.length === 0 && <p className="adm-sub">No videos match.</p>}

      <div className="adm-thumb-grid">
        {shown.map((it) => <ThumbCard key={it.videoId} item={it} onChange={update} />)}
      </div>
    </>
  );
}

function ThumbCard({ item, onChange }: { item: Item; onChange: (id: string, custom: string | null) => void }) {
  const [mode, setMode] = useState<'idle' | 'link'>('idle');
  const [link, setLink] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; t: string } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const send = async (method: 'PUT' | 'DELETE', payload: Record<string, string>) => {
    setBusy(true); setMsg(null);
    try {
      const res = await fetch('/api/admin/thumbs', {
        method, headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoId: item.videoId, ...payload }),
      });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) { setMsg({ ok: false, t: d.error || 'Save failed' }); return false; }
      onChange(item.videoId, method === 'DELETE' ? null : d.custom || null);
      setMsg({ ok: true, t: method === 'DELETE' ? 'Reset ✓' : 'Saved ✓' });
      return true;
    } catch {
      setMsg({ ok: false, t: 'Network error' });
      return false;
    } finally {
      setBusy(false);
    }
  };

  const onFile = async (f: File | undefined) => {
    if (!f) return;
    if (!/^image\//.test(f.type)) { setMsg({ ok: false, t: 'Choose an image file.' }); return; }
    setBusy(true); setMsg({ ok: true, t: 'Preparing…' });
    let dataUrl: string;
    try { dataUrl = await shrinkImage(f); }
    catch { setBusy(false); setMsg({ ok: false, t: 'Couldn’t read that image.' }); return; }
    await send('PUT', { image: dataUrl });
  };

  const saveLink = async () => {
    if (await send('PUT', { url: link.trim() })) { setMode('idle'); setLink(''); }
  };

  return (
    <div className={'adm-thumb' + (item.vertical ? ' v' : '')}>
      <div className="adm-thumb-media">
        {item.custom
          // eslint-disable-next-line @next/next/no-img-element
          ? <img src={item.custom} alt={item.title} referrerPolicy="no-referrer" />
          : <HeroThumb film={{ type: item.type, videoId: item.videoId, title: item.title }} noCustom />}
        {item.custom && <span className="adm-thumb-badge">Custom</span>}
      </div>
      <div className="adm-thumb-body">
        <div className="adm-thumb-title">{item.title}</div>
        <div className="adm-thumb-where">{item.where.join(' · ')}</div>

        {mode === 'link' ? (
          <div className="adm-thumb-link">
            <input
              className="adm-input" placeholder="https://… image link" value={link} autoFocus
              onChange={(e) => setLink(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && link.trim()) saveLink(); if (e.key === 'Escape') setMode('idle'); }}
            />
            <div className="adm-thumb-actions">
              <button className="adm-thumb-btn primary" disabled={busy || !link.trim()} onClick={saveLink}>Save</button>
              <button className="adm-thumb-btn" disabled={busy} onClick={() => { setMode('idle'); setLink(''); }}>Cancel</button>
            </div>
          </div>
        ) : (
          <div className="adm-thumb-actions">
            <button className="adm-thumb-btn primary" disabled={busy} onClick={() => fileRef.current?.click()}>Upload</button>
            <button className="adm-thumb-btn" disabled={busy} onClick={() => { setMode('link'); setMsg(null); }}>Paste link</button>
            {item.custom && <button className="adm-thumb-btn" disabled={busy} onClick={() => send('DELETE', {})}>Reset</button>}
          </div>
        )}
        <input
          ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" hidden
          onChange={(e) => { onFile(e.target.files?.[0]); e.target.value = ''; }}
        />
        {msg && <p className={'adm-msg ' + (msg.ok ? 'ok' : 'err')}>{msg.t}</p>}
      </div>
    </div>
  );
}
