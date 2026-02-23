import { useState, useRef, useEffect, useCallback } from "react";
import { create } from "zustand";

// ── Store ─────────────────────────────────────────────────────────────────────
const useStore = create((set) => ({
  hoveredMovie: null,
  playingMovie: null,
  watchlist: [],
  tooltipPos: null,
  showMyList: false,
  setHovered:   (m, pos) => set({ hoveredMovie: m, tooltipPos: pos }),
  clearHovered: ()       => set({ hoveredMovie: null, tooltipPos: null }),
  setPlaying:   (m)      => set({ playingMovie: m, hoveredMovie: null, tooltipPos: null, showMyList: false }),
  stopPlaying:  ()       => set({ playingMovie: null }),
  toggleWatch:  (m)      => set((s) => ({
    watchlist: s.watchlist.find((x) => x.id === m.id)
      ? s.watchlist.filter((x) => x.id !== m.id)
      : [...s.watchlist, m],
  })),
  openMyList:   ()       => set({ showMyList: true }),
  closeMyList:  ()       => set({ showMyList: false }),
}));

// ── Data ──────────────────────────────────────────────────────────────────────
const MOVIES = [
  { id:1, title:"Cosmic Drift",    tag:"SCI-FI",        year:2024, rating:"TV-MA", match:97, dur:"2h 14m", desc:"A lone astronaut drifts through a collapsing universe searching for the last habitable planet.",         cover:"https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=600&h=900&fit=crop", src:"https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",                    accent:"#818cf8", dark:"#1e1b4b" },
  { id:2, title:"Neon Tokyo",      tag:"THRILLER",      year:2023, rating:"TV-14", match:94, dur:"1h 58m", desc:"In 2089 Tokyo a detective unravels a conspiracy spanning centuries of silence and deception.",             cover:"https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=600&h=900&fit=crop", src:"https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",                   accent:"#38bdf8", dark:"#0c1a2e" },
  { id:3, title:"Last Forest",     tag:"DRAMA",         year:2024, rating:"PG-13", match:91, dur:"2h 02m", desc:"A family fights to protect the only remaining old-growth forest from a ruthless corporation.",             cover:"https://images.unsplash.com/photo-1448375240586-882707db888b?w=600&h=900&fit=crop", src:"https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",                     accent:"#4ade80", dark:"#052e16" },
  { id:4, title:"Crimson Tide",    tag:"ACTION",        year:2024, rating:"R",     match:88, dur:"1h 47m", desc:"An elite commander must defuse a mutiny while a rogue clock ticks toward global catastrophe.",             cover:"https://images.unsplash.com/photo-1502481851512-e9e2529bfbf9?w=600&h=900&fit=crop", src:"https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",                  accent:"#f87171", dark:"#2d0a0a" },
  { id:5, title:"Ghost Signal",    tag:"HORROR",        year:2023, rating:"TV-MA", match:85, dur:"1h 39m", desc:"A radio operator receives transmissions from a dimension where the dead still broadcast.",                 cover:"https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?w=600&h=900&fit=crop", src:"https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",                        accent:"#c084fc", dark:"#1a0a2e" },
  { id:6, title:"Solar Queens",    tag:"ADVENTURE",     year:2024, rating:"PG",    match:96, dur:"2h 21m", desc:"Three sisters inherit a crumbling solar empire and race to restore power to a dying civilization.",        cover:"https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=900&fit=crop", src:"https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4",       accent:"#fbbf24", dark:"#1c1000" },
  { id:7, title:"Deep State",      tag:"SPY",           year:2023, rating:"TV-MA", match:92, dur:"1h 55m", desc:"A whistleblower exposes a shadow government only to find she has been part of their plan all along.",     cover:"https://images.unsplash.com/photo-1557804506-669a67965ba0?w=600&h=900&fit=crop", src:"https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",                       accent:"#94a3b8", dark:"#0f172a" },
  { id:8, title:"Fracture",        tag:"PSYCHOLOGICAL", year:2024, rating:"R",     match:89, dur:"1h 51m", desc:"A therapist realizes her newest patient shares memories she has never told another soul.",                 cover:"https://images.unsplash.com/photo-1509023464722-18d996393ca8?w=600&h=900&fit=crop", src:"https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/VolkswagenGTIReview.mp4",               accent:"#f472b6", dark:"#1f0a17" },
  { id:9, title:"Ember",           tag:"ROMANCE",       year:2024, rating:"TV-14", match:93, dur:"1h 44m", desc:"Two strangers find each other on the last train before their city is evacuated forever.",                 cover:"https://images.unsplash.com/photo-1518105779142-d975f22f1b0a?w=600&h=900&fit=crop", src:"https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WhatCarCanYouGetForAGrand.mp4",          accent:"#fb923c", dark:"#1c0a00" },
];

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Mono:wght@400;500;700&display=swap');
  *, *::before, *::after { margin:0; padding:0; box-sizing:border-box; }
  html, body, #root { min-height:100vh; background:#07070d; color:#fff; font-family:'Syne',sans-serif; overflow-x:hidden; }
  @keyframes slideUp  { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
  @keyframes fadeUp   { from{opacity:0;transform:translateY(6px)}  to{opacity:1;transform:translateY(0)} }
  @keyframes fadeIn   { from{opacity:0} to{opacity:1} }
  @keyframes pulseDot { 0%,100%{opacity:1} 50%{opacity:0.3} }
  ::-webkit-scrollbar{width:3px} ::-webkit-scrollbar-thumb{background:#1e293b;border-radius:2px}

  .mc {
    position: relative;
    border-radius: 10px;
    overflow: hidden;
    cursor: pointer;
    aspect-ratio: 2/3;
    background: #0f0f18;
    transition: transform 0.25s cubic-bezier(.4,0,.2,1), box-shadow 0.25s;
  }
  .mc:hover { transform: scale(1.04); }
  .mc img { width:100%; height:100%; object-fit:cover; display:block; transition:opacity 0.3s; }
  .mc:hover img { opacity: 0.35; }
  .mc-grad {
    position:absolute; inset:0;
    background: linear-gradient(to top, rgba(0,0,0,.82) 22%, transparent 60%);
    transition: background 0.3s;
    pointer-events: none;
  }
  .mc:hover .mc-grad {
    background: linear-gradient(to top, rgba(0,0,0,.96) 55%, rgba(0,0,0,.1) 85%);
  }
  .mc-stripe {
    position:absolute; top:0; left:0; right:0; height:3px;
    transform:scaleX(0); transform-origin:left;
    transition:transform 0.3s; pointer-events:none;
  }
  .mc:hover .mc-stripe { transform:scaleX(1); }
  .mc-tag {
    position:absolute; top:10px; left:9px;
    font-size:0.5rem; font-weight:800; letter-spacing:0.1em;
    font-family:'DM Mono',monospace; pointer-events:none;
    transition:opacity 0.2s;
  }
  .mc:hover .mc-tag { opacity:0 !important; }
  .mc-name {
    position:absolute; bottom:8px; left:10px; right:10px;
    font-family:'Syne',sans-serif; font-size:0.76rem;
    font-weight:700; color:#fff; pointer-events:none;
    transition:opacity 0.2s;
  }
  .mc:hover .mc-name { opacity:0; }

  .mc-info {
    position:absolute; inset:0;
    display:flex; flex-direction:column; justify-content:flex-end;
    padding:10px;
    opacity:0; pointer-events:none;
    transition:opacity 0.22s;
  }
  .mc:hover .mc-info { opacity:1; pointer-events:auto; }

  .movie-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 14px;
    padding-bottom: 40px;
  }
`;

// ── BgVideo ───────────────────────────────────────────────────────────────────
function BgVideo() {
  const { hoveredMovie } = useStore();
  const ref    = useRef(null);
  const lastId = useRef(null);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    if (!hoveredMovie) {
      v.pause(); v.removeAttribute("src"); v.load();
      lastId.current = null; return;
    }
    if (hoveredMovie.id === lastId.current) return;
    lastId.current = hoveredMovie.id;
    v.src = hoveredMovie.src; v.load();
    v.play().catch(() => {});
  }, [hoveredMovie]);

  return (
    <div style={{ position:"fixed", inset:0, zIndex:0, pointerEvents:"none",
      opacity: hoveredMovie ? 1 : 0, transition:"opacity 0.6s ease" }}>
      <video ref={ref} muted loop playsInline
        style={{ width:"100%", height:"100%", objectFit:"cover", opacity:0.2 }} />
      <div style={{ position:"absolute", inset:0,
        background: hoveredMovie
          ? `radial-gradient(ellipse 72% 85% at 24% 55%, ${hoveredMovie.dark}dd 0%, transparent 68%)`
          : "transparent",
        transition:"background 0.6s ease" }} />
      <div style={{ position:"absolute", inset:0,
        background:"linear-gradient(to right,rgba(7,7,13,.97) 0%,rgba(7,7,13,.6) 48%,rgba(7,7,13,.08) 100%),linear-gradient(to top,rgba(7,7,13,1) 0%,transparent 42%)" }} />
    </div>
  );
}

// ── MatchBar ──────────────────────────────────────────────────────────────────
function MatchBar({ match, accent }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:7 }}>
      <div style={{ flex:1, height:3, background:"rgba(255,255,255,0.07)", borderRadius:2, overflow:"hidden" }}>
        <div style={{ height:"100%", width:`${match}%`, background:accent, borderRadius:2, boxShadow:`0 0 6px ${accent}88` }} />
      </div>
      <span style={{ fontSize:"0.57rem", fontWeight:800, color:accent, fontFamily:"'DM Mono',monospace", minWidth:26 }}>{match}%</span>
    </div>
  );
}

// ── MovieCard ─────────────────────────────────────────────────────────────────
function MovieCard({ movie, index }) {
  const { setHovered, clearHovered, setPlaying, watchlist, toggleWatch } = useStore();

  // FIX 1: Use !! to get a reliable boolean instead of object/undefined
  const inList = !!watchlist.find((x) => x.id === movie.id);
  const t = useRef(null);

  // FIX 2: Pass stable index from MOVIES array (movie.id - 1) so animation
  // delay is always consistent regardless of filter — no more jumpy card 9
  const stableIndex = movie.id - 1;

  const onEnter = () => { clearTimeout(t.current); t.current = setTimeout(() => setHovered(movie), 80); };
  const onLeave = () => { clearTimeout(t.current); clearHovered(); };

  return (
    <div
      className="mc"
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      onClick={() => setPlaying(movie)}
      style={{
        // FIX 3: Cap the max delay so card 9 doesn't lag noticeably behind
        animation:`fadeIn 0.4s ease ${Math.min(stableIndex * 0.045, 0.32)}s both`,
        boxShadow:`0 2px 14px rgba(0,0,0,.5)`,
      }}
    >
      <img src={movie.cover} alt={movie.title} />
      <div className="mc-grad" />
      <div className="mc-stripe" style={{ background:movie.accent }} />
      <div className="mc-tag" style={{ color:movie.accent, opacity:0.85 }}>{movie.tag}</div>
      <div className="mc-name">{movie.title}</div>

      <div className="mc-info">
        <p style={{ fontFamily:"'Syne',sans-serif", fontSize:"0.85rem", fontWeight:700,
          color:"#fff", marginBottom:5, lineHeight:1.1 }}>{movie.title}</p>

        <div style={{ marginBottom:5 }}>
          <MatchBar match={movie.match} accent={movie.accent} />
        </div>

        <div style={{ display:"flex", gap:5, marginBottom:8, flexWrap:"wrap" }}>
          <span style={{ fontSize:"0.52rem", fontFamily:"'DM Mono',monospace", color:movie.accent,
            border:`1px solid ${movie.accent}55`, padding:"1px 6px", borderRadius:10,
            whiteSpace:"nowrap" }}>{movie.rating}</span>
          <span style={{ fontSize:"0.52rem", fontFamily:"'DM Mono',monospace", color:"#475569",
            whiteSpace:"nowrap" }}>{movie.dur}</span>
        </div>

        <div style={{ display:"flex", flexDirection:"row", gap:6, alignItems:"center" }}>
          <button
            onClick={(e) => { e.stopPropagation(); setPlaying(movie); }}
            style={{
              flex:1,
              background:movie.accent, color:"#000", border:"none", borderRadius:5,
              padding:"6px 0", fontSize:"0.65rem", fontWeight:800, cursor:"pointer",
              fontFamily:"'Syne',sans-serif", display:"flex", alignItems:"center",
              justifyContent:"center", gap:4, whiteSpace:"nowrap",
            }}
          >▶ Play</button>

          <button
            onClick={(e) => { e.stopPropagation(); toggleWatch(movie); }}
            style={{
              flexShrink:0,
              width:28, height:28, borderRadius:"50%", cursor:"pointer",
              background: inList ? `${movie.accent}33` : "rgba(255,255,255,0.1)",
              border: inList ? `1px solid ${movie.accent}77` : "1px solid rgba(255,255,255,0.22)",
              color: inList ? movie.accent : "#fff",
              fontSize: inList ? "0.68rem" : "0.95rem",
              display:"flex", alignItems:"center", justifyContent:"center",
              transition:"all 0.2s",
            }}
            title={inList ? "Remove from list" : "Add to watchlist"}
          >{inList ? "✓" : "+"}</button>
        </div>
      </div>
    </div>
  );
}

// ── SpotlightPanel ────────────────────────────────────────────────────────────
function SpotlightPanel() {
  const { hoveredMovie, setPlaying, watchlist, toggleWatch } = useStore();
  const f = hoveredMovie || MOVIES[0];
  const inList = !!watchlist.find((x) => x.id === f.id);
  return (
    <div style={{ position:"sticky", top:0, height:"100vh", flex:"0 0 44%", maxWidth:510,
      display:"flex", flexDirection:"column", justifyContent:"flex-end",
      padding:"0 0 56px 52px", zIndex:2 }}>
      <div key={f.id} style={{ animation:"slideUp 0.35s cubic-bezier(.4,0,.2,1)" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:18 }}>
          <span style={{ fontSize:"0.58rem", fontWeight:800, letterSpacing:"0.22em",
            color:f.accent, fontFamily:"'DM Mono',monospace" }}>◆ {f.tag}</span>
          <div style={{ width:36, height:1, background:`${f.accent}44` }} />
          <span style={{ fontSize:"0.56rem", color:"#334155", fontFamily:"'DM Mono',monospace" }}>{f.year}</span>
        </div>

        <h1 style={{ fontFamily:"'Syne',sans-serif", fontWeight:800,
          fontSize:"clamp(2.4rem,4.5vw,4.4rem)", color:"#fff",
          lineHeight:0.9, letterSpacing:"-0.03em",
          marginBottom:20, textShadow:`0 0 80px ${f.accent}33` }}>{f.title}</h1>

        <div style={{ marginBottom:16, maxWidth:250 }}>
          <div style={{ fontSize:"0.54rem", color:"#475569", letterSpacing:"0.14em",
            fontFamily:"'DM Mono',monospace", marginBottom:5 }}>MATCH SCORE</div>
          <MatchBar match={f.match} accent={f.accent} />
        </div>

        <div style={{ display:"flex", gap:7, marginBottom:18, flexWrap:"wrap" }}>
          {[f.rating, f.dur, String(f.year)].map((c) => (
            <span key={c} style={{ fontSize:"0.58rem", fontFamily:"'DM Mono',monospace", fontWeight:600,
              border:`1px solid ${f.accent}44`, color:f.accent,
              padding:"3px 9px", borderRadius:20, background:`${f.accent}0d` }}>{c}</span>
          ))}
        </div>

        <p style={{ fontSize:"0.86rem", color:"#94a3b8", lineHeight:1.72, maxWidth:370, marginBottom:28 }}>{f.desc}</p>

        <div style={{ display:"flex", gap:11, alignItems:"center", marginBottom:32, flexWrap:"wrap" }}>
          <button onClick={() => setPlaying(f)}
            style={{ background:f.accent, color:"#000", border:"none", borderRadius:7,
              padding:"11px 28px", fontSize:"0.85rem", fontWeight:800, cursor:"pointer",
              fontFamily:"'Syne',sans-serif", letterSpacing:"0.04em",
              display:"flex", alignItems:"center", gap:8,
              boxShadow:`0 4px 28px ${f.accent}55`, transition:"transform 0.15s, box-shadow 0.15s" }}
            onMouseEnter={(e) => { e.currentTarget.style.transform="translateY(-2px)"; e.currentTarget.style.boxShadow=`0 8px 36px ${f.accent}88`; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform=""; e.currentTarget.style.boxShadow=`0 4px 28px ${f.accent}55`; }}
          >▶ Play Now</button>

          <button onClick={() => toggleWatch(f)}
            style={{ background: inList ? `${f.accent}22` : "rgba(255,255,255,0.05)",
              color: inList ? f.accent : "#94a3b8",
              border: inList ? `1px solid ${f.accent}66` : "1px solid rgba(255,255,255,0.1)",
              borderRadius:7, padding:"11px 20px", fontSize:"0.85rem",
              fontFamily:"'Syne',sans-serif", cursor:"pointer", transition:"all 0.2s",
              display:"flex", alignItems:"center", gap:7 }}
            onMouseEnter={(e) => { if (!inList) { e.currentTarget.style.background="rgba(255,255,255,0.1)"; e.currentTarget.style.color="#fff"; }}}
            onMouseLeave={(e) => { if (!inList) { e.currentTarget.style.background="rgba(255,255,255,0.05)"; e.currentTarget.style.color="#94a3b8"; }}}
          >{inList ? "✓ In List" : "+ Watchlist"}</button>
        </div>

        <div style={{ display:"flex", gap:5, alignItems:"center" }}>
          {MOVIES.map((m) => (
            <div key={m.id} style={{
              width: m.id === f.id ? 22 : 5, height:5, borderRadius:3,
              background: m.id === f.id ? f.accent : "rgba(255,255,255,0.09)",
              transition:"all 0.35s ease",
              boxShadow: m.id === f.id ? `0 0 8px ${f.accent}` : "none" }} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ── ScrollPanel ───────────────────────────────────────────────────────────────
function ScrollPanel() {
  const { hoveredMovie, watchlist } = useStore();
  const accent = hoveredMovie?.accent || "#e50914";
  const [filter, setFilter] = useState("ALL");

  // FIX 4: Added "PSYCHOLOGICAL" to genres list — was missing, causing card 8
  // (Fracture) to vanish on filter and card 9 (Ember) to shift/glitch in position
  const genres = ["ALL","SCI-FI","THRILLER","DRAMA","ACTION","HORROR","ADVENTURE","SPY","PSYCHOLOGICAL","ROMANCE"];
  const shown  = filter === "ALL" ? MOVIES : MOVIES.filter((m) => m.tag === filter);

  return (
    <div style={{ flex:1, overflowY:"auto", padding:"82px 48px 20px 20px",
      scrollbarWidth:"thin", scrollbarColor:"#1e293b transparent" }}>

      <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:6 }}>
        <div style={{ display:"flex", alignItems:"center", gap:6 }}>
          <div style={{ width:7, height:7, borderRadius:"50%", background:"#e50914",
            boxShadow:"0 0 8px #e50914", animation:"pulseDot 1.6s ease-in-out infinite" }} />
          <span style={{ fontSize:"0.56rem", fontWeight:700, color:"#e50914",
            fontFamily:"'DM Mono',monospace", letterSpacing:"0.14em" }}>LIVE</span>
        </div>
        <div style={{ flex:1, height:1, background:"#0f172a" }} />
        {watchlist.length > 0 && (
          <span style={{ fontSize:"0.54rem", color:"#475569", fontFamily:"'DM Mono',monospace" }}>
            {watchlist.length} IN LIST
          </span>
        )}
      </div>

      <div style={{ height:2, background:"#0f172a", borderRadius:1, marginBottom:22, overflow:"hidden" }}>
        <div style={{ height:"100%", width:"100%",
          background:`linear-gradient(to right, ${accent}, transparent)`,
          transition:"background 0.55s ease" }} />
      </div>

      <div style={{ display:"flex", gap:7, flexWrap:"wrap", marginBottom:18 }}>
        {genres.map((g) => (
          <button key={g} onClick={() => setFilter(g)}
            style={{ background: filter===g ? `${accent}22` : "transparent",
              border: filter===g ? `1px solid ${accent}88` : "1px solid #1e293b",
              color: filter===g ? accent : "#334155",
              borderRadius:20, padding:"4px 12px", fontSize:"0.58rem", cursor:"pointer",
              fontFamily:"'DM Mono',monospace", letterSpacing:"0.06em", transition:"all 0.2s" }}
            onMouseEnter={(e) => { if (filter!==g) { e.currentTarget.style.borderColor=accent; e.currentTarget.style.color="#fff"; }}}
            onMouseLeave={(e) => { if (filter!==g) { e.currentTarget.style.borderColor="#1e293b"; e.currentTarget.style.color="#334155"; }}}
          >{g}</button>
        ))}
      </div>

      <div className="movie-grid">
        {shown.map((m, i) => <MovieCard key={m.id} movie={m} index={i} />)}
      </div>

      {shown.length === 0 && (
        <div style={{ textAlign:"center", padding:"60px 0", color:"#334155",
          fontFamily:"'DM Mono',monospace", fontSize:"0.75rem" }}>No titles in this genre</div>
      )}
    </div>
  );
}

// ── Player ────────────────────────────────────────────────────────────────────
function Player() {
  const { playingMovie, stopPlaying } = useStore();
  const ref   = useRef(null);
  const [showUI, setShowUI] = useState(false);
  const timer = useRef(null);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    if (!playingMovie) {
      v.pause(); v.src = ""; v.load();
      setShowUI(false); return;
    }
    v.src = playingMovie.src; v.load();
    v.play().catch(() => {});
    setShowUI(true);
    timer.current = setTimeout(() => setShowUI(false), 3500);
    return () => clearTimeout(timer.current);
  }, [playingMovie]);

  const onMouseMove = useCallback(() => {
    setShowUI(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setShowUI(false), 3000);
  }, []);

  const handleBack = useCallback(() => {
    clearTimeout(timer.current);
    stopPlaying();
  }, [stopPlaying]);

  useEffect(() => () => clearTimeout(timer.current), []);

  return (
    <div onMouseMove={onMouseMove}
      style={{ position:"fixed", inset:0, zIndex:200, background:"#000",
        display: playingMovie ? "block" : "none",
        cursor: showUI ? "default" : "none" }}>

      <video ref={ref} controls playsInline
        style={{ width:"100%", height:"100%", objectFit:"contain", display:"block" }} />

      <div style={{ position:"fixed", top:0, left:0, right:0, height:90,
        background:"linear-gradient(to bottom,rgba(0,0,0,.85),transparent)",
        zIndex:210, pointerEvents:"none",
        opacity: showUI ? 1 : 0, transition:"opacity 0.28s ease" }} />

      <button onClick={handleBack}
        style={{ position:"fixed", top:20, left:20, zIndex:220,
          display:"flex", alignItems:"center", gap:8, padding:"8px 20px",
          background:"rgba(0,0,0,0.4)", backdropFilter:"blur(20px)",
          WebkitBackdropFilter:"blur(20px)",
          border:"1px solid rgba(255,255,255,0.18)", borderRadius:8,
          color:"#fff", fontSize:"0.82rem", fontWeight:700,
          fontFamily:"'Syne',sans-serif", letterSpacing:"0.05em", cursor:"pointer",
          opacity: showUI ? 1 : 0,
          transform: showUI ? "translateX(0)" : "translateX(-16px)",
          transition:"opacity 0.28s ease, transform 0.28s ease",
          pointerEvents: showUI ? "auto" : "none" }}>
        ← Back
      </button>

      {playingMovie && (
        <div style={{ position:"fixed", top:20, left:"50%", transform:"translateX(-50%)",
          zIndex:220, display:"flex", alignItems:"center", gap:8,
          padding:"7px 18px", background:"rgba(0,0,0,0.4)",
          backdropFilter:"blur(20px)", WebkitBackdropFilter:"blur(20px)",
          border:"1px solid rgba(255,255,255,0.12)", borderRadius:8, pointerEvents:"none",
          opacity: showUI ? 1 : 0, transition:"opacity 0.28s ease" }}>
          <div style={{ width:3, height:16, background:playingMovie.accent, borderRadius:2 }} />
          <span style={{ fontFamily:"'Syne',sans-serif", fontSize:"0.82rem",
            fontWeight:800, color:"#fff", whiteSpace:"nowrap" }}>{playingMovie.title}</span>
          <span style={{ fontSize:"0.54rem", fontFamily:"'DM Mono',monospace", fontWeight:700,
            color:playingMovie.accent, background:`${playingMovie.accent}18`,
            border:`1px solid ${playingMovie.accent}44`, padding:"2px 7px", borderRadius:10 }}>
            {playingMovie.tag}
          </span>
        </div>
      )}
    </div>
  );
}

// ── MyListDrawer ──────────────────────────────────────────────────────────────
function MyListDrawer() {
  const { showMyList, closeMyList, watchlist, toggleWatch, setPlaying } = useStore();

  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") closeMyList(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [closeMyList]);

  return (
    <>
      <div onClick={closeMyList} style={{
        position:"fixed", inset:0, zIndex:300,
        background:"rgba(0,0,0,0.6)", backdropFilter:"blur(4px)",
        opacity: showMyList ? 1 : 0,
        pointerEvents: showMyList ? "auto" : "none",
        transition:"opacity 0.3s ease",
      }} />
      <div style={{
        position:"fixed", top:0, right:0, bottom:0, zIndex:310,
        width:"min(420px, 92vw)",
        background:"linear-gradient(160deg, #0d0d1a 0%, #07070d 100%)",
        borderLeft:"1px solid rgba(255,255,255,0.07)",
        transform: showMyList ? "translateX(0)" : "translateX(100%)",
        transition:"transform 0.35s cubic-bezier(.4,0,.2,1)",
        display:"flex", flexDirection:"column",
        boxShadow: showMyList ? "-20px 0 60px rgba(0,0,0,0.6)" : "none",
      }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
          padding:"22px 24px 18px", borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
          <div>
            <p style={{ fontSize:"0.52rem", color:"#475569", fontFamily:"'DM Mono',monospace",
              letterSpacing:"0.18em", marginBottom:4 }}>MY LIST</p>
            <h2 style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:"1.3rem", color:"#fff" }}>
              Watchlist
              <span style={{ marginLeft:10, fontSize:"0.7rem", fontWeight:600,
                color:"#e50914", fontFamily:"'DM Mono',monospace" }}>
                {watchlist.length} {watchlist.length === 1 ? "title" : "titles"}
              </span>
            </h2>
          </div>
          <button onClick={closeMyList} style={{
            background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)",
            borderRadius:"50%", width:36, height:36, cursor:"pointer",
            color:"#94a3b8", fontSize:"1rem", display:"flex", alignItems:"center", justifyContent:"center",
            transition:"all 0.2s",
          }}
            onMouseEnter={(e) => { e.currentTarget.style.background="rgba(255,255,255,0.12)"; e.currentTarget.style.color="#fff"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background="rgba(255,255,255,0.05)"; e.currentTarget.style.color="#94a3b8"; }}
          >✕</button>
        </div>

        <div style={{ flex:1, overflowY:"auto", padding:"16px 24px 32px",
          scrollbarWidth:"thin", scrollbarColor:"#1e293b transparent" }}>
          {watchlist.length === 0 ? (
            <div style={{ textAlign:"center", paddingTop:80 }}>
              <div style={{ fontSize:"2.5rem", marginBottom:16, opacity:0.3 }}>🎬</div>
              <p style={{ fontFamily:"'DM Mono',monospace", fontSize:"0.72rem",
                color:"#334155", letterSpacing:"0.1em" }}>Your list is empty</p>
              <p style={{ fontFamily:"'Syne',sans-serif", fontSize:"0.8rem",
                color:"#1e293b", marginTop:8 }}>Add titles using the + button on any card</p>
            </div>
          ) : (
            <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
              {watchlist.map((m) => (
                <div key={m.id} style={{
                  display:"flex", gap:14, alignItems:"center",
                  background:"rgba(255,255,255,0.03)",
                  border:"1px solid rgba(255,255,255,0.06)",
                  borderRadius:10, padding:"10px 12px",
                  transition:"background 0.2s, border-color 0.2s", cursor:"pointer",
                }}
                  onMouseEnter={(e) => { e.currentTarget.style.background="rgba(255,255,255,0.07)"; e.currentTarget.style.borderColor=`${m.accent}33`; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background="rgba(255,255,255,0.03)"; e.currentTarget.style.borderColor="rgba(255,255,255,0.06)"; }}
                  onClick={() => setPlaying(m)}
                >
                  <div style={{ position:"relative", flexShrink:0, width:52, height:78,
                    borderRadius:7, overflow:"hidden" }}>
                    <img src={m.cover} alt={m.title}
                      style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }} />
                    <div style={{ position:"absolute", top:0, left:0, right:0, height:2, background:m.accent }} />
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <p style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:"0.85rem",
                      color:"#fff", marginBottom:3,
                      whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{m.title}</p>
                    <div style={{ display:"flex", gap:6, alignItems:"center", marginBottom:6 }}>
                      <span style={{ fontSize:"0.5rem", fontFamily:"'DM Mono',monospace",
                        color:m.accent, border:`1px solid ${m.accent}44`,
                        padding:"1px 6px", borderRadius:8 }}>{m.tag}</span>
                      <span style={{ fontSize:"0.5rem", fontFamily:"'DM Mono',monospace",
                        color:"#475569" }}>{m.dur}</span>
                    </div>
                    <div style={{ maxWidth:160 }}>
                      <MatchBar match={m.match} accent={m.accent} />
                    </div>
                  </div>
                  <div style={{ display:"flex", flexDirection:"column", gap:6, flexShrink:0 }}>
                    <button onClick={(e) => { e.stopPropagation(); setPlaying(m); }}
                      style={{ background:m.accent, color:"#000", border:"none", borderRadius:5,
                        padding:"5px 12px", fontSize:"0.62rem", fontWeight:800,
                        cursor:"pointer", fontFamily:"'Syne',sans-serif", whiteSpace:"nowrap" }}>▶ Play</button>
                    <button onClick={(e) => { e.stopPropagation(); toggleWatch(m); }}
                      style={{ background:"transparent", border:"1px solid rgba(255,255,255,0.12)",
                        borderRadius:5, padding:"5px 12px", fontSize:"0.62rem",
                        cursor:"pointer", fontFamily:"'DM Mono',monospace",
                        color:"#64748b", whiteSpace:"nowrap", transition:"all 0.2s" }}
                      onMouseEnter={(e) => { e.currentTarget.style.borderColor="#e5091488"; e.currentTarget.style.color="#e50914"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.borderColor="rgba(255,255,255,0.12)"; e.currentTarget.style.color="#64748b"; }}
                    >✕ Remove</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// ── Navbar ────────────────────────────────────────────────────────────────────
function Navbar() {
  const { hoveredMovie, watchlist, openMyList } = useStore();
  const accent = hoveredMovie?.accent || "#e50914";
  return (
    <div style={{ position:"fixed", top:0, left:0, right:0, zIndex:50, pointerEvents:"none",
      display:"flex", alignItems:"center", justifyContent:"space-between",
      padding:"0 52px", height:60,
      background:"linear-gradient(to bottom,rgba(7,7,13,.97),transparent)" }}>
      <span style={{ fontFamily:"'Syne',sans-serif", fontSize:"1.5rem", fontWeight:800,
        color:accent, transition:"color 0.55s ease",
        userSelect:"none", pointerEvents:"auto", letterSpacing:"-0.01em" }}>NETFLUX</span>
      <div style={{ display:"flex", gap:26, pointerEvents:"auto" }}>
        {["Home","Series","Films","My List"].map((item, i) => (
          <span key={item}
            onClick={item === "My List" ? openMyList : undefined}
            style={{ fontSize:"0.78rem", fontWeight:i===0?700:500,
              color:i===0?"#f1f5f9":"#475569", cursor:"pointer",
              transition:"color 0.2s", fontFamily:"'Syne',sans-serif",
              ...(item === "My List" && { color: accent, fontWeight: 600 }) }}
            onMouseEnter={(e)=>e.target.style.color="#f1f5f9"}
            onMouseLeave={(e)=>e.target.style.color=item==="My List"?accent:i===0?"#f1f5f9":"#475569"}
          >{item}{item === "My List" && watchlist.length > 0 &&
            <span style={{ marginLeft:5, fontSize:"0.55rem", fontFamily:"'DM Mono',monospace",
              background:"#e50914", color:"#fff", borderRadius:10,
              padding:"1px 5px", verticalAlign:"middle" }}>{watchlist.length}</span>
          }</span>
        ))}
      </div>
      <div style={{ display:"flex", gap:14, alignItems:"center", pointerEvents:"auto" }}>
        <span style={{ cursor:"pointer", color:"#475569" }}>🔍</span>
        <div style={{ position:"relative" }}>
          <span style={{ cursor:"pointer", color:"#475569" }}>🔔</span>
          {watchlist.length > 0 && (
            <div style={{ position:"absolute", top:-4, right:-4, width:14, height:14,
              borderRadius:"50%", background:"#e50914",
              display:"flex", alignItems:"center", justifyContent:"center",
              fontSize:"0.5rem", fontWeight:800, color:"#fff" }}>{watchlist.length}</div>
          )}
        </div>
        <div style={{ width:30, height:30, borderRadius:6,
          background:`linear-gradient(135deg,${accent},${accent}88)`,
          display:"flex", alignItems:"center", justifyContent:"center",
          fontSize:"0.72rem", fontWeight:800, cursor:"pointer",
          transition:"background 0.55s ease", color:"#000" }}>U</div>
      </div>
    </div>
  );
}

// ── Mobile ────────────────────────────────────────────────────────────────────
function MobileLayout() {
  const { hoveredMovie, setHovered, clearHovered, setPlaying, watchlist, toggleWatch } = useStore();
  const f = hoveredMovie || MOVIES[0];
  const inList = !!watchlist.find((x) => x.id === f.id);
  return (
    <div style={{ minHeight:"100vh", paddingTop:60 }}>
      <div style={{ position:"relative", height:"56vw", minHeight:230, maxHeight:370,
        overflow:"hidden", marginBottom:20 }}>
        <img src={f.cover} alt={f.title}
          style={{ width:"100%", height:"100%", objectFit:"cover", opacity:0.55, transition:"opacity 0.4s" }} />
        <div style={{ position:"absolute", inset:0,
          background:"linear-gradient(to top,rgba(7,7,13,1) 0%,rgba(7,7,13,.32) 65%,transparent 100%)" }} />
        <div style={{ position:"absolute", bottom:18, left:18, right:18 }}>
          <p style={{ fontSize:"0.56rem", color:f.accent, letterSpacing:"0.2em",
            fontFamily:"'DM Mono',monospace", fontWeight:800, marginBottom:5 }}>◆ {f.tag}</p>
          <h2 style={{ fontFamily:"'Syne',sans-serif", fontSize:"clamp(1.5rem,6vw,2.2rem)",
            fontWeight:800, color:"#fff", lineHeight:1, marginBottom:10 }}>{f.title}</h2>
          <div style={{ marginBottom:10, maxWidth:200 }}>
            <MatchBar match={f.match} accent={f.accent} />
          </div>
          <div style={{ display:"flex", gap:9 }}>
            <button onClick={() => setPlaying(f)}
              style={{ background:f.accent, color:"#000", border:"none", borderRadius:6,
                padding:"8px 20px", fontSize:"0.8rem", fontWeight:800,
                cursor:"pointer", fontFamily:"'Syne',sans-serif" }}>▶ Play</button>
            <button onClick={() => toggleWatch(f)}
              style={{ background:inList?`${f.accent}22`:"rgba(255,255,255,0.08)",
                color:inList?f.accent:"#94a3b8",
                border:inList?`1px solid ${f.accent}55`:"1px solid rgba(255,255,255,0.15)",
                borderRadius:6, padding:"8px 16px", fontSize:"0.8rem",
                cursor:"pointer", fontFamily:"'Syne',sans-serif" }}>
              {inList ? "✓ Listed" : "+ List"}
            </button>
          </div>
        </div>
      </div>
      <div style={{ padding:"0 14px 60px" }}>
        <p style={{ fontSize:"0.54rem", color:"#334155", letterSpacing:"0.18em",
          fontFamily:"'DM Mono',monospace", marginBottom:12 }}>ALL TITLES</p>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:9 }}>
          {MOVIES.map((m) => (
            <div key={m.id} onClick={() => setPlaying(m)}
              onTouchStart={() => setHovered(m)} onTouchEnd={() => clearHovered()}
              style={{ position:"relative", borderRadius:8, overflow:"hidden",
                aspectRatio:"2/3", cursor:"pointer" }}>
              <img src={m.cover} alt={m.title}
                style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }} />
              <div style={{ position:"absolute", inset:0,
                background:"linear-gradient(to top,rgba(0,0,0,.9) 0%,transparent 55%)" }} />
              <div style={{ position:"absolute", top:0, left:0, right:0, height:2, background:m.accent }} />
              <p style={{ position:"absolute", bottom:6, left:6, right:6,
                fontFamily:"'Syne',sans-serif", fontSize:"0.64rem",
                fontWeight:700, color:"#fff", lineHeight:1.2 }}>{m.title}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Root ──────────────────────────────────────────────────────────────────────
export default function App() {
  const { playingMovie } = useStore();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const fn = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);

  return (
    <>
      <style>{CSS}</style>
      <Player />
      <MyListDrawer />
      <div style={{ display: playingMovie ? "none" : "block" }}>
        <div style={{ position:"fixed", inset:0, background:"#07070d", zIndex:-1 }} />
        <BgVideo />
        <Navbar />
        {isMobile ? <MobileLayout /> : (
          <div style={{ display:"flex", height:"100vh", overflow:"hidden",
            position:"relative", zIndex:2, paddingTop:60 }}>
            <SpotlightPanel />
            <div style={{ flex:1, overflowY:"auto" }}>
              <ScrollPanel />
            </div>
          </div>
        )}
      </div>
    </>
  );
}