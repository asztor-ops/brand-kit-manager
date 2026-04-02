import { useState, useEffect, useRef, useCallback } from "react";

const uid = () => Math.random().toString(36).slice(2, 9);
const hexToRgb = h => {
  try { return { r: parseInt(h.slice(1,3),16), g: parseInt(h.slice(3,5),16), b: parseInt(h.slice(5,7),16) }; }
  catch { return {r:0,g:0,b:0}; }
};
const lum = h => {
  const {r,g,b} = hexToRgb(h);
  const f = c => { c/=255; return c<=0.03928 ? c/12.92 : ((c+0.055)/1.055)**2.4; };
  return 0.2126*f(r)+0.7152*f(g)+0.0722*f(b);
};
const contrastRatio = (a,b) => {
  try { const [la,lb]=[lum(a),lum(b)]; return (Math.max(la,lb)+0.05)/(Math.min(la,lb)+0.05); }
  catch { return 1; }
};
const textOn = h => { try { return lum(h)>0.32?'#111':'#fff'; } catch { return '#fff'; } };
const isHex = h => /^#[0-9A-Fa-f]{6}$/.test(h);
const gradCss = g => {
  const stops = [...g.stops].sort((a,b)=>a.pos-b.pos).map(s=>`${s.hex} ${s.pos}%`).join(',');
  return g.type==='radial' ? `radial-gradient(circle,${stops})` : `linear-gradient(${g.angle}deg,${stops})`;
};

const COLOR_ROLES = [
  {v:'primary',l:'Elsődleges'},{v:'secondary',l:'Másodlagos'},{v:'accent',l:'Akcentus'},
  {v:'background',l:'Háttér'},{v:'text',l:'Szöveg'},{v:'gradient-start',l:'Gradiens Start'},
  {v:'gradient-end',l:'Gradiens Vég'},{v:'other',l:'Egyéb'}
];
const MEDIA_TYPES = {logo:'Logo',image:'Kép',infographic:'Infografika',icon:'Ikon',mockup:'Mockup',other:'Egyéb'};
const MEDIA_COLORS = {logo:'#6366f1',image:'#22c55e',infographic:'#f59e0b',icon:'#ec4899',mockup:'#14b8a6',other:'#64748b'};

const makeDemoData = () => ({
  id: uid(), name:'Amazing AI',
  tagline:'Az AI segítségével szöveges parancsból lenyűgöző képeket generálunk.',
  description:'Az Amazing AI egy innovatív mesterséges intelligencia platform, amely forradalmasítja a kreatív tartalomkészítést. Fő tevékenységi körünk a képgenerálás, AI-alapú dizájneszközök fejlesztése és kreatív megoldások nyújtása.',
  industry:'Mesterséges Intelligencia', website:'www.amazingai.hu',
  colors:[
    {id:uid(),name:'BG Deep',hex:'#08061A',role:'background'},
    {id:uid(),name:'BG Mid',hex:'#1A0A3E',role:'other'},
    {id:uid(),name:'Purple Primary',hex:'#7B2FBE',role:'primary'},
    {id:uid(),name:'Violet',hex:'#9B35D8',role:'other'},
    {id:uid(),name:'Pink Accent',hex:'#E91E8C',role:'accent'},
    {id:uid(),name:'Magenta',hex:'#C850C0',role:'gradient-end'},
    {id:uid(),name:'Blue',hex:'#4158D0',role:'secondary'},
    {id:uid(),name:'White',hex:'#FFFFFF',role:'text'},
    {id:uid(),name:'Text Light',hex:'#E8E0FF',role:'other'},
  ],
  gradients:[
    {id:uid(),name:'Hero Background',angle:135,stops:[{hex:'#08061A',pos:0},{hex:'#1A0A3E',pos:50},{hex:'#2D0A5E',pos:100}],type:'linear'},
    {id:uid(),name:'Pink Gradient',angle:135,stops:[{hex:'#E91E8C',pos:0},{hex:'#C850C0',pos:100}],type:'linear'},
    {id:uid(),name:'Accent Gradient',angle:90,stops:[{hex:'#C850C0',pos:0},{hex:'#4158D0',pos:100}],type:'linear'},
    {id:uid(),name:'Full Spectrum',angle:180,stops:[{hex:'#E91E8C',pos:0},{hex:'#7B2FBE',pos:50},{hex:'#4158D0',pos:100}],type:'linear'},
    {id:uid(),name:'Glow Purple',angle:135,stops:[{hex:'#4A1060',pos:0},{hex:'#7B35B8',pos:100}],type:'radial'},
  ],
  fonts:[
    {id:uid(),name:'Bebas Neue',family:"'Bebas Neue', sans-serif",importUrl:'https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap',role:'heading',weight:'400'},
    {id:uid(),name:'Barlow',family:"'Barlow', sans-serif",importUrl:'https://fonts.googleapis.com/css2?family=Barlow:ital,wght@0,400;0,600;1,400;1,600&display=swap',role:'body',weight:'400'},
  ],
  voice:{
    traits:['Innovatív','Inspiráló','Megbízható','Hozzáférhető','Kreatív'],
    channelTones:[
      {id:uid(),channel:'Weboldal',tone:'Professzionális',sample:'Fedezd fel a kreativitás határait AI eszközeinkkel'},
      {id:uid(),channel:'Instagram',tone:'Laza, inspiráló',sample:'Ma is egy új lehetőség vár! Mit alkotsz ma?'},
      {id:uid(),channel:'Marketing',tone:'Lelkes, eredményközpontú',sample:'Alakítsd át ötleteidet lenyűgöző vizuális alkotásokká'},
    ],
    dos:['Tömör és barátságos kommunikáció','Kreativitás lehetőségeinek hangsúlyozása','Emberközpontú technológia narratíva'],
    donts:['Kerüld a túl technikai szakzsargont','Ne ígérj megvalósíthatatlant','Kerüld a passzív hangnemet'],
  },
  media:[], logo:null,
  chartColors:{primary:'#E91E8C',secondary:'#7B2FBE',tertiary:'#4158D0',bg:'#1A0A3E',text:'#E8E0FF'},
  chartNotes:'Vonaldiagramok: 3px vonalvastagság. Oszlopdiagramok: gradiens kitöltés, lekerekített sarkok. Kördiagramok: subtle shadow.',
  created: Date.now()
});

const newBrand = (name='Új Márka') => ({
  id:uid(), name, tagline:'', description:'', industry:'', website:'',
  colors:[], gradients:[], fonts:[],
  voice:{traits:[],channelTones:[],dos:[],donts:[]},
  media:[], logo:null,
  chartColors:{primary:'#6366f1',secondary:'#8b5cf6',tertiary:'#14b8a6',bg:'#1e2035',text:'#94a3b8'},
  chartNotes:'', created:Date.now()
});

const T = {
  appBg:'#07080f', side:'#0c0d1a', sideBorder:'#161728',
  card:'#111220', cardB:'#1e2035', inp:'#0d0e1c', inpB:'#252740',
  acc:'#6366f1', accL:'#818cf8', accG:'linear-gradient(135deg,#6366f1,#8b5cf6)',
  tx:'#e2e8f0', txM:'#94a3b8', txF:'#3d4466',
  ok:'#22c55e', err:'#ef4444',
};

const Card = ({children, style={}, ...p}) => (
  <div style={{background:T.card,border:`1px solid ${T.cardB}`,borderRadius:16,padding:24,...style}} {...p}>
    {children}
  </div>
);

const Lbl = ({c}) => (
  <div style={{fontSize:11,fontWeight:700,color:T.txM,letterSpacing:'0.09em',textTransform:'uppercase',marginBottom:8}}>{c}</div>
);

const Badge = ({children, color=T.acc}) => (
  <span style={{display:'inline-flex',alignItems:'center',padding:'3px 9px',borderRadius:20,background:color+'22',color,fontSize:11,fontWeight:700,letterSpacing:'0.04em'}}>{children}</span>
);

const Btn = ({children, onClick, v='primary', size='md', style={}, disabled=false}) => {
  const vs = {
    primary: {background:T.accG,color:'#fff',border:'none',boxShadow:'0 4px 16px #6366f130'},
    secondary: {background:'#1a1b2e',color:T.tx,border:`1px solid ${T.cardB}`},
    danger: {background:'#ef444418',color:'#ef4444',border:'1px solid #ef444438'},
    ghost: {background:'transparent',color:T.txM,border:'none'}
  };
  return (
    <button
      disabled={disabled}
      onClick={!disabled ? onClick : undefined}
      style={{borderRadius:10,cursor:disabled?'not-allowed':'pointer',fontWeight:700,letterSpacing:'0.02em',transition:'opacity 0.15s',opacity:disabled?0.5:1,fontSize:size==='sm'?12:14,padding:size==='sm'?'6px 13px':'9px 18px',fontFamily:'inherit',...vs[v],...style}}
    >
      {children}
    </button>
  );
};

const Inp = ({value, onChange, placeholder='', type='text', style={}, ...p}) => (
  <input
    type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
    style={{background:T.inp,border:`1px solid ${T.inpB}`,borderRadius:10,padding:'9px 13px',color:T.tx,fontSize:13,width:'100%',outline:'none',fontFamily:'inherit',...style}}
    {...p}
  />
);

const Sel = ({value, onChange, children, style={}}) => (
  <select
    value={value} onChange={e=>onChange(e.target.value)}
    style={{background:T.inp,border:`1px solid ${T.inpB}`,borderRadius:10,padding:'9px 13px',color:T.tx,fontSize:13,width:'100%',fontFamily:'inherit',...style}}
  >
    {children}
  </select>
);

const TA = ({value, onChange, placeholder='', rows=3}) => (
  <textarea
    value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} rows={rows}
    style={{background:T.inp,border:`1px solid ${T.inpB}`,borderRadius:10,padding:'9px 13px',color:T.tx,fontSize:13,width:'100%',outline:'none',fontFamily:'inherit',resize:'vertical'}}
  />
);

const SHead = ({title, subtitle, icon}) => (
  <div style={{background:`linear-gradient(160deg,${T.card},${T.appBg})`,borderBottom:`1px solid ${T.cardB}`,padding:'28px 36px'}}>
    <div style={{display:'flex',alignItems:'center',gap:14}}>
      <div style={{width:44,height:44,borderRadius:13,background:T.accG,display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,boxShadow:'0 6px 24px #6366f135'}}>{icon}</div>
      <div>
        <h2 style={{margin:0,fontSize:22,fontWeight:800,color:T.tx}}>{title}</h2>
        {subtitle && <p style={{margin:'3px 0 0',color:T.txM,fontSize:13}}>{subtitle}</p>}
      </div>
    </div>
  </div>
);

// ── SECTIONS ──────────────────────────────────────────

function OverviewSection({brand, upd}) {
  return (
    <div style={{padding:36,display:'grid',gap:20}}>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20}}>
        <Card>
          <h3 style={{margin:'0 0 18px',color:T.tx,fontSize:14,fontWeight:700}}>Alapadatok</h3>
          <div style={{display:'grid',gap:13}}>
            {[['NÉV','name','Márka neve...'],['SZLOGEN','tagline','Szlogen, mottó...'],['IPARÁG','industry','pl. Technológia, Ingatlan...'],['WEBOLDAL','website','https://...']].map(([l,k,p]) => (
              <div key={k}><Lbl c={l}/><Inp value={brand[k]||''} onChange={v=>upd(()=>({[k]:v}))} placeholder={p}/></div>
            ))}
          </div>
        </Card>
        <Card>
          <h3 style={{margin:'0 0 18px',color:T.tx,fontSize:14,fontWeight:700}}>Leírás</h3>
          <TA value={brand.description||''} onChange={v=>upd(()=>({description:v}))} placeholder="A márkáról, a cégről..." rows={10}/>
        </Card>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:14}}>
        {[{l:'Szín',n:brand.colors.length,i:'🎨',c:T.acc},{l:'Gradiens',n:brand.gradients.length,i:'🌈',c:'#8b5cf6'},{l:'Betűtípus',n:brand.fonts.length,i:'✍️',c:'#14b8a6'},{l:'Média',n:brand.media.length,i:'🖼️',c:'#f59e0b'}].map(x => (
          <Card key={x.l} style={{textAlign:'center',padding:18}}>
            <div style={{fontSize:24,marginBottom:6}}>{x.i}</div>
            <div style={{fontSize:38,fontWeight:900,color:x.c,lineHeight:1}}>{x.n}</div>
            <div style={{color:T.txM,fontSize:12,marginTop:4}}>{x.l}</div>
          </Card>
        ))}
      </div>
      {brand.colors.length > 0 && (
        <Card>
          <h3 style={{margin:'0 0 13px',color:T.tx,fontSize:14,fontWeight:700}}>Szín Szimfónia</h3>
          <div style={{display:'flex',height:60,borderRadius:12,overflow:'hidden',boxShadow:'0 4px 20px rgba(0,0,0,0.5)'}}>
            {brand.colors.map(c => <div key={c.id} title={`${c.name} · ${c.hex}`} style={{flex:1,background:c.hex,minWidth:6}}/>)}
          </div>
          <div style={{display:'flex',gap:10,marginTop:10,flexWrap:'wrap'}}>
            {brand.colors.map(c => (
              <span key={c.id} style={{display:'inline-flex',alignItems:'center',gap:5}}>
                <span style={{width:9,height:9,borderRadius:'50%',background:c.hex,display:'inline-block'}}/>
                <span style={{color:T.txM,fontSize:11}}>{c.name}</span>
              </span>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

function ColorsSection({brand, upd}) {
  const [nc, setNc] = useState({name:'',hex:'#6366f1',role:'primary'});
  const [ng, setNg] = useState({name:'Új Gradiens',angle:135,stops:[{hex:'#6366f1',pos:0},{hex:'#8b5cf6',pos:100}],type:'linear'});
  const updStop = (i,k,v) => setNg(g => { const s=[...g.stops]; s[i]={...s[i],[k]:v}; return {...g,stops:s}; });

  return (
    <div style={{padding:36,display:'grid',gap:28}}>
      <Card>
        <h3 style={{margin:'0 0 18px',color:T.tx,fontSize:14,fontWeight:700}}>Szín Hozzáadása</h3>
        <div style={{display:'grid',gridTemplateColumns:'2fr auto 1fr auto',gap:11,alignItems:'flex-end'}}>
          <div><Lbl c="MEGNEVEZÉS"/><Inp value={nc.name} onChange={v=>setNc(c=>({...c,name:v}))} placeholder="pl. Elsődleges kék..."/></div>
          <div>
            <Lbl c="SZÍN"/>
            <div style={{display:'flex',gap:6,alignItems:'center'}}>
              <input type="color" value={nc.hex} onChange={e=>setNc(c=>({...c,hex:e.target.value}))} style={{width:42,height:40,border:'none',background:'none',cursor:'pointer',padding:2,borderRadius:8}}/>
              <Inp value={nc.hex} onChange={v=>setNc(c=>({...c,hex:v}))} style={{width:90}}/>
            </div>
          </div>
          <div><Lbl c="SZEREPKÖR"/><Sel value={nc.role} onChange={v=>setNc(c=>({...c,role:v}))}>{COLOR_ROLES.map(r=><option key={r.v} value={r.v}>{r.l}</option>)}</Sel></div>
          <div style={{alignSelf:'flex-end'}}>
            <Btn onClick={() => { if(!nc.name||!isHex(nc.hex)) return; upd(b=>({colors:[...b.colors,{id:uid(),...nc}]})); setNc({name:'',hex:'#6366f1',role:'primary'}); }}>Hozzáad</Btn>
          </div>
        </div>
      </Card>

      {brand.colors.length > 0 && (
        <div>
          <h3 style={{margin:'0 0 14px',color:T.tx,fontSize:14,fontWeight:700}}>Szín Paletta · {brand.colors.length} szín</h3>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))',gap:12}}>
            {brand.colors.map(c => (
              <div key={c.id} style={{borderRadius:16,overflow:'hidden',border:`1px solid ${T.cardB}`,boxShadow:`0 6px 20px ${c.hex}30`}}>
                <div style={{height:105,background:c.hex,display:'flex',alignItems:'center',justifyContent:'center',position:'relative'}}>
                  <span style={{fontFamily:'monospace',fontSize:11,fontWeight:800,color:textOn(c.hex),background:'rgba(0,0,0,0.25)',padding:'3px 8px',borderRadius:6}}>{c.hex.toUpperCase()}</span>
                  <button onClick={()=>upd(b=>({colors:b.colors.filter(x=>x.id!==c.id)}))} style={{position:'absolute',top:7,right:7,width:24,height:24,borderRadius:'50%',background:'rgba(0,0,0,0.45)',border:'none',color:'#fff',cursor:'pointer',fontSize:13}}>×</button>
                </div>
                <div style={{background:T.card,padding:'11px 13px'}}>
                  <div style={{fontWeight:700,color:T.tx,fontSize:12,marginBottom:5}}>{c.name}</div>
                  <Badge color={T.acc}>{COLOR_ROLES.find(r=>r.v===c.role)?.l||c.role}</Badge>
                  {isHex(c.hex) && <div style={{fontSize:10,color:T.txF,fontFamily:'monospace',marginTop:5}}>RGB {Object.values(hexToRgb(c.hex)).join(' · ')}</div>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <Card>
        <h3 style={{margin:'0 0 18px',color:T.tx,fontSize:14,fontWeight:700}}>Gradiens Készítő</h3>
        <div style={{height:90,borderRadius:13,marginBottom:18,background:gradCss(ng),boxShadow:'0 8px 28px rgba(0,0,0,0.5)'}}/>
        <div style={{display:'grid',gridTemplateColumns:'2fr 1fr 1fr',gap:11,marginBottom:14}}>
          <div><Lbl c="NÉV"/><Inp value={ng.name} onChange={v=>setNg(g=>({...g,name:v}))} placeholder="Gradiens neve..."/></div>
          <div><Lbl c="TÍPUS"/><Sel value={ng.type} onChange={v=>setNg(g=>({...g,type:v}))}><option value="linear">Lineáris</option><option value="radial">Radiális</option></Sel></div>
          {ng.type==='linear' && (
            <div><Lbl c={`SZÖG · ${ng.angle}°`}/><input type="range" min={0} max={360} value={ng.angle} onChange={e=>setNg(g=>({...g,angle:+e.target.value}))} style={{width:'100%',marginTop:10}}/></div>
          )}
        </div>
        <div style={{display:'grid',gap:9,marginBottom:13}}>
          {ng.stops.map((st,i) => (
            <div key={i} style={{display:'flex',gap:8,alignItems:'center'}}>
              <input type="color" value={st.hex} onChange={e=>updStop(i,'hex',e.target.value)} style={{width:38,height:36,border:'none',background:'none',cursor:'pointer',borderRadius:8}}/>
              <Inp value={st.hex} onChange={v=>updStop(i,'hex',v)} style={{width:90}}/>
              <input type="range" min={0} max={100} value={st.pos} onChange={e=>updStop(i,'pos',+e.target.value)} style={{flex:1}}/>
              <span style={{color:T.txM,fontSize:12,width:34,flexShrink:0}}>{st.pos}%</span>
              <button onClick={()=>ng.stops.length>2&&setNg(g=>({...g,stops:g.stops.filter((_,j)=>j!==i)}))} style={{width:26,height:26,borderRadius:8,background:'#ef444420',border:'1px solid #ef444440',color:'#ef4444',cursor:'pointer'}}>×</button>
            </div>
          ))}
        </div>
        <div style={{display:'flex',gap:10}}>
          <Btn onClick={()=>setNg(g=>({...g,stops:[...g.stops,{hex:'#ffffff',pos:50}]}))} v="secondary" size="sm">+ Színpont</Btn>
          <Btn onClick={()=>upd(b=>({gradients:[...b.gradients,{id:uid(),...ng}]}))}>Gradiens Mentése</Btn>
        </div>
      </Card>

      {brand.gradients.length > 0 && (
        <div>
          <h3 style={{margin:'0 0 14px',color:T.tx,fontSize:14,fontWeight:700}}>Gradiens Galéria</h3>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(250px,1fr))',gap:13}}>
            {brand.gradients.map(g => (
              <div key={g.id} style={{borderRadius:18,overflow:'hidden',border:`1px solid ${T.cardB}`}}>
                <div style={{height:120,background:gradCss(g),position:'relative'}}>
                  <button onClick={()=>upd(b=>({gradients:b.gradients.filter(x=>x.id!==g.id)}))} style={{position:'absolute',top:7,right:7,width:24,height:24,borderRadius:'50%',background:'rgba(0,0,0,0.45)',border:'none',color:'#fff',cursor:'pointer',fontSize:13}}>×</button>
                </div>
                <div style={{background:T.card,padding:'11px 14px'}}>
                  <div style={{fontWeight:700,color:T.tx,fontSize:13,marginBottom:3}}>{g.name}</div>
                  <div style={{color:T.txF,fontSize:10,fontFamily:'monospace'}}>{g.type==='linear'?`${g.angle}°`:'radial'} · {g.stops.map(s=>s.hex).join(' → ')}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function TypographySection({brand, upd}) {
  const [nf, setNf] = useState({name:'',family:'',importUrl:'',role:'heading',weight:'700'});
  const pc = brand.colors.find(c=>c.role==='primary')?.hex||T.acc;
  return (
    <div style={{padding:36,display:'grid',gap:24}}>
      {brand.fonts.filter(f=>f.importUrl).map(f => <style key={f.id}>{`@import url('${f.importUrl}');`}</style>)}
      <Card>
        <h3 style={{margin:'0 0 18px',color:T.tx,fontSize:14,fontWeight:700}}>Betűtípus Hozzáadása</h3>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:13}}>
          <div><Lbl c="NÉV"/><Inp value={nf.name} onChange={v=>setNf(f=>({...f,name:v}))} placeholder="pl. Bebas Neue"/></div>
          <div><Lbl c="CSS FAMILY"/><Inp value={nf.family} onChange={v=>setNf(f=>({...f,family:v}))} placeholder="'Bebas Neue', sans-serif"/></div>
          <div style={{gridColumn:'span 2'}}><Lbl c="GOOGLE FONTS URL (opcionális)"/><Inp value={nf.importUrl} onChange={v=>setNf(f=>({...f,importUrl:v}))} placeholder="https://fonts.googleapis.com/css2?family=..."/></div>
          <div><Lbl c="SZEREPKÖR"/><Sel value={nf.role} onChange={v=>setNf(f=>({...f,role:v}))}>{[['heading','Cím'],['body','Törzs'],['brand','Márkanév'],['label','Címke'],['display','Display']].map(([v,l])=><option key={v} value={v}>{l}</option>)}</Sel></div>
          <div><Lbl c="SÚLY"/><Sel value={nf.weight} onChange={v=>setNf(f=>({...f,weight:v}))}>{[['100','Thin'],['300','Light'],['400','Regular'],['600','SemiBold'],['700','Bold'],['800','ExtraBold'],['900','Black']].map(([v,l])=><option key={v} value={v}>{v} – {l}</option>)}</Sel></div>
        </div>
        <div style={{marginTop:14}}>
          <Btn onClick={() => { if(!nf.name||!nf.family) return; upd(b=>({fonts:[...b.fonts,{id:uid(),...nf}]})); setNf({name:'',family:'',importUrl:'',role:'heading',weight:'700'}); }}>Betűtípus Hozzáadása</Btn>
        </div>
      </Card>
      {brand.fonts.map(f => (
        <Card key={f.id}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:18}}>
            <div>
              <div style={{fontSize:10,fontWeight:700,color:T.txM,letterSpacing:'0.1em',textTransform:'uppercase',marginBottom:4}}>{f.role}</div>
              <div style={{fontSize:18,fontWeight:800,color:T.tx}}>{f.name}</div>
              <div style={{fontSize:11,color:T.txF,fontFamily:'monospace',marginTop:2}}>{f.family}</div>
            </div>
            <Btn onClick={()=>upd(b=>({fonts:b.fonts.filter(x=>x.id!==f.id)}))} v="danger" size="sm">Töröl</Btn>
          </div>
          <div style={{background:T.inp,borderRadius:13,padding:'24px 28px',border:`1px solid ${T.inpB}`,overflow:'hidden',position:'relative'}}>
            <div style={{position:'absolute',top:-10,right:-10,fontSize:220,fontFamily:f.family,fontWeight:f.weight,color:'rgba(255,255,255,0.02)',lineHeight:1,userSelect:'none'}}>Aa</div>
            <div style={{fontFamily:f.family,fontWeight:f.weight,fontSize:64,color:pc,lineHeight:1,marginBottom:8}}>{brand.name||'Márka'}</div>
            <div style={{fontFamily:f.family,fontWeight:f.weight,fontSize:36,color:T.tx,marginBottom:10}}>Szekció Fejléc</div>
            <div style={{fontFamily:f.family,fontWeight:'400',fontSize:15,color:T.txM,lineHeight:1.7}}>A betűtípus a márkaidentitás egyik legfontosabb eleme. Minden betű formája üzenetet közvetít.</div>
            <div style={{display:'flex',gap:8,marginTop:14,flexWrap:'wrap'}}>
              {[['64px','Display'],['40px','H1'],['28px','H2'],['18px','H3'],['15px','Body'],['11px','Label']].map(([sz,l]) => (
                <div key={l} style={{padding:'7px 12px',borderRadius:9,background:`${pc}15`,border:`1px solid ${pc}28`,textAlign:'center'}}>
                  <div style={{fontFamily:f.family,fontSize:sz,fontWeight:f.weight,color:T.tx,lineHeight:1}}>{l}</div>
                  <div style={{fontSize:9,color:T.txF,marginTop:3}}>{sz}</div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

function VoiceSection({brand, upd}) {
  const [trait, setTrait] = useState('');
  const [doS, setDoS] = useState('');
  const [dontS, setDontS] = useState('');
  const [ch, setCh] = useState({channel:'',tone:'',sample:''});
  const v = brand.voice;
  const updV = fn => upd(b => ({voice:{...b.voice,...fn(b.voice)}}));
  return (
    <div style={{padding:36,display:'grid',gap:20}}>
      <Card>
        <h3 style={{margin:'0 0 14px',color:T.tx,fontSize:14,fontWeight:700}}>Személyiségjegyek</h3>
        <div style={{display:'flex',gap:10,marginBottom:14}}>
          <Inp value={trait} onChange={setTrait} placeholder="pl. Innovatív, Barátságos..." style={{flex:1}}/>
          <Btn onClick={()=>{if(trait.trim()){updV(v=>({traits:[...v.traits,trait.trim()]}));setTrait('');}}} size="sm">Hozzáad</Btn>
        </div>
        <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
          {v.traits.map(tr => (
            <div key={tr} style={{display:'inline-flex',alignItems:'center',gap:7,padding:'6px 13px',borderRadius:22,background:`${T.acc}20`,border:`1px solid ${T.acc}40`,color:T.accL,fontSize:13,fontWeight:700}}>
              {tr}
              <button onClick={()=>updV(v=>({traits:v.traits.filter(x=>x!==tr)}))} style={{background:'none',border:'none',color:T.accL,cursor:'pointer',fontSize:14}}>×</button>
            </div>
          ))}
        </div>
      </Card>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20}}>
        <Card>
          <h3 style={{margin:'0 0 13px',color:'#22c55e',fontSize:14,fontWeight:700}}>Igen – csináld</h3>
          <div style={{display:'flex',gap:8,marginBottom:11}}>
            <Inp value={doS} onChange={setDoS} placeholder="Amit érdemes tenni..." style={{flex:1}}/>
            <Btn onClick={()=>{if(doS.trim()){updV(v=>({dos:[...v.dos,doS.trim()]}));setDoS('');}}} size="sm">+</Btn>
          </div>
          <div style={{display:'grid',gap:7}}>
            {v.dos.map((d,i) => (
              <div key={i} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'9px 12px',borderRadius:9,background:'#22c55e12',border:'1px solid #22c55e28',color:T.tx,fontSize:12}}>
                {d}
                <button onClick={()=>updV(v=>({dos:v.dos.filter((_,j)=>j!==i)}))} style={{background:'none',border:'none',color:T.txF,cursor:'pointer',fontSize:15}}>×</button>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <h3 style={{margin:'0 0 13px',color:'#ef4444',fontSize:14,fontWeight:700}}>Nem – kerüld</h3>
          <div style={{display:'flex',gap:8,marginBottom:11}}>
            <Inp value={dontS} onChange={setDontS} placeholder="Amit kerülni kell..." style={{flex:1}}/>
            <Btn onClick={()=>{if(dontS.trim()){updV(v=>({donts:[...v.donts,dontS.trim()]}));setDontS('');}}} size="sm">+</Btn>
          </div>
          <div style={{display:'grid',gap:7}}>
            {v.donts.map((d,i) => (
              <div key={i} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'9px 12px',borderRadius:9,background:'#ef444412',border:'1px solid #ef444428',color:T.tx,fontSize:12}}>
                {d}
                <button onClick={()=>updV(v=>({donts:v.donts.filter((_,j)=>j!==i)}))} style={{background:'none',border:'none',color:T.txF,cursor:'pointer',fontSize:15}}>×</button>
              </div>
            ))}
          </div>
        </Card>
      </div>
      <Card>
        <h3 style={{margin:'0 0 14px',color:T.tx,fontSize:14,fontWeight:700}}>Csatorna Hangnem</h3>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 2fr auto',gap:11,marginBottom:14,alignItems:'flex-end'}}>
          {[['CSATORNA','channel','pl. Instagram'],['HANGNEM','tone','pl. Laza'],['MINTA SZÖVEG','sample','Egy példa...']].map(([l,k,p]) => (
            <div key={k}><Lbl c={l}/><Inp value={ch[k]} onChange={v=>setCh(c=>({...c,[k]:v}))} placeholder={p}/></div>
          ))}
          <Btn onClick={()=>{if(ch.channel){updV(v=>({channelTones:[...v.channelTones,{id:uid(),...ch}]}));setCh({channel:'',tone:'',sample:''});}}}>Hozzáad</Btn>
        </div>
        {v.channelTones.length > 0 && (
          <table style={{width:'100%',borderCollapse:'collapse'}}>
            <thead>
              <tr>{['Csatorna','Hangnem','Minta Szöveg',''].map(h => <th key={h} style={{textAlign:'left',padding:'7px 10px',color:T.txM,fontSize:10,fontWeight:700,letterSpacing:'0.09em',textTransform:'uppercase',borderBottom:`1px solid ${T.cardB}`}}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {v.channelTones.map(ct => (
                <tr key={ct.id}>
                  <td style={{padding:'10px',color:T.tx,fontSize:12,fontWeight:700,borderBottom:`1px solid ${T.cardB}28`}}>{ct.channel}</td>
                  <td style={{padding:'10px',borderBottom:`1px solid ${T.cardB}28`}}><Badge color={T.acc}>{ct.tone}</Badge></td>
                  <td style={{padding:'10px',color:T.txM,fontSize:12,borderBottom:`1px solid ${T.cardB}28`}}>{ct.sample}</td>
                  <td style={{padding:'10px',borderBottom:`1px solid ${T.cardB}28`}}><Btn onClick={()=>updV(v=>({channelTones:v.channelTones.filter(c=>c.id!==ct.id)}))} v="danger" size="sm">×</Btn></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}

function MediaSection({brand, upd}) {
  const fileRef = useRef();
  const [mType, setMType] = useState('logo');
  const [mName, setMName] = useState('');
  const [busy, setBusy] = useState(false);
  const handleFile = e => {
    const file = e.target.files[0]; if(!file) return;
    if(file.size > 5*1024*1024) { alert('Max 5MB!'); return; }
    setBusy(true);
    const name = mName||file.name.replace(/\.[^.]+$/,'');
    const r = new FileReader();
    r.onload = ev => {
      const img = new Image();
      img.onload = () => {
        const c = document.createElement('canvas');
        const max = 900; let w=img.width, h=img.height;
        if(w>max||h>max){ if(w>h){h=Math.round(h*max/w);w=max;}else{w=Math.round(w*max/h);h=max;} }
        c.width=w; c.height=h; c.getContext('2d').drawImage(img,0,0,w,h);
        const data = c.toDataURL(file.type==='image/png'||file.name.endsWith('.svg')?'image/png':'image/jpeg',0.88);
        upd(b=>({media:[...b.media,{id:uid(),name,type:mType,data,created:Date.now()}]}));
        setMName(''); setBusy(false);
      };
      img.src = ev.target.result;
    };
    r.readAsDataURL(file); e.target.value='';
  };
  return (
    <div style={{padding:36,display:'grid',gap:20}}>
      <Card>
        <h3 style={{margin:'0 0 18px',color:T.tx,fontSize:14,fontWeight:700}}>Média Feltöltés</h3>
        <div style={{display:'grid',gridTemplateColumns:'2fr 1fr auto',gap:11,alignItems:'flex-end'}}>
          <div><Lbl c="MEGNEVEZÉS"/><Inp value={mName} onChange={setMName} placeholder="Média neve (opcionális)..."/></div>
          <div><Lbl c="TÍPUS"/><Sel value={mType} onChange={setMType}>{Object.entries(MEDIA_TYPES).map(([v,l])=><option key={v} value={v}>{l}</option>)}</Sel></div>
          <Btn onClick={()=>fileRef.current?.click()} disabled={busy}>{busy?'Feltöltés...':'Fájl Kiválaszt'}</Btn>
        </div>
        <input ref={fileRef} type="file" accept="image/*,.svg" onChange={handleFile} style={{display:'none'}}/>
        <p style={{color:T.txF,fontSize:11,margin:'9px 0 0'}}>PNG · JPG · SVG · WEBP · max 5MB · automatikus tömörítés</p>
      </Card>
      {brand.media.length > 0 && (
        <div>
          <h3 style={{margin:'0 0 13px',color:T.tx,fontSize:14,fontWeight:700}}>Média Könyvtár · {brand.media.length} elem</h3>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(185px,1fr))',gap:13}}>
            {brand.media.map(m => (
              <div key={m.id} style={{borderRadius:15,overflow:'hidden',border:`2px solid ${brand.logo?.id===m.id?T.acc:T.cardB}`,background:T.card}}>
                <div style={{height:135,background:'#ffffff09',display:'flex',alignItems:'center',justifyContent:'center',padding:12}}>
                  <img src={m.data} alt={m.name} style={{maxWidth:'100%',maxHeight:'100%',objectFit:'contain'}}/>
                </div>
                <div style={{padding:'10px 12px'}}>
                  <div style={{fontWeight:700,color:T.tx,fontSize:11,marginBottom:7,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{m.name}</div>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:4}}>
                    <Badge color={MEDIA_COLORS[m.type]||T.txM}>{MEDIA_TYPES[m.type]||m.type}</Badge>
                    <div style={{display:'flex',gap:5}}>
                      {m.type==='logo' && (
                        <button onClick={()=>upd(()=>({logo:brand.logo?.id===m.id?null:m}))} style={{padding:'3px 8px',borderRadius:6,fontSize:10,fontWeight:700,cursor:'pointer',background:brand.logo?.id===m.id?`${T.acc}30`:'transparent',border:`1px solid ${brand.logo?.id===m.id?T.acc:T.cardB}`,color:brand.logo?.id===m.id?T.accL:T.txM}}>
                          {brand.logo?.id===m.id?'Fő Logo':'Fő Logo?'}
                        </button>
                      )}
                      <button onClick={()=>upd(b=>({media:b.media.filter(x=>x.id!==m.id)}))} style={{width:24,height:24,borderRadius:7,background:'#ef444420',border:'1px solid #ef444440',color:'#ef4444',cursor:'pointer',fontSize:12}}>×</button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ChartsSection({brand, upd}) {
  const cc = brand.chartColors||{};
  return (
    <div style={{padding:36,display:'grid',gap:20}}>
      <Card>
        <h3 style={{margin:'0 0 18px',color:T.tx,fontSize:14,fontWeight:700}}>Diagram Paletta</h3>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))',gap:12}}>
          {[['primary','Elsődleges adatsor'],['secondary','Másodlagos adatsor'],['tertiary','Harmadlagos adatsor'],['bg','Háttér / Rács'],['text','Tengelyek szöveg']].map(([k,l]) => (
            <div key={k} style={{display:'flex',alignItems:'center',gap:11,padding:'12px 14px',background:T.inp,borderRadius:11,border:`1px solid ${T.inpB}`}}>
              <input type="color" value={cc[k]||'#6366f1'} onChange={e=>upd(()=>({chartColors:{...cc,[k]:e.target.value}}))} style={{width:42,height:42,border:'none',background:'none',cursor:'pointer',borderRadius:9}}/>
              <div>
                <div style={{color:T.tx,fontSize:12,fontWeight:700}}>{l}</div>
                <div style={{color:T.txF,fontSize:10,fontFamily:'monospace',marginTop:2}}>{cc[k]||'nincs'}</div>
              </div>
            </div>
          ))}
        </div>
      </Card>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:18}}>
        <Card>
          <h3 style={{margin:'0 0 14px',color:T.tx,fontSize:13,fontWeight:700}}>Oszlopdiagram</h3>
          <div style={{padding:14,background:cc.bg||'#1e2035',borderRadius:10}}>
            <div style={{display:'flex',gap:8,alignItems:'flex-end',height:110}}>
              {[65,88,42,100,72,55,80].map((h,i) => (
                <div key={i} style={{flex:1,height:`${h}%`,borderRadius:'4px 4px 0 0',background:i%3===0?cc.primary||T.acc:i%3===1?cc.secondary||'#8b5cf6':cc.tertiary||'#14b8a6',minWidth:0}}/>
              ))}
            </div>
          </div>
        </Card>
        <Card>
          <h3 style={{margin:'0 0 14px',color:T.tx,fontSize:13,fontWeight:700}}>Kördiagram</h3>
          <div style={{padding:14,background:cc.bg||'#1e2035',borderRadius:10,display:'flex',alignItems:'center',gap:14}}>
            <div style={{width:90,height:90,borderRadius:'50%',flexShrink:0,background:`conic-gradient(${cc.primary||T.acc} 0% 45%,${cc.secondary||'#8b5cf6'} 45% 70%,${cc.tertiary||'#14b8a6'} 70% 100%)`}}/>
            <div style={{display:'grid',gap:6}}>
              {[['A',45,'primary'],['B',25,'secondary'],['C',30,'tertiary']].map(([l,p,k]) => (
                <div key={l} style={{display:'flex',alignItems:'center',gap:6}}>
                  <div style={{width:11,height:11,borderRadius:3,background:cc[k]||T.acc}}/>
                  <span style={{fontSize:11,color:cc.text||T.txM}}>{l} · {p}%</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
      <Card>
        <h3 style={{margin:'0 0 13px',color:T.tx,fontSize:14,fontWeight:700}}>Diagram Irányelvek</h3>
        <TA value={brand.chartNotes||''} onChange={v=>upd(()=>({chartNotes:v}))} placeholder="Mikor melyik diagram típust használjuk?..." rows={5}/>
      </Card>
    </div>
  );
}

function ShowcaseSection({brand}) {
  const pc = brand.colors.find(c=>c.role==='primary')?.hex||'#6366f1';
  const ac = brand.colors.find(c=>c.role==='accent')?.hex||'#8b5cf6';
  const bgc = brand.colors.find(c=>c.role==='background')?.hex||'#07080f';
  const hf = brand.fonts.find(f=>f.role==='heading')||brand.fonts.find(f=>f.role==='display')||brand.fonts[0];
  const bf = brand.fonts.find(f=>f.role==='body')||brand.fonts[0];
  const fg = brand.gradients[0];
  const heroStyle = fg ? {background:gradCss(fg)} : {background:`linear-gradient(135deg,${pc}ee 0%,${ac}99 60%,${bgc} 100%)`};

  return (
    <div>
      {brand.fonts.filter(f=>f.importUrl).map(f => <style key={f.id}>{`@import url('${f.importUrl}');`}</style>)}
      <div style={{...heroStyle,padding:'72px 56px',position:'relative',overflow:'hidden',minHeight:300,display:'flex',flexDirection:'column',justifyContent:'flex-end'}}>
        <div style={{position:'absolute',top:-100,right:-100,width:450,height:450,borderRadius:'50%',background:'rgba(255,255,255,0.03)'}}/>
        <div style={{position:'absolute',bottom:-60,left:60,width:300,height:300,borderRadius:'50%',background:'rgba(255,255,255,0.04)'}}/>
        <div style={{position:'absolute',top:20,left:56,fontSize:10,fontWeight:700,letterSpacing:'0.2em',color:'rgba(255,255,255,0.35)',textTransform:'uppercase'}}>Brand Identity</div>
        {brand.logo && <img src={brand.logo.data} alt={brand.name} style={{height:52,objectFit:'contain',alignSelf:'flex-start',marginBottom:22,filter:'brightness(0) invert(1)'}}/>}
        <div style={{fontFamily:hf?.family||'inherit',fontWeight:hf?.weight||'800',fontSize:'clamp(36px,6vw,84px)',color:'#fff',lineHeight:1,textShadow:'0 4px 24px rgba(0,0,0,0.5)',letterSpacing:'1px',marginBottom:10}}>
          {brand.name||'Márkád Neve'}
        </div>
        {brand.tagline && <div style={{fontFamily:bf?.family||'inherit',fontSize:18,color:'rgba(255,255,255,0.78)',fontStyle:'italic',maxWidth:580,lineHeight:1.5,marginBottom:22}}>{brand.tagline}</div>}
        {brand.voice.traits.length > 0 && (
          <div style={{display:'flex',gap:9,flexWrap:'wrap'}}>
            {brand.voice.traits.slice(0,6).map(tr => (
              <span key={tr} style={{padding:'6px 15px',borderRadius:28,background:'rgba(255,255,255,0.14)',backdropFilter:'blur(12px)',color:'#fff',fontSize:11,fontWeight:700,border:'1px solid rgba(255,255,255,0.22)'}}>{tr}</span>
            ))}
          </div>
        )}
      </div>
      <div style={{padding:'44px 44px',display:'grid',gap:44,background:T.appBg}}>
        {brand.colors.length > 0 && (
          <div>
            <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:8}}>
              <span style={{width:5,height:26,background:T.accG,borderRadius:3,display:'inline-block',flexShrink:0}}/>
              <h2 style={{margin:0,fontSize:20,fontWeight:800,color:T.tx}}>Szín Paletta</h2>
            </div>
            <p style={{color:T.txM,fontSize:13,margin:'0 0 20px'}}>{brand.colors.length} meghatározott szín</p>
            <div style={{display:'flex',height:80,borderRadius:18,overflow:'hidden',boxShadow:'0 12px 40px rgba(0,0,0,0.6)',marginBottom:20}}>
              {brand.colors.map(c => (
                <div key={c.id} style={{flex:1,background:c.hex,display:'flex',alignItems:'flex-end',justifyContent:'center',padding:7,minWidth:0}} title={`${c.name} · ${c.hex}`}>
                  <span style={{fontSize:9,fontWeight:800,color:textOn(c.hex),writingMode:'vertical-rl',whiteSpace:'nowrap',opacity:0.85}}>{c.name}</span>
                </div>
              ))}
            </div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(148px,1fr))',gap:11}}>
              {brand.colors.map(c => (
                <div key={c.id} style={{borderRadius:16,overflow:'hidden',boxShadow:`0 8px 22px ${c.hex}32`,border:`1px solid ${c.hex}38`}}>
                  <div style={{height:95,background:c.hex,display:'flex',alignItems:'center',justifyContent:'center'}}>
                    <span style={{fontFamily:'monospace',fontSize:11,fontWeight:800,color:textOn(c.hex),background:'rgba(0,0,0,0.22)',padding:'3px 8px',borderRadius:5,letterSpacing:'0.04em'}}>{c.hex.toUpperCase()}</span>
                  </div>
                  <div style={{padding:'11px 13px',background:'rgba(0,0,0,0.45)',backdropFilter:'blur(20px)'}}>
                    <div style={{fontWeight:700,color:'#fff',fontSize:12}}>{c.name}</div>
                    <div style={{fontSize:10,color:'rgba(255,255,255,0.45)',marginTop:2}}>{COLOR_ROLES.find(r=>r.v===c.role)?.l}</div>
                    {isHex(c.hex) && <div style={{fontSize:9,color:'rgba(255,255,255,0.3)',marginTop:4,fontFamily:'monospace'}}>RGB {Object.values(hexToRgb(c.hex)).join(' ')}</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {brand.gradients.length > 0 && (
          <div>
            <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:20}}>
              <span style={{width:5,height:26,background:T.accG,borderRadius:3,display:'inline-block',flexShrink:0}}/>
              <h2 style={{margin:0,fontSize:20,fontWeight:800,color:T.tx}}>Gradiens Galéria</h2>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(240px,1fr))',gap:14}}>
              {brand.gradients.map(g => (
                <div key={g.id} style={{borderRadius:20,overflow:'hidden',boxShadow:'0 10px 36px rgba(0,0,0,0.55)'}}>
                  <div style={{height:190,background:gradCss(g)}}/>
                  <div style={{padding:'13px 16px',background:'rgba(0,0,0,0.75)',backdropFilter:'blur(24px)',borderTop:'1px solid rgba(255,255,255,0.07)'}}>
                    <div style={{fontWeight:700,color:'#fff',fontSize:13,marginBottom:3}}>{g.name}</div>
                    <div style={{color:'rgba(255,255,255,0.38)',fontSize:10,fontFamily:'monospace'}}>{g.stops.map(s=>s.hex).join(' → ')}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {brand.fonts.length > 0 && (
          <div>
            <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:20}}>
              <span style={{width:5,height:26,background:T.accG,borderRadius:3,display:'inline-block',flexShrink:0}}/>
              <h2 style={{margin:0,fontSize:20,fontWeight:800,color:T.tx}}>Tipográfia</h2>
            </div>
            {brand.fonts.map(f => (
              <div key={f.id} style={{borderRadius:20,padding:'36px 40px',marginBottom:14,background:`linear-gradient(135deg,${bgc}ee,${pc}15)`,border:`1px solid ${pc}28`,overflow:'hidden',position:'relative'}}>
                <div style={{position:'absolute',top:-15,right:-5,fontSize:240,fontFamily:f.family,fontWeight:f.weight,color:'rgba(255,255,255,0.015)',lineHeight:1,userSelect:'none'}}>Aa</div>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:22}}>
                  <div>
                    <div style={{fontSize:10,fontWeight:700,color:T.txM,letterSpacing:'0.1em',textTransform:'uppercase',marginBottom:5}}>{f.role}</div>
                    <div style={{fontSize:22,fontWeight:800,color:T.tx}}>{f.name}</div>
                    <div style={{fontSize:11,color:T.txF,fontFamily:'monospace',marginTop:3}}>{f.family}</div>
                  </div>
                  <Badge color={pc}>weight {f.weight}</Badge>
                </div>
                <div style={{fontFamily:f.family,fontWeight:f.weight,fontSize:68,color:pc,lineHeight:1,marginBottom:10,letterSpacing:'1px'}}>Aa Bb Cc</div>
                <div style={{fontFamily:f.family,fontWeight:f.weight,fontSize:38,color:T.tx,lineHeight:1.2,marginBottom:9}}>{brand.name||'Márka Neve'}</div>
                <div style={{fontFamily:f.family,fontWeight:'400',fontSize:16,color:T.txM,lineHeight:1.7,maxWidth:580}}>Az elegáns tipográfia a márka hangjának vizuális megnyilvánulása. Minden betű forma, súly és ritmus — mind együttesen alkotja azt az atmoszférát, amelyet a márkád sugároz a világnak.</div>
              </div>
            ))}
          </div>
        )}
        <div>
          <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:20}}>
            <span style={{width:5,height:26,background:T.accG,borderRadius:3,display:'inline-block',flexShrink:0}}/>
            <h2 style={{margin:0,fontSize:20,fontWeight:800,color:T.tx}}>Márka Kollaterális</h2>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:22}}>
            <Card style={{padding:28}}>
              <div style={{fontSize:10,fontWeight:700,color:T.txM,letterSpacing:'0.12em',textTransform:'uppercase',marginBottom:18}}>Névjegykártya</div>
              <div style={{display:'flex',flexDirection:'column',gap:13,alignItems:'center'}}>
                <div style={{width:'100%',maxWidth:340,height:185,borderRadius:14,background:fg?gradCss(fg):`linear-gradient(135deg,${pc},${ac})`,padding:'22px 26px',display:'flex',flexDirection:'column',justifyContent:'space-between',boxShadow:'0 20px 55px rgba(0,0,0,0.65)',position:'relative',overflow:'hidden'}}>
                  <div style={{position:'absolute',bottom:-35,right:-35,width:170,height:170,borderRadius:'50%',background:'rgba(255,255,255,0.07)'}}/>
                  {brand.logo ? <img src={brand.logo.data} alt="" style={{height:26,objectFit:'contain',alignSelf:'flex-start',filter:'brightness(0) invert(1)'}}/> : <div style={{width:30,height:30,borderRadius:9,background:'rgba(255,255,255,0.2)'}}/>}
                  <div>
                    <div style={{fontFamily:hf?.family||'inherit',fontWeight:hf?.weight||'700',fontSize:21,color:'#fff',letterSpacing:'0.5px',marginBottom:3}}>{brand.name||'Márka Neve'}</div>
                    {brand.tagline && <div style={{fontSize:10,color:'rgba(255,255,255,0.68)'}}>{brand.tagline}</div>}
                  </div>
                </div>
                <div style={{width:'100%',maxWidth:340,height:185,borderRadius:14,background:bgc||'#0d0e1c',padding:'22px 26px',display:'flex',flexDirection:'column',justifyContent:'center',boxShadow:'0 20px 55px rgba(0,0,0,0.65)',border:`1px solid ${pc}40`}}>
                  <div style={{width:4,height:34,background:`linear-gradient(${pc},${ac})`,borderRadius:2,marginBottom:14}}/>
                  <div style={{fontWeight:700,color:'#fff',fontSize:14,marginBottom:5}}>{brand.name||'Kapcsolat'}</div>
                  {brand.website && <div style={{fontSize:11,color:T.txM,marginBottom:8}}>{brand.website}</div>}
                  {brand.industry && <Badge color={pc}>{brand.industry}</Badge>}
                </div>
              </div>
            </Card>
            <Card style={{padding:28}}>
              <div style={{fontSize:10,fontWeight:700,color:T.txM,letterSpacing:'0.12em',textTransform:'uppercase',marginBottom:18}}>Social Media Post</div>
              <div style={{display:'flex',justifyContent:'center'}}>
                <div style={{width:290,height:290,borderRadius:18,overflow:'hidden',background:fg?gradCss(fg):`linear-gradient(135deg,${pc},${ac})`,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:28,textAlign:'center',boxShadow:'0 20px 55px rgba(0,0,0,0.65)',position:'relative'}}>
                  <div style={{position:'absolute',inset:0,background:'rgba(0,0,0,0.18)'}}/>
                  <div style={{position:'relative',zIndex:1}}>
                    {brand.logo && <img src={brand.logo.data} alt="" style={{height:40,objectFit:'contain',marginBottom:14,filter:'brightness(0) invert(1)'}}/>}
                    <div style={{fontFamily:hf?.family||'inherit',fontWeight:hf?.weight||'700',fontSize:26,color:'#fff',lineHeight:1.2,marginBottom:11,textShadow:'0 2px 10px rgba(0,0,0,0.4)'}}>{brand.name||'Márkád Neve'}</div>
                    {brand.tagline && <div style={{fontSize:12,color:'rgba(255,255,255,0.78)',lineHeight:1.5,marginBottom:14}}>{brand.tagline}</div>}
                    {brand.website && <div style={{padding:'5px 13px',borderRadius:18,background:'rgba(255,255,255,0.18)',backdropFilter:'blur(10px)',fontSize:10,color:'#fff',fontWeight:700}}>{brand.website}</div>}
                  </div>
                </div>
              </div>
            </Card>
            <Card style={{padding:28,gridColumn:'span 2'}}>
              <div style={{fontSize:10,fontWeight:700,color:T.txM,letterSpacing:'0.12em',textTransform:'uppercase',marginBottom:18}}>Levélpapír</div>
              <div style={{background:'#fff',borderRadius:14,overflow:'hidden',boxShadow:'0 20px 55px rgba(0,0,0,0.55)',maxWidth:680,margin:'0 auto'}}>
                <div style={{background:fg?gradCss(fg):`linear-gradient(135deg,${pc},${ac})`,padding:'18px 34px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                  {brand.logo ? <img src={brand.logo.data} alt="" style={{height:30,objectFit:'contain',filter:'brightness(0) invert(1)'}}/> : <div style={{fontFamily:hf?.family||'inherit',fontWeight:hf?.weight||'700',fontSize:20,color:'#fff',letterSpacing:'0.5px'}}>{brand.name||'Márka'}</div>}
                  <div style={{textAlign:'right'}}>
                    {brand.website && <div style={{fontSize:11,color:'rgba(255,255,255,0.78)'}}>{brand.website}</div>}
                    {brand.industry && <div style={{fontSize:10,color:'rgba(255,255,255,0.55)',marginTop:2}}>{brand.industry}</div>}
                  </div>
                </div>
                <div style={{padding:'28px 34px',background:'#fff'}}>
                  {[['55%','14px'],['88%','9px'],['82%','9px'],['68%','9px'],['0','20px'],['92%','9px'],['79%','9px'],['0','10px'],['85%','9px'],['60%','9px']].map(([w,h],i) => (
                    <div key={i} style={{height:h,background:'#f1f5f9',borderRadius:4,marginBottom:10,width:w}}/>
                  ))}
                </div>
                <div style={{padding:'13px 34px',borderTop:`4px solid ${pc}`,background:'#f8fafc',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                  <div style={{fontSize:10,color:'#94a3b8'}}>{brand.name}</div>
                  {brand.industry && <div style={{fontSize:10,color:'#94a3b8'}}>{brand.industry}</div>}
                  {brand.website && <div style={{fontSize:10,color:pc,fontWeight:700}}>{brand.website}</div>}
                </div>
              </div>
            </Card>
            <Card style={{padding:28}}>
              <div style={{fontSize:10,fontWeight:700,color:T.txM,letterSpacing:'0.12em',textTransform:'uppercase',marginBottom:18}}>App Ikon</div>
              <div style={{display:'flex',gap:20,alignItems:'center',justifyContent:'center',flexWrap:'wrap'}}>
                {[108,72,54,38].map(sz => (
                  <div key={sz} style={{width:sz,height:sz,borderRadius:sz*0.23,background:fg?gradCss(fg):`linear-gradient(135deg,${pc},${ac})`,display:'flex',alignItems:'center',justifyContent:'center',boxShadow:`0 ${Math.round(sz*0.14)}px ${Math.round(sz*0.45)}px ${pc}55`,flexShrink:0}}>
                    {brand.logo ? <img src={brand.logo.data} alt="" style={{width:'60%',height:'60%',objectFit:'contain',filter:'brightness(0) invert(1)'}}/> : <div style={{fontSize:sz*0.38,fontFamily:hf?.family||'inherit',fontWeight:'900',color:'#fff'}}>{(brand.name||'A').charAt(0)}</div>}
                  </div>
                ))}
              </div>
              <p style={{textAlign:'center',color:T.txF,fontSize:10,margin:'14px 0 0'}}>108px · 72px · 54px · 38px</p>
            </Card>
            <Card style={{padding:28}}>
              <div style={{fontSize:10,fontWeight:700,color:T.txM,letterSpacing:'0.12em',textTransform:'uppercase',marginBottom:18}}>Email Aláírás</div>
              <div style={{background:'#fff',borderRadius:11,padding:'18px 22px',boxShadow:'0 8px 28px rgba(0,0,0,0.35)'}}>
                <div style={{display:'flex',gap:13,alignItems:'center',marginBottom:11}}>
                  <div style={{width:46,height:46,borderRadius:13,background:fg?gradCss(fg):`linear-gradient(135deg,${pc},${ac})`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                    {brand.logo ? <img src={brand.logo.data} alt="" style={{width:'68%',height:'68%',objectFit:'contain',filter:'brightness(0) invert(1)'}}/> : <span style={{fontSize:18,fontFamily:hf?.family||'inherit',fontWeight:'900',color:'#fff'}}>{(brand.name||'A').charAt(0)}</span>}
                  </div>
                  <div>
                    <div style={{fontWeight:800,color:'#1e293b',fontSize:14}}>{brand.name||'Márka Neve'}</div>
                    {brand.tagline && <div style={{fontSize:10,color:'#64748b',marginTop:2}}>{brand.tagline}</div>}
                  </div>
                </div>
                <div style={{borderTop:`2px solid ${pc}`,paddingTop:10,display:'grid',gap:3}}>
                  {brand.website && <div style={{fontSize:10,color:pc,fontWeight:700}}>{brand.website}</div>}
                  {brand.industry && <div style={{fontSize:10,color:'#94a3b8'}}>{brand.industry}</div>}
                </div>
              </div>
            </Card>
          </div>
        </div>
        {brand.media.length > 0 && (
          <div>
            <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:20}}>
              <span style={{width:5,height:26,background:T.accG,borderRadius:3,display:'inline-block',flexShrink:0}}/>
              <h2 style={{margin:0,fontSize:20,fontWeight:800,color:T.tx}}>Média Galéria</h2>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(150px,1fr))',gap:11}}>
              {brand.media.map(m => (
                <div key={m.id} style={{borderRadius:14,overflow:'hidden',border:`1px solid ${T.cardB}`,background:T.card,aspectRatio:'1',display:'flex',alignItems:'center',justifyContent:'center',padding:14}}>
                  <img src={m.data} alt={m.name} style={{maxWidth:'100%',maxHeight:'100%',objectFit:'contain'}}/>
                </div>
              ))}
            </div>
          </div>
        )}
        {brand.colors.length >= 2 && (
          <div>
            <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:8}}>
              <span style={{width:5,height:26,background:T.accG,borderRadius:3,display:'inline-block',flexShrink:0}}/>
              <h2 style={{margin:0,fontSize:20,fontWeight:800,color:T.tx}}>Szín Kontraszt</h2>
            </div>
            <p style={{color:T.txM,fontSize:13,margin:'0 0 18px'}}>WCAG AA szabvány · minimum 4.5:1 szöveghez</p>
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(190px,1fr))',gap:11}}>
              {brand.colors.flatMap((c1,i) =>
                brand.colors.slice(i+1,i+4).map(c2 => {
                  if(!isHex(c1.hex)||!isHex(c2.hex)) return null;
                  const r = contrastRatio(c1.hex,c2.hex);
                  const pass = r >= 4.5;
                  return (
                    <div key={c1.id+c2.id} style={{borderRadius:13,overflow:'hidden',border:`1px solid ${T.cardB}`}}>
                      <div style={{height:68,background:c2.hex,display:'flex',alignItems:'center',justifyContent:'center'}}>
                        <span style={{fontWeight:700,fontSize:19,color:c1.hex}}>Szöveg Aa</span>
                      </div>
                      <div style={{background:T.card,padding:'9px 12px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                        <div style={{display:'flex',gap:4}}>
                          <div style={{width:13,height:13,borderRadius:3,background:c1.hex}}/>
                          <div style={{width:13,height:13,borderRadius:3,background:c2.hex}}/>
                        </div>
                        <div style={{display:'flex',alignItems:'center',gap:6}}>
                          <span style={{fontSize:11,color:T.txM}}>{r.toFixed(1)}:1</span>
                          <span style={{fontSize:10,fontWeight:700,padding:'2px 6px',borderRadius:4,background:pass?'#22c55e22':'#ef444422',color:pass?'#22c55e':'#ef4444'}}>{pass?'AA':'Fail'}</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              ).filter(Boolean)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ExportSection({brand}) {
  const exportJson = () => {
    const blob = new Blob([JSON.stringify(brand,null,2)],{type:'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href=url; a.download=`${brand.name.replace(/\s+/g,'_')}_brand_kit.json`; a.click();
    URL.revokeObjectURL(url);
  };
  const copyColors = () => {
    const t = brand.colors.map(c=>`${c.name.padEnd(22)} ${c.hex.toUpperCase()}  RGB(${Object.values(hexToRgb(c.hex)).join(', ')})`).join('\n');
    navigator.clipboard.writeText(t).then(()=>alert('Másolva!'));
  };
  const copyGrads = () => {
    const t = brand.gradients.map(g=>`/* ${g.name} */\n${gradCss(g)}`).join('\n\n');
    navigator.clipboard.writeText(t).then(()=>alert('Másolva!'));
  };
  return (
    <div style={{padding:36,display:'grid',gap:20}}>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:14}}>
        {[
          {icon:'📄',t:'JSON Export',d:'Teljes arculati csomag JSON fájlban – visszaimportálható',btn:'Letöltés',fn:exportJson,v:'primary'},
          {icon:'🎨',t:'Színek CSS',d:'Összes szín neve, HEX és RGB kód vágólapra',btn:'Vágólapra',fn:copyColors,v:'secondary'},
          {icon:'🌈',t:'Gradiens CSS',d:'Gradiens CSS kódok vágólapra másolva',btn:'Vágólapra',fn:copyGrads,v:'secondary'},
        ].map(x => (
          <Card key={x.t} style={{textAlign:'center',padding:24}}>
            <div style={{fontSize:30,marginBottom:9}}>{x.icon}</div>
            <div style={{fontWeight:800,color:T.tx,fontSize:14,marginBottom:7}}>{x.t}</div>
            <div style={{color:T.txM,fontSize:12,lineHeight:1.6,marginBottom:16}}>{x.d}</div>
            <Btn onClick={x.fn} v={x.v}>{x.btn}</Btn>
          </Card>
        ))}
      </div>
      <Card>
        <h3 style={{margin:'0 0 14px',color:T.tx,fontSize:14,fontWeight:700}}>Szín Referencia Táblázat</h3>
        <table style={{width:'100%',borderCollapse:'collapse'}}>
          <thead>
            <tr>{['Előnézet','Szín Neve','HEX','RGB','Szerepkör'].map(h => <th key={h} style={{textAlign:'left',padding:'7px 10px',color:T.txM,fontSize:10,fontWeight:700,letterSpacing:'0.09em',textTransform:'uppercase',borderBottom:`1px solid ${T.cardB}`}}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {brand.colors.map(c => {
              const rgb = isHex(c.hex) ? hexToRgb(c.hex) : {r:0,g:0,b:0};
              return (
                <tr key={c.id}>
                  <td style={{padding:'9px 10px',borderBottom:`1px solid ${T.cardB}22`}}><div style={{width:32,height:32,borderRadius:9,background:c.hex,boxShadow:`0 4px 12px ${c.hex}50`}}/></td>
                  <td style={{padding:'9px 10px',color:T.tx,fontWeight:700,fontSize:12,borderBottom:`1px solid ${T.cardB}22`}}>{c.name}</td>
                  <td style={{padding:'9px 10px',fontFamily:'monospace',fontSize:12,color:c.hex,fontWeight:800,borderBottom:`1px solid ${T.cardB}22`}}>{c.hex.toUpperCase()}</td>
                  <td style={{padding:'9px 10px',fontFamily:'monospace',fontSize:11,color:T.txM,borderBottom:`1px solid ${T.cardB}22`}}>{rgb.r}, {rgb.g}, {rgb.b}</td>
                  <td style={{padding:'9px 10px',borderBottom:`1px solid ${T.cardB}22`}}><Badge color={T.acc}>{COLOR_ROLES.find(r=>r.v===c.role)?.l||c.role}</Badge></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
      {brand.gradients.length > 0 && (
        <Card>
          <h3 style={{margin:'0 0 14px',color:T.tx,fontSize:14,fontWeight:700}}>Gradiens CSS Referencia</h3>
          <div style={{display:'grid',gap:10}}>
            {brand.gradients.map(g => (
              <div key={g.id} style={{display:'flex',gap:14,alignItems:'center',padding:'11px 14px',background:T.inp,borderRadius:11,border:`1px solid ${T.inpB}`}}>
                <div style={{width:56,height:34,borderRadius:8,background:gradCss(g),flexShrink:0}}/>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontWeight:700,color:T.tx,fontSize:12,marginBottom:2}}>{g.name}</div>
                  <div style={{fontFamily:'monospace',fontSize:10,color:T.txF,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{gradCss(g)}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

// ── SIDEBAR ──────────────────────────────────────────

function Sidebar({brands, activeId, setActive, addBrand, delBrand, section, setSection, saving}) {
  const [showAdd, setShowAdd] = useState(false);
  const [nm, setNm] = useState('');
  const nav = [
    {id:'overview',i:'⚡',l:'Áttekintés'},
    {id:'colors',i:'🎨',l:'Színek & Gradiensek'},
    {id:'typography',i:'✍️',l:'Tipográfia'},
    {id:'voice',i:'🗣️',l:'Márka Hang'},
    {id:'media',i:'🖼️',l:'Média'},
    {id:'charts',i:'📊',l:'Diagramok'},
    {id:'showcase',i:'✨',l:'Bemutató'},
    {id:'export',i:'📄',l:'Exportálás'},
  ];
  return (
    <aside style={{width:252,background:T.side,borderRight:`1px solid ${T.sideBorder}`,display:'flex',flexDirection:'column',height:'100vh',flexShrink:0}}>
      <div style={{padding:'20px 16px 17px',borderBottom:`1px solid ${T.sideBorder}`}}>
        <div style={{fontSize:18,fontWeight:900,background:T.accG,WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text',marginBottom:2}}>Brand Kit</div>
        <div style={{fontSize:11,color:T.txF}}>Arculati Csomag Manager</div>
      </div>
      <div style={{padding:'13px 10px 9px',borderBottom:`1px solid ${T.sideBorder}`}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'0 7px',marginBottom:7}}>
          <span style={{fontSize:9,fontWeight:700,color:T.txF,letterSpacing:'0.12em',textTransform:'uppercase'}}>Márkák</span>
          <button onClick={()=>setShowAdd(!showAdd)} style={{width:20,height:20,borderRadius:5,background:`${T.acc}30`,border:`1px solid ${T.acc}50`,color:T.accL,cursor:'pointer',fontSize:14,display:'flex',alignItems:'center',justifyContent:'center',lineHeight:1}}>+</button>
        </div>
        {showAdd && (
          <div style={{marginBottom:7,padding:'0 3px'}}>
            <div style={{display:'flex',gap:5}}>
              <input value={nm} onChange={e=>setNm(e.target.value)} placeholder="Márka neve..."
                onKeyDown={e=>e.key==='Enter'&&nm.trim()&&(addBrand(nm.trim()),setNm(''),setShowAdd(false))}
                style={{flex:1,background:T.inp,border:`1px solid ${T.acc}44`,borderRadius:7,padding:'6px 9px',color:T.tx,fontSize:11,outline:'none'}}/>
              <button onClick={()=>{if(nm.trim()){addBrand(nm.trim());setNm('');setShowAdd(false);}}} style={{padding:'6px 11px',borderRadius:7,background:T.accG,border:'none',color:'#fff',cursor:'pointer',fontSize:11,fontWeight:700}}>OK</button>
            </div>
          </div>
        )}
        <div style={{display:'grid',gap:2}}>
          {brands.map(b => (
            <div key={b.id} onClick={()=>setActive(b.id)} style={{display:'flex',alignItems:'center',gap:7,padding:'7px 9px',borderRadius:9,cursor:'pointer',background:activeId===b.id?`${T.acc}20`:'transparent',border:`1px solid ${activeId===b.id?T.acc+'44':'transparent'}`,transition:'all 0.15s'}}>
              <div style={{width:26,height:26,borderRadius:7,background:T.accG,display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:800,color:'#fff',flexShrink:0}}>{b.name.charAt(0).toUpperCase()}</div>
              <span style={{fontSize:12,fontWeight:activeId===b.id?700:400,color:activeId===b.id?T.accL:T.tx,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',flex:1}}>{b.name}</span>
              {brands.length > 1 && (
                <button onClick={e=>{e.stopPropagation();if(window.confirm('Törlöd ezt a márkát?'))delBrand(b.id);}} style={{background:'none',border:'none',color:T.txF,cursor:'pointer',fontSize:15,flexShrink:0,padding:'0 3px'}}>×</button>
              )}
            </div>
          ))}
        </div>
      </div>
      <nav style={{flex:1,overflow:'auto',padding:'9px 10px'}}>
        <div style={{display:'grid',gap:2}}>
          {nav.map(({id,i,l}) => (
            <button key={id} onClick={()=>setSection(id)} style={{display:'flex',alignItems:'center',gap:9,padding:'9px 11px',borderRadius:9,background:section===id?`${T.acc}20`:'transparent',border:`1px solid ${section===id?T.acc+'44':'transparent'}`,cursor:'pointer',textAlign:'left',width:'100%',transition:'all 0.15s'}}>
              <span style={{fontSize:14,width:19,textAlign:'center',flexShrink:0}}>{i}</span>
              <span style={{fontSize:12,fontWeight:section===id?700:400,color:section===id?T.accL:T.txM}}>{l}</span>
            </button>
          ))}
        </div>
      </nav>
      <div style={{padding:'10px 16px',borderTop:`1px solid ${T.sideBorder}`,display:'flex',alignItems:'center',gap:7}}>
        <div style={{width:7,height:7,borderRadius:'50%',background:saving?'#f59e0b':T.ok}}/>
        <span style={{fontSize:10,color:T.txF}}>{saving?'Mentés...':'Automatikusan mentve'}</span>
      </div>
    </aside>
  );
}

// ── MAIN ─────────────────────────────────────────────

const HEADS = {
  overview: {title:'Áttekintés',subtitle:'Márka alapadatok és összefoglaló',icon:'⚡'},
  colors: {title:'Színek & Gradiensek',subtitle:'Szín paletta és átmenet könyvtár',icon:'🎨'},
  typography: {title:'Tipográfia',subtitle:'Betűtípusok és szöveg hierarchia',icon:'✍️'},
  voice: {title:'Márka Hang',subtitle:'Kommunikációs stílus és személyiség',icon:'🗣️'},
  media: {title:'Média Könyvtár',subtitle:'Logók, képek és grafikai elemek',icon:'🖼️'},
  charts: {title:'Diagramok',subtitle:'Adatvizualizációs stílus és szabályok',icon:'📊'},
  showcase: {title:'Arculati Bemutató',subtitle:'Vizuális brand identity prezentáció',icon:'✨'},
  export: {title:'Exportálás',subtitle:'JSON, CSS és referencia táblázatok',icon:'📄'},
};

export default function App() {
  const [brands, setBrands] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [section, setSection] = useState('showcase');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const brand = brands.find(b => b.id === activeId) || null;

  // Betöltés localStorage-ból
  useEffect(() => {
    try {
      const raw = localStorage.getItem('bk-v2');
      if (raw) {
        const d = JSON.parse(raw);
        setBrands(d.brands || []);
        setActiveId(d.activeId);
        setSection(d.section || 'showcase');
      } else {
        const demo = makeDemoData();
        setBrands([demo]);
        setActiveId(demo.id);
      }
    } catch (e) {
      const demo = makeDemoData();
      setBrands([demo]);
      setActiveId(demo.id);
    }
    setLoading(false);
  }, []);

  // Mentés localStorage-ba
  const save = useCallback((nb, na, sec) => {
    setSaving(true);
    try {
      localStorage.setItem('bk-v2', JSON.stringify({ brands: nb, activeId: na, section: sec }));
    } catch (e) {}
    setTimeout(() => setSaving(false), 400);
  }, []);

  const upd = useCallback(fn => {
    setBrands(prev => {
      const next = prev.map(b => b.id === activeId ? {...b, ...fn(b)} : b);
      save(next, activeId, section);
      return next;
    });
  }, [activeId, section, save]);

  const addBrand = useCallback(name => {
    const b = newBrand(name);
    const next = [...brands, b];
    setBrands(next); setActiveId(b.id); save(next, b.id, section);
  }, [brands, section, save]);

  const delBrand = useCallback(id => {
    const next = brands.filter(b => b.id !== id);
    const na = next[0]?.id || null;
    setBrands(next); setActiveId(na); save(next, na, section);
  }, [brands, section, save]);

  const setActive = useCallback(id => {
    setActiveId(id); save(brands, id, section);
  }, [brands, section, save]);

  const changeSection = useCallback(s => {
    setSection(s); save(brands, activeId, s);
  }, [brands, activeId, save]);

  const renderSection = () => {
    if (!brand) return null;
    const p = {brand, upd};
    switch (section) {
      case 'overview':    return <OverviewSection {...p}/>;
      case 'colors':      return <ColorsSection {...p}/>;
      case 'typography':  return <TypographySection {...p}/>;
      case 'voice':       return <VoiceSection {...p}/>;
      case 'media':       return <MediaSection {...p}/>;
      case 'charts':      return <ChartsSection {...p}/>;
      case 'showcase':    return <ShowcaseSection brand={brand}/>;
      case 'export':      return <ExportSection brand={brand}/>;
      default:            return <OverviewSection {...p}/>;
    }
  };

  if (loading) {
    return (
      <div style={{height:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:T.appBg}}>
        <div style={{textAlign:'center',color:T.tx}}>
          <div style={{fontSize:44,marginBottom:14}}>✨</div>
          <div style={{fontSize:18,fontWeight:800}}>Brand Kit betöltés...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{display:'flex',height:'100vh',background:T.appBg,color:T.tx,fontFamily:'system-ui,-apple-system,sans-serif',overflow:'hidden'}}>
      <Sidebar brands={brands} activeId={activeId} setActive={setActive} addBrand={addBrand} delBrand={delBrand} section={section} setSection={changeSection} saving={saving}/>
      <main style={{flex:1,overflow:'auto',display:'flex',flexDirection:'column'}}>
        {!brand ? (
          <div style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',padding:40}}>
            <div style={{textAlign:'center',maxWidth:460}}>
              <div style={{width:76,height:76,borderRadius:22,margin:'0 auto 22px',background:T.accG,display:'flex',alignItems:'center',justifyContent:'center',fontSize:36,boxShadow:'0 14px 44px #6366f138'}}>✨</div>
              <h1 style={{fontSize:28,fontWeight:900,color:T.tx,margin:'0 0 11px'}}>Üdvözöl a Brand Kit</h1>
              <p style={{color:T.txM,lineHeight:1.7,margin:'0 0 28px',fontSize:14}}>Kezeld vállalkozásaid arculati csomagjait egy helyen.</p>
              <Btn onClick={()=>addBrand('Első Márkám')}>Első Márka Létrehozása</Btn>
            </div>
          </div>
        ) : (
          <>
            {section !== 'showcase' && <SHead {...HEADS[section]}/>}
            <div style={{flex:1,overflow:'auto'}}>{renderSection()}</div>
          </>
        )}
      </main>
    </div>
  );
}
