import { useState } from "react";

// ====== CONSTANTS ======
const REGIOES = ["São Paulo - Centro","São Paulo - Zona Norte","São Paulo - Zona Sul","São Paulo - Zona Leste","São Paulo - Zona Oeste","Guarulhos","Osasco","Santo André","São Bernardo do Campo","Campinas","Sorocaba","Ribeirão Preto","Santos","Barueri","Suzano"];
const UFS = ["AC","AL","AM","AP","BA","CE","DF","ES","GO","MA","MG","MS","MT","PA","PB","PE","PI","PR","RJ","RN","RO","RR","RS","SC","SE","SP","TO"];
const TIPOS = [{v:"fabricante",l:"Fabricante",i:"🏭"},{v:"importador",l:"Importador",i:"🚢"},{v:"revendedor",l:"Revendedor",i:"🏪"},{v:"lojista",l:"Lojista",i:"🏬"},{v:"ecommerce",l:"E-commerce",i:"🛒"},{v:"construtora",l:"Construtora",i:"🏗️"},{v:"arquiteto",l:"Escritório Arquitetura",i:"📐"},{v:"instalador",l:"Instalador/Técnico",i:"⚡"},{v:"atacadista",l:"Atacadista/Distribuidor",i:"📦"},{v:"prestador",l:"Prestador de Serviço",i:"🔧"}];
const SENS = [{k:"preco",l:"Preço",i:"💰",c:"#ef4444"},{k:"qualidade",l:"Qualidade",i:"⭐",c:"#f59e0b"},{k:"entrega",l:"Prazo Entrega",i:"🚚",c:"#3b82f6"},{k:"estoque",l:"Estoque",i:"📦",c:"#8b5cf6"},{k:"marca",l:"Marca",i:"🏷️",c:"#ec4899"},{k:"posvenda",l:"Pós-Venda",i:"🛡️",c:"#10b981"},{k:"custom",l:"Personalização",i:"🎨",c:"#f97316"},{k:"credito",l:"Crédito",i:"💳",c:"#6366f1"}];
const PIPELINE = [{k:"prospeccao",l:"Prospecção",c:"#94a3b8"},{k:"contato",l:"Contato Inicial",c:"#60a5fa"},{k:"apresentacao",l:"Apresentação",c:"#a78bfa"},{k:"proposta",l:"Proposta",c:"#fbbf24"},{k:"negociacao",l:"Negociação",c:"#f97316"},{k:"fechado",l:"Fechado ✓",c:"#22c55e"},{k:"perdido",l:"Perdido ✗",c:"#ef4444"}];
const GKEY = "AIzaSyCxS2Dn4QrIGpwAByyFnYZQ-uc1Xkvb2i0";
const ROLES = [{v:"admin",l:"Administrador",i:"👑"},{v:"vendedor",l:"Vendedor",i:"💼"},{v:"viewer",l:"Visualizador",i:"👁️"}];
const MODULES = [{k:"dashboard",l:"Dashboard"},{k:"clientes",l:"Clientes"},{k:"pipeline",l:"Pipeline"},{k:"busca",l:"Busca Externa"},{k:"swot",l:"SWOT"},{k:"estrategias",l:"Estratégias"},{k:"materiais",l:"Materiais"},{k:"produtos",l:"Produtos"},{k:"dicas",l:"Dicas"}];
const DEFAULT_PERMS = {admin:MODULES.map(m=>m.k), vendedor:["dashboard","clientes","pipeline","busca"], viewer:["dashboard","clientes"]};
const DEFAULT_USERS = [{id:"u1",nome:"Administrador",email:"admin@prospectahub.com",senha:btoa("admin123"),role:"admin",ativo:true,criadoEm:"2026-01-01"}];
const hashPw = s => btoa(s);
const checkPw = (input,stored) => btoa(input) === stored;
const LS = {
  get: (k,def) => { try { const v=localStorage.getItem("ph_"+k); return v?JSON.parse(v):def; } catch { return def; } },
  set: (k,v) => { try { localStorage.setItem("ph_"+k, JSON.stringify(v)); } catch {} }
};

const ds = ()=>({preco:3,qualidade:3,entrega:3,estoque:3,marca:3,posvenda:3,custom:3,credito:3});
const fd = d => d ? new Date(d+"T12:00:00").toLocaleDateString("pt-BR") : "—";
const topS = s => Object.entries(s).sort((a,b)=>b[1]-a[1]).slice(0,3).map(([k])=>SENS.find(x=>x.k===k));

// ====== GOOGLE PLACES ======
const gSearch = async (q,reg) => {
  const r = await fetch("https://places.googleapis.com/v1/places:searchText", {
    method:"POST", headers:{"Content-Type":"application/json","X-Goog-Api-Key":GKEY},
    body:JSON.stringify({textQuery:`${q} ${reg}`,maxResultCount:15})
  });
  if(!r.ok) throw new Error("Erro na API do Google Places");
  return r.json();
};
const detectRegiao = addr => {
  if(!addr) return "São Paulo - Centro";
  for(let r of REGIOES) if(addr.toLowerCase().includes(r.split(" - ")[0].toLowerCase())) return r;
  return "São Paulo - Centro";
};

// ====== SAMPLE DATA ======
const PROJECTS0 = [
  { id:"p1", nome:"Luminárias LED PowerPic", desc:"Prospecção para fabricante de luminárias LED residenciais e comerciais.", ramo:"LED / Iluminação", cor:"#4f46e5", icon:"💡", dt:"2026-01-15",
    clients:[
      {id:1,nome:"Shopee Logística LTDA",contato:"Diretora Comercial",email:"comercial@shopee.com.br",tel:"(11) 3322-9888",tipo:"ecommerce",regiao:"São Paulo - Centro",uf:"SP",remoto:true,status:"prospeccao",sens:{preco:4,qualidade:3,entrega:4,estoque:5,marca:3,posvenda:2,custom:1,credito:4},notas:"Marketplace B2B. Foco em volume.",ult:"2026-03-02",end:"Avenida Paulista, 1000 - São Paulo - SP"},
      {id:2,nome:"Cativare Importação LTDA",contato:"Compras",email:"compras@cativare.com.br",tel:"(11) 3322-5555",tipo:"importador",regiao:"Osasco",uf:"SP",remoto:false,status:"contato",sens:{preco:5,qualidade:3,entrega:3,estoque:4,marca:2,posvenda:2,custom:1,credito:3},notas:"Importa LED da Ásia. Objetivo: substituição.",ult:"2026-02-20",end:"R. do Carmo, 102 - Osasco - SP"},
      {id:3,nome:"Bim Distribuição SP",contato:"Gerente",email:"gerente@bimdistsp.com.br",tel:"(11) 3088-2200",tipo:"atacadista",regiao:"São Paulo - Zona Norte",uf:"SP",remoto:false,status:"apresentacao",sens:{preco:3,qualidade:4,entrega:4,estoque:4,marca:3,posvenda:3,custom:2,credito:3},notas:"Distribuidor. Abertos a parcerias.",ult:"2026-02-28",end:"Av. Guido Caloi, 1500 - São Paulo - SP"},
      {id:4,nome:"Telhanorte Construções",contato:"Procurador",email:"procurador@telhanorte.com.br",tel:"(11) 3555-2020",tipo:"construtora",regiao:"São Paulo - Zona Sul",uf:"SP",remoto:false,status:"proposta",sens:{preco:3,qualidade:5,entrega:5,estoque:3,marca:4,posvenda:5,custom:5,credito:3},notas:"Mega-construtora. Quer projeto + co-branding.",ult:"2026-02-15",end:"Av. Imirim, 2000 - São Paulo - SP"},
      {id:5,nome:"Atelier Arq. Dra. Carla Costa",contato:"Drª Carla Costa",email:"carla@ateliercarla.com.br",tel:"(11) 99999-8888",tipo:"arquiteto",regiao:"São Paulo - Zona Sul",uf:"SP",remoto:false,status:"negociacao",sens:{preco:2,qualidade:5,entrega:4,estoque:2,marca:5,posvenda:4,custom:5,credito:2},notas:"Projetos high-end. Sensível à qualidade e design.",ult:"2026-03-01",end:"Rua Oscar Freire, 300 - São Paulo - SP"}
    ]
  },
  { id:"p2", nome:"Aquários Ornamentais — SP", desc:"Mapeamento de empresas de aquários ornamentais em São Paulo.", ramo:"Aquários Ornamentais / Aquarismo", cor:"#0891b2", icon:"🐠", dt:"2026-03-08",
    clients:[
      {id:101,nome:"Eco Marine Aquários",contato:"Equipe Comercial",email:"contato@ecomarine.com.br",tel:"(11) 5051-3838",tipo:"fabricante",regiao:"São Paulo - Zona Sul",uf:"SP",remoto:false,status:"prospeccao",sens:{preco:2,qualidade:5,entrega:4,estoque:3,marca:5,posvenda:5,custom:5,credito:2},notas:"Fabrica aquários sob medida. +25 anos. Moema.",ult:"",end:"Al. Jurupis, 1937 - Moema, São Paulo - SP"},
      {id:102,nome:"Aquaterrário Fábrica",contato:"Vendas",email:"vendas@aquaterrario.com.br",tel:"(11) 4752-3552",tipo:"fabricante",regiao:"Suzano",uf:"SP",remoto:false,status:"prospeccao",sens:{preco:3,qualidade:4,entrega:4,estoque:4,marca:3,posvenda:4,custom:4,credito:3},notas:"Fábrica em Suzano.",ult:"",end:"R. Drº Tito Prates, 346 - Suzano - SP"},
      {id:103,nome:"Galeria Oceânica",contato:"Atendimento",email:"contato@galeriaoceanica.com.br",tel:"(11) 3223-0842",tipo:"lojista",regiao:"São Paulo - Centro",uf:"SP",remoto:false,status:"prospeccao",sens:{preco:3,qualidade:5,entrega:3,estoque:4,marca:4,posvenda:4,custom:3,credito:2},notas:"Desde 1996. Referência no centro de SP.",ult:"",end:"R. Marquês de Itú, 407 - Santa Cecília, SP"},
      {id:104,nome:"Aqualandia",contato:"Loja",email:"",tel:"(11) 2867-2391",tipo:"lojista",regiao:"São Paulo - Zona Norte",uf:"SP",remoto:false,status:"prospeccao",sens:{preco:4,qualidade:3,entrega:3,estoque:5,marca:2,posvenda:3,custom:2,credito:3},notas:"Zona Norte. Grande variedade.",ult:"",end:"R. Nova dos Portugueses, 349 - Imirim, SP"},
      {id:105,nome:"DreamFish Aquários",contato:"Atendimento",email:"",tel:"(11) 3079-1131",tipo:"lojista",regiao:"São Paulo - Zona Sul",uf:"SP",remoto:false,status:"prospeccao",sens:{preco:2,qualidade:5,entrega:3,estoque:3,marca:5,posvenda:4,custom:4,credito:2},notas:"Peixes de água salgada. Itaim Bibi.",ult:"",end:"R. Clodomiro Amazonas, 250 - Itaim Bibi, SP"},
      {id:106,nome:"Aquanimal",contato:"SAC",email:"contato@aquanimal.com.br",tel:"",tipo:"ecommerce",regiao:"São Paulo - Zona Oeste",uf:"SP",remoto:false,status:"prospeccao",sens:{preco:3,qualidade:4,entrega:5,estoque:5,marca:4,posvenda:5,custom:2,credito:3},notas:"Primeira loja online de aquarismo do Brasil.",ult:"",end:"São Paulo - SP (e-commerce)"},
      {id:107,nome:"Aquaricamp",contato:"Loja",email:"",tel:"",tipo:"lojista",regiao:"Campinas",uf:"SP",remoto:true,status:"prospeccao",sens:{preco:3,qualidade:4,entrega:3,estoque:4,marca:3,posvenda:3,custom:3,credito:3},notas:"Campinas.",ult:"",end:"Av. Esther M. Camargo, 221 - Campinas - SP"},
      {id:108,nome:"VPS Aquarismo",contato:"Loja",email:"",tel:"(16) 3931-4814",tipo:"lojista",regiao:"Ribeirão Preto",uf:"SP",remoto:true,status:"prospeccao",sens:{preco:3,qualidade:3,entrega:3,estoque:4,marca:2,posvenda:3,custom:2,credito:3},notas:"Ribeirão Preto.",ult:"",end:"Av. Primeiro de Maio, 112 - Ribeirão Preto - SP"}
    ]
  }
];

// ====== STYLES ======
const S = {
  card: {background:"white",borderRadius:12,padding:20,boxShadow:"0 1px 3px rgba(0,0,0,0.08)",border:"1px solid #f1f5f9"},
  btn: (active)=>({padding:"8px 16px",borderRadius:8,border:"1px solid #e2e8f0",fontSize:13,fontWeight:500,cursor:"pointer",background:active?"#4f46e5":"white",color:active?"white":"#475569"}),
  input: {padding:"8px 12px",borderRadius:6,border:"1px solid #e2e8f0",fontSize:14,boxSizing:"border-box",width:"100%"},
  label: {fontSize:12,fontWeight:500,color:"#64748b",display:"block",marginBottom:4},
  pill: (color)=>({background:color+"22",color:color,padding:"3px 12px",borderRadius:20,fontSize:11,fontWeight:600}),
};

// ====== LOGIN ======
function Login({onLogin}) {
  const [email,setEmail] = useState("admin@prospectahub.com");
  const [senha,setSenha] = useState("admin123");
  const [err,setErr] = useState("");
  const users = LS.get("users",DEFAULT_USERS);
  const handleLogin = () => {
    const u = users.find(x=>x.email===email);
    if(!u) { setErr("E-mail não encontrado"); return; }
    if(!u.ativo) { setErr("Usuário bloqueado"); return; }
    if(!checkPw(senha,u.senha)) { setErr("Senha incorreta"); return; }
    onLogin(u);
  };
  return (
    <div style={{minHeight:"100vh",background:"linear-gradient(135deg,#1e1b4b 0%,#312e81 50%,#4f46e5 100%)",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Inter',-apple-system,BlinkMacSystemFont,sans-serif"}}>
      <div style={{width:380,background:"white",borderRadius:16,padding:40,boxShadow:"0 10px 40px rgba(0,0,0,0.2)"}}>
        <div style={{textAlign:"center",marginBottom:32}}>
          <div style={{fontSize:48,marginBottom:12}}>⚡</div>
          <h1 style={{fontSize:24,fontWeight:700,color:"#1e293b",marginBottom:4}}>ProspectaHub</h1>
          <p style={{fontSize:13,color:"#64748b"}}>Sistema de Prospecção Inteligente</p>
        </div>
        <div style={{marginBottom:12}}><label style={S.label}>E-mail</label><input type="email" value={email} onChange={e=>setEmail(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleLogin()} placeholder="seu@email.com" style={S.input}/></div>
        <div style={{marginBottom:20}}><label style={S.label}>Senha</label><input type="password" value={senha} onChange={e=>setSenha(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleLogin()} placeholder="••••••••" style={S.input}/></div>
        {err&&<div style={{padding:"10px 12px",background:"#fef2f2",borderRadius:8,border:"1px solid #fecaca",marginBottom:16}}><div style={{fontSize:13,fontWeight:600,color:"#dc2626"}}>{err}</div></div>}
        <button onClick={handleLogin} style={{width:"100%",padding:"10px 0",borderRadius:8,background:"linear-gradient(135deg,#4f46e5,#7c3aed)",color:"white",border:"none",fontSize:14,fontWeight:600,cursor:"pointer",marginBottom:12}}>Acessar</button>
        <p style={{fontSize:11,color:"#94a3b8",textAlign:"center"}}>Demo: admin@prospectahub.com / admin123</p>
      </div>
    </div>
  );
}

// ====== SIDEBAR ======
function Sidebar({sec,setSec,projs,ap,setAp,user,onLogout,perms}) {
  const p = projs.find(x=>x.id===ap);
  const projSec = [{k:"dashboard",l:"Dashboard",i:"📊"},{k:"clientes",l:"Clientes",i:"👥"},{k:"pipeline",l:"Pipeline",i:"🔄"},{k:"busca",l:"Busca Externa",i:"🔍"},{k:"swot",l:"Análise SWOT",i:"🎯"},{k:"estrategias",l:"Estratégias",i:"📋"},{k:"materiais",l:"Materiais",i:"📁"},{k:"produtos",l:"Produtos",i:"💡"},{k:"dicas",l:"Dicas de Sucesso",i:"🏆"}];
  const canSee = s => s==="projetos"||s==="admin"||perms[user.role].includes(s);
  const item = (k,l,ic,active)=>(canSee(k)?
    <div key={k} onClick={()=>setSec(k)} style={{padding:"9px 14px",borderRadius:8,cursor:"pointer",marginBottom:1,display:"flex",alignItems:"center",gap:10,fontSize:13,fontWeight:500,background:active?"rgba(255,255,255,0.15)":"transparent",color:active?"#fff":"rgba(255,255,255,0.65)"}}>
      <span style={{fontSize:16}}>{ic}</span>{l}
    </div>:null);
  const initials = user.nome.split(" ").map(w=>w[0]).join("").toUpperCase().slice(0,2);
  return (
    <div style={{width:250,minHeight:"100vh",background:"linear-gradient(180deg,#1e1b4b,#312e81)",color:"white",flexShrink:0,position:"fixed",left:0,top:0,zIndex:100,boxShadow:"2px 0 20px rgba(0,0,0,0.3)",overflowY:"auto",display:"flex",flexDirection:"column"}}>
      <div style={{padding:"24px 20px 16px",borderBottom:"1px solid rgba(255,255,255,0.1)"}}>
        <div style={{fontSize:22,fontWeight:800}}>⚡ ProspectaHub</div>
        <div style={{fontSize:10,opacity:0.5,marginTop:4,textTransform:"uppercase",letterSpacing:"1.5px"}}>Prospecção Inteligente</div>
      </div>
      <div style={{flex:1,overflow:"auto"}}>
        <div style={{padding:"8px 8px 4px"}}>{item("projetos","Projetos","📂",sec==="projetos")}</div>
        {p && (<>
          <div style={{padding:"10px 16px 6px",borderTop:"1px solid rgba(255,255,255,0.08)",marginTop:4}}>
            <div style={{fontSize:10,textTransform:"uppercase",letterSpacing:"1.5px",opacity:0.4,marginBottom:6}}>Projeto Ativo</div>
            <div style={{display:"flex",alignItems:"center",gap:8,padding:"8px 10px",background:p.cor+"33",borderRadius:8,borderLeft:`3px solid ${p.cor}`}}>
              <span style={{fontSize:18}}>{p.icon}</span>
              <div style={{fontSize:12,fontWeight:600,lineHeight:1.3}}>{p.nome}</div>
            </div>
          </div>
          <div style={{padding:"6px 8px"}}>{projSec.map(s=>item(s.k,s.l,s.i,sec===s.k))}</div>
        </>)}
        {user.role==="admin"&&<div style={{padding:"8px 8px 4px"}}>{item("admin","Admin","⚙️",sec==="admin")}</div>}
      </div>
      <div style={{padding:"16px",borderTop:"1px solid rgba(255,255,255,0.1)"}}>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
          <div style={{width:32,height:32,borderRadius:"50%",background:user.role==="admin"?"#f59e0b":user.role==="vendedor"?"#3b82f6":"#10b981",display:"flex",alignItems:"center",justifyContent:"center",color:"white",fontSize:14,fontWeight:600}}>{initials}</div>
          <div style={{flex:1,fontSize:12}}>
            <div style={{fontWeight:600}}>{user.nome}</div>
            <div style={{fontSize:10,opacity:0.7,marginTop:2}}>{ROLES.find(r=>r.v===user.role)?.l}</div>
          </div>
        </div>
        <button onClick={onLogout} style={{width:"100%",padding:"6px 0",borderRadius:6,background:"rgba(255,255,255,0.1)",color:"white",border:"none",fontSize:12,fontWeight:500,cursor:"pointer"}}>Sair</button>
      </div>
    </div>
  );
}

// ====== ADMIN PANEL ======
function AdminPanel({users,setUsers,logs,setLogs,perms,setPerms}) {
  const [tab,setTab] = useState("usuarios");
  const [newUser,setNewUser] = useState({nome:"",email:"",senha:"",role:"vendedor"});
  const [editingId,setEditingId] = useState(null);
  const [filterUser,setFilterUser] = useState("");
  const updateUser = (id,data) => setUsers(users.map(u=>u.id===id?{...u,...data}:u));
  const deleteUser = id => { if(id!=="u1") setUsers(users.filter(u=>u.id!==id)); };
  const createUser = () => {
    if(!newUser.nome||!newUser.email||!newUser.senha) return;
    setUsers([...users,{id:"u"+Date.now(),nome:newUser.nome,email:newUser.email,senha:hashPw(newUser.senha),role:newUser.role,ativo:true,criadoEm:new Date().toISOString().split("T")[0]}]);
    setNewUser({nome:"",email:"",senha:"",role:"vendedor"});
  };
  const filteredLogs = filterUser?logs.filter(l=>l.usuario===filterUser):logs;
  return (
    <div>
      <h2 style={{fontSize:22,fontWeight:700,marginBottom:20,color:"#1e293b"}}>Administração</h2>
      <div style={{display:"flex",gap:8,marginBottom:20}}>
        {["usuarios","permissoes","logs"].map(t=><button key={t} onClick={()=>setTab(t)} style={{padding:"8px 16px",borderRadius:8,border:"2px solid",borderColor:tab===t?"#4f46e5":"#e2e8f0",background:tab===t?"#eef2ff":"white",color:tab===t?"#4f46e5":"#475569",fontSize:13,fontWeight:600,cursor:"pointer"}}>
          {t==="usuarios"?"👥 Usuários":t==="permissoes"?"🔐 Permissões":"📊 Logs"}
        </button>)}
      </div>
      {tab==="usuarios"&&(
        <div>
          <div style={{...S.card,marginBottom:20,padding:24}}>
            <h3 style={{fontSize:16,fontWeight:600,marginBottom:14}}>Criar Novo Usuário</h3>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
              <div><label style={S.label}>Nome</label><input value={newUser.nome} onChange={e=>setNewUser({...newUser,nome:e.target.value})} placeholder="Nome completo" style={S.input}/></div>
              <div><label style={S.label}>E-mail</label><input value={newUser.email} onChange={e=>setNewUser({...newUser,email:e.target.value})} placeholder="email@example.com" style={S.input}/></div>
              <div><label style={S.label}>Senha</label><input type="password" value={newUser.senha} onChange={e=>setNewUser({...newUser,senha:e.target.value})} placeholder="••••••••" style={S.input}/></div>
              <div><label style={S.label}>Função</label><select value={newUser.role} onChange={e=>setNewUser({...newUser,role:e.target.value})} style={S.input}>{ROLES.map(r=><option key={r.v} value={r.v}>{r.l}</option>)}</select></div>
            </div>
            <button onClick={createUser} style={{padding:"8px 16px",borderRadius:8,background:"#22c55e",color:"white",border:"none",fontSize:13,fontWeight:600,cursor:"pointer"}}>Criar Usuário</button>
          </div>
          <div>
            <h3 style={{fontSize:16,fontWeight:600,marginBottom:12}}>Lista de Usuários</h3>
            {users.map(u=>(
              <div key={u.id} style={{...S.card,padding:14,marginBottom:10,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div style={{flex:1}}>
                  <div style={{fontSize:14,fontWeight:600,color:"#1e293b"}}>{u.nome}</div>
                  <div style={{fontSize:12,color:"#64748b"}}>{u.email}</div>
                  <div style={{display:"flex",gap:6,marginTop:6}}>
                    <span style={{...S.pill("#f59e0b")}}>{ROLES.find(r=>r.v===u.role)?.i} {ROLES.find(r=>r.v===u.role)?.l}</span>
                    <span style={{...S.pill(u.ativo?"#22c55e":"#ef4444")}}>{u.ativo?"✓ Ativo":"✗ Bloqueado"}</span>
                  </div>
                </div>
                <div style={{display:"flex",gap:6}}>
                  {u.id!=="u1"&&<button onClick={()=>updateUser(u.id,{ativo:!u.ativo})} style={{padding:"6px 12px",borderRadius:6,border:"1px solid #e2e8f0",fontSize:12,fontWeight:500,cursor:"pointer"}}>{u.ativo?"Bloquear":"Ativar"}</button>}
                  {u.id!=="u1"&&<button onClick={()=>deleteUser(u.id)} style={{padding:"6px 12px",borderRadius:6,border:"1px solid #fecaca",background:"#fef2f2",color:"#dc2626",fontSize:12,fontWeight:500,cursor:"pointer"}}>Deletar</button>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {tab==="permissoes"&&(
        <div>
          <h3 style={{fontSize:16,fontWeight:600,marginBottom:14}}>Configurar Permissões por Função</h3>
          {ROLES.filter(r=>r.v!=="admin").map(r=>(
            <div key={r.v} style={{...S.card,padding:20,marginBottom:14}}>
              <h4 style={{fontSize:14,fontWeight:600,marginBottom:12}}>{r.i} {r.l}</h4>
              <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8}}>
                {MODULES.map(m=>(
                  <label key={m.k} style={{display:"flex",alignItems:"center",gap:6,cursor:"pointer"}}>
                    <input type="checkbox" checked={perms[r.v].includes(m.k)} onChange={e=>setPerms({...perms,[r.v]:e.target.checked?[...perms[r.v],m.k]:perms[r.v].filter(x=>x!==m.k)})} style={{cursor:"pointer"}}/>
                    <span style={{fontSize:13}}>{m.l}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
      {tab==="logs"&&(
        <div>
          <div style={{display:"flex",gap:12,marginBottom:16}}>
            <select value={filterUser} onChange={e=>setFilterUser(e.target.value)} style={{...S.input,flex:1,maxWidth:200}}>
              <option value="">Todos os usuários</option>
              {users.map(u=><option key={u.id} value={u.nome}>{u.nome}</option>)}
            </select>
            <button onClick={()=>setLogs([])} style={{padding:"8px 16px",borderRadius:8,background:"#ef4444",color:"white",border:"none",fontSize:13,fontWeight:600,cursor:"pointer"}}>Limpar Logs</button>
          </div>
          {filteredLogs.length===0?<div style={{padding:20,textAlign:"center",color:"#94a3b8"}}>Nenhum registro</div>:
          <div>
            {[...filteredLogs].reverse().map((l,i)=>(
              <div key={i} style={{...S.card,padding:12,marginBottom:8,display:"flex",gap:10,fontSize:12}}>
                <span style={{color:"#64748b",minWidth:140}}>{new Date(l.ts).toLocaleString("pt-BR")}</span>
                <span style={{fontWeight:600,color:"#1e293b",minWidth:120}}>{l.usuario}</span>
                <span style={{color:"#4f46e5",fontWeight:600,minWidth:100}}>{l.acao}</span>
                <span style={{color:"#64748b",flex:1}}>{l.detalhe}</span>
              </div>
            ))}
          </div>}
        </div>
      )}
    </div>
  );
}

// ====== PAGES ======
function Projetos({projs,setProjs,setAp,setSec,canEdit}) {
  const [show,setShow]=useState(false);
  const [np,setNp]=useState({nome:"",desc:"",ramo:"",cor:"#4f46e5",icon:"📁"});
  const icons=["📁","💡","🐠","🏠","🚗","👗","🍔","💻","🏥","🌱","🔧","📱","🎵","📚"];
  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
        <div><h2 style={{fontSize:22,fontWeight:700,color:"#1e293b",marginBottom:4}}>Projetos</h2><p style={{color:"#64748b",fontSize:14}}>Organize por ramo de atividade</p></div>
        {canEdit&&<button onClick={()=>setShow(!show)} style={{background:"linear-gradient(135deg,#4f46e5,#7c3aed)",color:"white",border:"none",padding:"10px 20px",borderRadius:8,fontSize:14,fontWeight:600,cursor:"pointer"}}>+ Novo Projeto</button>}
      </div>
      {show&&canEdit&&(
        <div style={{...S.card,padding:24,marginBottom:20,boxShadow:"0 4px 20px rgba(0,0,0,0.1)"}}>
          <h3 style={{fontSize:16,fontWeight:600,marginBottom:14}}>Criar Projeto</h3>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            <div><label style={S.label}>Nome *</label><input value={np.nome} onChange={e=>setNp({...np,nome:e.target.value})} placeholder="Ex: Aquários Ornamentais SP" style={S.input}/></div>
            <div><label style={S.label}>Ramo</label><input value={np.ramo} onChange={e=>setNp({...np,ramo:e.target.value})} placeholder="Ex: Aquarismo / Pet" style={S.input}/></div>
          </div>
          <div style={{marginTop:12}}><label style={S.label}>Descrição</label><textarea value={np.desc} onChange={e=>setNp({...np,desc:e.target.value})} rows={2} style={{...S.input,resize:"vertical"}}/></div>
          <div style={{marginTop:12,display:"flex",gap:20}}>
            <div><label style={S.label}>Ícone</label><div style={{display:"flex",gap:4,flexWrap:"wrap",maxWidth:220}}>{icons.map(ic=><div key={ic} onClick={()=>setNp({...np,icon:ic})} style={{width:34,height:34,display:"flex",alignItems:"center",justifyContent:"center",borderRadius:8,cursor:"pointer",fontSize:18,border:np.icon===ic?"2px solid #4f46e5":"1px solid #e2e8f0",background:np.icon===ic?"#eef2ff":"white"}}>{ic}</div>)}</div></div>
            <div><label style={S.label}>Cor</label><input type="color" value={np.cor} onChange={e=>setNp({...np,cor:e.target.value})} style={{width:50,height:34,border:"1px solid #e2e8f0",borderRadius:6,cursor:"pointer"}}/></div>
          </div>
          <div style={{display:"flex",gap:10,marginTop:14}}>
            <button onClick={()=>{if(!np.nome)return;setProjs([...projs,{...np,id:"p"+Date.now(),dt:new Date().toISOString().split("T")[0],clients:[]}]);setShow(false);setNp({nome:"",desc:"",ramo:"",cor:"#4f46e5",icon:"📁"});}} style={{padding:"10px 24px",borderRadius:8,background:np.nome?"#4f46e5":"#94a3b8",color:"white",border:"none",fontSize:14,fontWeight:600,cursor:np.nome?"pointer":"default"}}>Criar</button>
            <button onClick={()=>setShow(false)} style={{padding:"10px 24px",borderRadius:8,background:"#f1f5f9",color:"#475569",border:"none",fontSize:14,fontWeight:500,cursor:"pointer"}}>Cancelar</button>
          </div>
        </div>
      )}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
        {projs.map(p=>(
          <div key={p.id} onClick={()=>{setAp(p.id);setSec("dashboard");}} style={{...S.card,cursor:"pointer",borderTop:`4px solid ${p.cor}`,padding:24}}>
            <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:10}}>
              <div style={{width:48,height:48,borderRadius:12,background:p.cor+"18",display:"flex",alignItems:"center",justifyContent:"center",fontSize:26}}>{p.icon}</div>
              <div><div style={{fontSize:17,fontWeight:700,color:"#1e293b"}}>{p.nome}</div><div style={{fontSize:12,color:"#94a3b8"}}>{p.ramo}</div></div>
            </div>
            <p style={{fontSize:13,color:"#64748b",marginBottom:14,lineHeight:1.5}}>{p.desc}</p>
            <div style={{display:"flex",gap:16,fontSize:12,color:"#94a3b8"}}>
              <span>👥 <strong style={{color:"#334155"}}>{p.clients.length}</strong> clientes</span>
              <span>🔥 {p.clients.filter(c=>["proposta","negociacao"].includes(c.status)).length} em negociação</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Dashboard({cls,proj}) {
  const st = PIPELINE.map(p=>({s:p,c:cls.filter(x=>x.status===p.k).length}));
  const ts = topS(cls.reduce((a,c)=>Object.entries(c.sens).forEach(([k,v])=>a[k]=(a[k]||0)+v)||a,{}));
  return (
    <div>
      <h2 style={{fontSize:22,fontWeight:700,marginBottom:6,color:"#1e293b"}}>Dashboard</h2>
      <p style={{fontSize:14,color:"#64748b",marginBottom:20}}>Projeto: <strong>{proj.nome}</strong></p>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:24}}>
        {st.map(({s,c})=><div key={s.k} style={{...S.card,textAlign:"center",padding:14}}><div style={{fontSize:20,fontWeight:700,color:s.c}}>{c}</div><div style={{fontSize:11,color:"#64748b",marginTop:4}}>{s.l}</div></div>)}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
        <div style={{...S.card}}>
          <h3 style={{fontSize:15,fontWeight:600,marginBottom:12}}>Sensibilidades Agregadas</h3>
          {SENS.map(s=><div key={s.k} style={{display:"flex",alignItems:"center",gap:6,marginBottom:5}}><span style={{fontSize:13,width:18,textAlign:"center"}}>{s.i}</span><span style={{fontSize:11,width:90,color:"#475569"}}>{s.l}</span><div style={{flex:1,height:7,background:"#f1f5f9",borderRadius:4,overflow:"hidden"}}><div style={{width:`${(cls.reduce((a,c)=>a+c.sens[s.k],0)/cls.length||0)*20}%`,height:"100%",background:s.c,borderRadius:4}}/></div></div></div>)}
        </div>
        <div style={{...S.card}}>
          <h3 style={{fontSize:15,fontWeight:600,marginBottom:12}}>Top Sensibilidades</h3>
          {ts.map(s=>s?<div key={s.k} style={{display:"flex",alignItems:"center",gap:8,padding:"8px 0"}}><span style={{fontSize:18}}>{s.i}</span><div><div style={{fontSize:13,fontWeight:600,color:"#1e293b"}}>{s.l}</div><div style={{fontSize:11,color:"#94a3b8"}}>Alta incidência</div></div></div>:null)}
        </div>
      </div>
    </div>
  );
}

function Clientes({cls,setCls,setSec,setSel,canEdit}) {
  const [show,setShow]=useState(false);
  const [nc,setNc]=useState({nome:"",contato:"",email:"",tel:"",tipo:"lojista",regiao:"São Paulo - Centro",uf:"SP",remoto:false,status:"prospeccao",sens:ds(),notas:"",ult:"",end:""});
  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
        <div><h2 style={{fontSize:22,fontWeight:700,color:"#1e293b",marginBottom:4}}>Clientes</h2><p style={{color:"#64748b",fontSize:14}}>Total: <strong>{cls.length}</strong></p></div>
        {canEdit&&<button onClick={()=>setShow(!show)} style={{background:"linear-gradient(135deg,#4f46e5,#7c3aed)",color:"white",border:"none",padding:"10px 20px",borderRadius:8,fontSize:14,fontWeight:600,cursor:"pointer"}}>+ Novo</button>}
      </div>
      {show&&canEdit&&(
        <div style={{...S.card,padding:24,marginBottom:20}}>
          <h3 style={{fontSize:16,fontWeight:600,marginBottom:14}}>Novo Cliente</h3>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
            <div><label style={S.label}>Nome *</label><input value={nc.nome} onChange={e=>setNc({...nc,nome:e.target.value})} placeholder="Razão social ou nome" style={S.input}/></div>
            <div><label style={S.label}>Contato</label><input value={nc.contato} onChange={e=>setNc({...nc,contato:e.target.value})} placeholder="Nome do responsável" style={S.input}/></div>
            <div><label style={S.label}>E-mail</label><input value={nc.email} onChange={e=>setNc({...nc,email:e.target.value})} placeholder="email@empresa.com" style={S.input}/></div>
            <div><label style={S.label}>Telefone</label><input value={nc.tel} onChange={e=>setNc({...nc,tel:e.target.value})} placeholder="(11) 9999-9999" style={S.input}/></div>
            <div><label style={S.label}>Tipo</label><select value={nc.tipo} onChange={e=>setNc({...nc,tipo:e.target.value})} style={S.input}>{TIPOS.map(t=><option key={t.v} value={t.v}>{t.l}</option>)}</select></div>
            <div><label style={S.label}>Região</label><select value={nc.regiao} onChange={e=>setNc({...nc,regiao:e.target.value})} style={S.input}>{REGIOES.map(r=><option key={r} value={r}>{r}</option>)}</select></div>
            <div><label style={S.label}>UF</label><select value={nc.uf} onChange={e=>setNc({...nc,uf:e.target.value})} style={S.input}>{UFS.map(u=><option key={u} value={u}>{u}</option>)}</select></div>
            <label style={{display:"flex",alignItems:"center",gap:6,cursor:"pointer"}}><input type="checkbox" checked={nc.remoto} onChange={e=>setNc({...nc,remoto:e.target.checked})}/><span style={{fontSize:13}}>Remoto</span></label>
          </div>
          <div style={{marginBottom:12}}><label style={S.label}>Endereço</label><input value={nc.end} onChange={e=>setNc({...nc,end:e.target.value})} placeholder="Rua, nº - Cidade - UF" style={S.input}/></div>
          <div style={{marginBottom:12}}><label style={S.label}>Notas</label><textarea value={nc.notas} onChange={e=>setNc({...nc,notas:e.target.value})} rows={2} style={{...S.input,resize:"vertical"}}/></div>
          <div style={{display:"flex",gap:10}}>
            <button onClick={()=>{if(!nc.nome)return;setCls([...cls,{...nc,id:Date.now()+Math.random()}]);setShow(false);setNc({nome:"",contato:"",email:"",tel:"",tipo:"lojista",regiao:"São Paulo - Centro",uf:"SP",remoto:false,status:"prospeccao",sens:ds(),notas:"",ult:"",end:""});}} style={{padding:"10px 24px",borderRadius:8,background:nc.nome?"#4f46e5":"#94a3b8",color:"white",border:"none",fontSize:14,fontWeight:600,cursor:nc.nome?"pointer":"default"}}>Criar</button>
            <button onClick={()=>setShow(false)} style={{padding:"10px 24px",borderRadius:8,background:"#f1f5f9",color:"#475569",border:"none",fontSize:14,fontWeight:500,cursor:"pointer"}}>Cancelar</button>
          </div>
        </div>
      )}
      <div style={{display:"grid",gap:10}}>
        {cls.map(c=>{const t=TIPOS.find(x=>x.v===c.tipo);return(
          <div key={c.id} onClick={()=>{setSel(c);setSec("detalhe");}} style={{...S.card,padding:14,cursor:"pointer",borderLeft:`4px solid ${PIPELINE.find(p=>p.k===c.status)?.c}`}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:10}}>
              <div style={{flex:1}}>
                <div style={{fontSize:14,fontWeight:600,color:"#1e293b"}}>{t?.i} {c.nome}</div>
                <div style={{fontSize:12,color:"#64748b",marginTop:2}}>{c.contato}{c.email?" • "+c.email:""}</div>
                <div style={{display:"flex",gap:8,marginTop:6,flexWrap:"wrap"}}>
                  <span style={S.pill(PIPELINE.find(p=>p.k===c.status)?.c)}>{PIPELINE.find(p=>p.k===c.status)?.l}</span>
                  {c.remoto&&<span style={S.pill("#3b82f6")}>Remoto</span>}
                </div>
              </div>
            </div>
          </div>
        );})}
      </div>
    </div>
  );
}

function Detalhe({cl,setSec}) {
  if(!cl) return null;
  const t = TIPOS.find(x=>x.v===cl.tipo);
  const st = PIPELINE.find(s=>s.k===cl.status);
  return (
    <div>
      <button onClick={()=>setSec("clientes")} style={{padding:"6px 12px",borderRadius:6,border:"1px solid #e2e8f0",background:"white",fontSize:12,fontWeight:500,cursor:"pointer",marginBottom:20}}>← Voltar</button>
      <div style={{...S.card,padding:24,marginBottom:20}}>
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:16}}>
          <div style={{fontSize:32}}>{t?.i}</div>
          <div>
            <h2 style={{fontSize:20,fontWeight:700,color:"#1e293b"}}>{cl.nome}</h2>
            <div style={{fontSize:13,color:"#64748b"}}>{t?.l}</div>
          </div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:16}}>
          <div><label style={{fontSize:11,fontWeight:600,color:"#64748b"}}>CONTATO</label><div style={{fontSize:14,fontWeight:600,marginTop:4}}>{cl.contato}</div></div>
          <div><label style={{fontSize:11,fontWeight:600,color:"#64748b"}}>E-MAIL</label><div style={{fontSize:14,fontWeight:600,marginTop:4}}>{cl.email||"—"}</div></div>
          <div><label style={{fontSize:11,fontWeight:600,color:"#64748b"}}>TELEFONE</label><div style={{fontSize:14,fontWeight:600,marginTop:4}}>{cl.tel||"—"}</div></div>
          <div><label style={{fontSize:11,fontWeight:600,color:"#64748b"}}>LOCALIZAÇÃO</label><div style={{fontSize:14,fontWeight:600,marginTop:4}}>{cl.regiao}{cl.remoto?" (Remoto)":""}</div></div>
        </div>
        <div><label style={{fontSize:11,fontWeight:600,color:"#64748b"}}>ENDEREÇO</label><div style={{fontSize:13,marginTop:4,color:"#475569"}}>{cl.end||"—"}</div></div>
      </div>
      <div style={{...S.card,padding:20}}>
        <h3 style={{fontSize:15,fontWeight:600,marginBottom:12}}>Sensibilidades</h3>
        {SENS.map(s=><div key={s.k} style={{display:"flex",alignItems:"center",gap:6,marginBottom:5}}><span style={{fontSize:13,width:18,textAlign:"center"}}>{s.i}</span><span style={{fontSize:11,width:90,color:"#475569"}}>{s.l}</span><div style={{flex:1,height:7,background:"#f1f5f9",borderRadius:4,overflow:"hidden"}}><div style={{width:`${cl.sens[s.k]*20}%`,height:"100%",background:s.c,borderRadius:4}}/></div><span style={{fontSize:11,fontWeight:600,width:16,textAlign:"right",color:s.c}}>{cl.sens[s.k]}</span></div>)}
        {cl.notas&&<div style={{marginTop:12,padding:12,background:"#f0fdf4",borderRadius:8,borderLeft:"3px solid #22c55e"}}><h4 style={{fontSize:12,fontWeight:600,marginBottom:4}}>Notas</h4><p style={{fontSize:12,color:"#475569",lineHeight:1.5}}>{cl.notas}</p></div>}
      </div>
    </div>
  );
}

function Pipeline({cls,setCls,canEdit}) {
  return (
    <div>
      <h2 style={{fontSize:22,fontWeight:700,marginBottom:4,color:"#1e293b"}}>Pipeline</h2>
      <p style={{color:"#64748b",marginBottom:16,fontSize:14}}>Gerencie o funil alterando o status</p>
      <div style={{display:"flex",gap:10,overflowX:"auto",paddingBottom:8}}>
        {PIPELINE.map(st=>{const sc=cls.filter(c=>c.status===st.k);return(
          <div key={st.k} style={{minWidth:185,flex:1}}>
            <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:8,padding:"5px 10px",borderRadius:6,background:st.c+"12"}}><div style={{width:8,height:8,borderRadius:"50%",background:st.c}}/><span style={{fontSize:12,fontWeight:600,color:st.c}}>{st.l}</span><span style={{marginLeft:"auto",fontSize:11,fontWeight:700,color:st.c}}>{sc.length}</span></div>
            {sc.map(c=>{const tp=TIPOS.find(t=>t.v===c.tipo);return(
              <div key={c.id} style={{background:"white",borderRadius:8,padding:10,marginBottom:5,boxShadow:"0 1px 3px rgba(0,0,0,0.06)",borderLeft:`3px solid ${st.c}`}}>
                <div style={{fontSize:12,fontWeight:600,color:"#1e293b"}}>{tp?.i} {c.nome}</div>
                <div style={{fontSize:11,color:"#64748b"}}>{c.contato}</div>
                {canEdit&&<select value={c.status} onChange={e=>setCls(cls.map(cl=>cl.id===c.id?{...cl,status:e.target.value}:cl))} style={{marginTop:5,width:"100%",padding:"3px 5px",borderRadius:4,border:"1px solid #e2e8f0",fontSize:10}}>{PIPELINE.map(s=><option key={s.k} value={s.k}>{s.l}</option>)}</select>}
                {!canEdit&&<div style={{marginTop:5,padding:"3px 8px",borderRadius:4,background:st.c+"12",fontSize:10,fontWeight:600,color:st.c}}>{st.l}</div>}
              </div>
            );})}
            {sc.length===0&&<div style={{padding:14,textAlign:"center",color:"#cbd5e1",fontSize:11,background:"#f8fafc",borderRadius:6,border:"1px dashed #e2e8f0"}}>vazio</div>}
          </div>
        );})}
      </div>
    </div>
  );
}

function Busca({proj,onImport,canEdit}) {
  const [q,setQ]=useState(""),[reg,setReg]=useState("São Paulo"),[res,setRes]=useState([]),[loading,setLoading]=useState(false),[err,setErr]=useState(""),[imp,setImp]=useState(new Set());
  async function go() {
    if(!q) return; setLoading(true); setErr(""); setRes([]);
    try {
      const data = await gSearch(q, reg);
      if(!data.places||data.places.length===0){setRes([]);setLoading(false);return;}
      setRes(data.places.map(p=>({
        nome:p.displayName?.text||"",
        end:p.formattedAddress||"",
        tel:p.nationalPhoneNumber||p.internationalPhoneNumber||"",
        website:p.websiteUri||"",
        maps:p.googleMapsUri||"",
        rating:p.rating||0,
        ratingN:p.userRatingCount||0,
        regiao:detectRegiao(p.formattedAddress),
        status:p.businessStatus
      })).filter(r=>r.status==="OPERATIONAL"||!r.status));
    } catch(e) { setErr(e.message); }
    setLoading(false);
  }
  function doImport(r) {
    onImport({id:Date.now()+Math.random(),nome:r.nome,contato:"Comercial",email:"",tel:r.tel,tipo:"lojista",regiao:r.regiao,uf:"SP",remoto:false,status:"prospeccao",sens:ds(),notas:`Google Places.${r.website?" Site: "+r.website:""}${r.rating?" ⭐"+r.rating.toFixed(1)+"("+r.ratingN+")":""}`,ult:"",end:r.end,website:r.website,mapsUrl:r.maps});
    setImp(prev=>new Set([...prev,r.nome]));
  }
  return (
    <div>
      <h2 style={{fontSize:22,fontWeight:700,color:"#1e293b",marginBottom:4}}>Busca Externa de Empresas</h2>
      <p style={{color:"#64748b",fontSize:14,marginBottom:20}}>Pesquise empresas reais via <strong>Google Places</strong> para importar ao projeto <strong>{proj.nome}</strong></p>
      <div style={{...S.card,padding:22,marginBottom:20}}>
        <div style={{display:"flex",gap:12,flexWrap:"wrap",alignItems:"flex-end"}}>
          <div style={{flex:2,minWidth:240}}><label style={S.label}>Ramo / Palavra-chave</label><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Ex: aquários ornamentais, luminárias led..." onKeyDown={e=>e.key==="Enter"&&go()} style={S.input}/></div>
          <div style={{flex:1,minWidth:170}}><label style={S.label}>Região / Cidade</label><input value={reg} onChange={e=>setReg(e.target.value)} placeholder="Ex: São Paulo" onKeyDown={e=>e.key==="Enter"&&go()} style={S.input}/></div>
          <button onClick={go} disabled={!q||loading} style={{padding:"10px 22px",borderRadius:8,background:q?"linear-gradient(135deg,#4f46e5,#7c3aed)":"#94a3b8",color:"white",border:"none",fontSize:14,fontWeight:600,cursor:q?"pointer":"default",height:40,whiteSpace:"nowrap"}}>{loading?"Buscando...":"🔍 Buscar"}</button>
        </div>
        <div style={{marginTop:10,display:"flex",gap:6,flexWrap:"wrap"}}><span style={{fontSize:11,color:"#94a3b8"}}>Sugestões:</span>{["aquários ornamentais","luminárias led","pet shop","material elétrico","móveis planejados"].map(s=><button key={s} onClick={()=>setQ(s)} style={{padding:"2px 8px",borderRadius:20,border:"1px solid #e2e8f0",background:"#f8fafc",fontSize:11,color:"#4f46e5",cursor:"pointer",fontWeight:500}}>{s}</button>)}</div>
      </div>
      {loading&&<div style={{textAlign:"center",padding:36,color:"#64748b"}}><div style={{fontSize:30,marginBottom:10}}>🔍</div><div style={{fontSize:14}}>Buscando no <strong>Google Places</strong>...</div></div>}
      {err&&<div style={{padding:"14px 18px",background:"#fef2f2",borderRadius:10,border:"1px solid #fecaca",marginBottom:14}}><div style={{fontSize:14,fontWeight:600,color:"#dc2626"}}>Erro</div><div style={{fontSize:13,color:"#991b1b"}}>{err}</div></div>}
      {!loading&&res.length>0&&(
        <div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}><h3 style={{fontSize:15,fontWeight:600}}>{res.length} empresa(s) encontrada(s)</h3><span style={{fontSize:11,color:"#94a3b8"}}><span style={{color:"#4285f4",fontWeight:700}}>G</span> Google Places API</span></div>
          <div style={{display:"grid",gap:8}}>
            {res.map((r,i)=>{const done=imp.has(r.nome)||proj.clients.some(c=>c.nome===r.nome);return(
              <div key={i} style={{...S.card,padding:"14px 18px",border:done?"2px solid #22c55e":"1px solid #f1f5f9",opacity:done?0.7:1}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:14}}>
                  <div style={{flex:1}}>
                    <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:3,flexWrap:"wrap"}}>
                      <span style={{fontSize:16}}>🏢</span><span style={{fontSize:15,fontWeight:600,color:"#1e293b"}}>{r.nome}</span>
                      {r.rating>0&&<span style={{fontSize:11,padding:"1px 6px",borderRadius:10,background:"#fef9c3",color:"#a16207",fontWeight:600}}>⭐ {r.rating.toFixed(1)} ({r.ratingN})</span>}
                    </div>
                    {r.tel&&<div style={{fontSize:13,color:"#64748b"}}>📞 {r.tel}</div>}
                    {r.end&&<div style={{fontSize:12,color:"#94a3b8",marginTop:1}}>📍 {r.end}</div>}
                    <div style={{display:"flex",gap:10,marginTop:4}}>
                      {r.website&&<a href={r.website} target="_blank" rel="noopener noreferrer" style={{fontSize:11,color:"#4f46e5",textDecoration:"none"}} onClick={e=>e.stopPropagation()}>🌐 Site</a>}
                      {r.maps&&<a href={r.maps} target="_blank" rel="noopener noreferrer" style={{fontSize:11,color:"#ea4335",textDecoration:"none"}} onClick={e=>e.stopPropagation()}>📍 Google Maps</a>}
                    </div>
                  </div>
                  {done?<span style={{padding:"6px 14px",borderRadius:8,background:"#f0fdf4",color:"#22c55e",fontSize:13,fontWeight:600}}>✓ Importado</span>:
                  canEdit?<button onClick={()=>doImport(r)} style={{padding:"6px 16px",borderRadius:8,background:"linear-gradient(135deg,#22c55e,#16a34a)",color:"white",border:"none",fontSize:13,fontWeight:600,cursor:"pointer",whiteSpace:"nowrap"}}>+ Importar</button>:null}
                </div>
              </div>
            );})}
          </div>
        </div>
      )}
      {!loading&&!err&&res.length===0&&<div style={{textAlign:"center",padding:36,background:"#f8fafc",borderRadius:12,color:"#94a3b8"}}><div style={{fontSize:36,marginBottom:6}}>🔍</div><div style={{fontSize:14}}>Busque empresas reais pelo <strong>Google Places</strong></div><div style={{fontSize:12,marginTop:4,color:"#cbd5e1"}}>Retorna nome, endereço, telefone, site e avaliações</div></div>}
    </div>
  );
}

function Swot() {
  const s=[{k:"f",l:"Forças",i:"💪",c:"#22c55e",bg:"#f0fdf4",it:["Fábrica nacional — flexibilidade e personalização","Sem custo de importação — preço competitivo","Linha completa (industrial, comercial, residencial)","Atendimento direto sem intermediários","Produção sob demanda","Garantia e assistência técnica local"]},{k:"fr",l:"Fraquezas",i:"⚠️",c:"#ef4444",bg:"#fef2f2",it:["Marca nova sem reconhecimento","Base de clientes zero","Equipe comercial em formação","Sem histórico para crédito","Investimento em marketing necessário","Falta de cases de sucesso"]},{k:"o",l:"Oportunidades",i:"🚀",c:"#3b82f6",bg:"#eff6ff",it:["Mercado LED em crescimento","Substituição de iluminação convencional","Programas de eficiência energética","Tendência smart homes/IoT","E-commerce B2B em expansão","Demanda por produtos nacionais"]},{k:"a",l:"Ameaças",i:"🛑",c:"#f59e0b",bg:"#fffbeb",it:["Importados chineses baratos","Marcas estabelecidas (Philips, Osram)","Instabilidade econômica","Mudanças regulatórias INMETRO","Flutuação do dólar","Guerra de preços em marketplaces"]}];
  return (
    <div>
      <h2 style={{fontSize:22,fontWeight:700,marginBottom:16,color:"#1e293b"}}>Análise SWOT</h2>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
        {s.map(x=><div key={x.k} style={{background:x.bg,borderRadius:12,padding:16,border:`2px solid ${x.c}25`}}><div style={{display:"flex",alignItems:"center",gap:6,marginBottom:10}}><span style={{fontSize:18}}>{x.i}</span><h3 style={{fontSize:15,fontWeight:700,color:x.c}}>{x.l}</h3></div>{x.it.map((t,i)=><div key={i} style={{padding:"5px 10px",marginBottom:3,background:"rgba(255,255,255,0.7)",borderRadius:6,fontSize:12,color:"#334155",borderLeft:`3px solid ${x.c}`}}>{t}</div>)}</div>)}
      </div>
    </div>
  );
}

function Estrategias() {
  const [sel,setSel]=useState("lojista");
  const es={fabricante:{t:"Parceria Industrial",d:"Co-branding e fornecimento exclusivo.",a:["Fornecimento exclusivo","Co-desenvolvimento","Parceria distribuição"],b:"Amostras + proposta"},importador:{t:"Substituição de Importação",d:"Sem risco cambial, entrega rápida, suporte local.",a:["Sem risco do dólar","Entrega em dias","Sem desembaraço","Suporte local"],b:"Kit amostra + pen drive"},revendedor:{t:"Parceria de Crescimento",d:"Margem atrativa e suporte de marketing.",a:["Margem acima da concorrência","Material PDV gratuito","Treinamento","Programa fidelidade"],b:"Display funcional + amostras"},lojista:{t:"Experiência no PDV",d:"Displays atrativos e demonstração.",a:["Display gratuito","Margem competitiva","Reposição rápida","Mix variado"],b:"Luminária decorativa + display"},ecommerce:{t:"Digital First",d:"Conteúdo digital e integração.",a:["Fotos profissionais","API/XML","Dropshipping","Embalagem e-commerce"],b:"Kit fotográfico + portal"},construtora:{t:"Projeto Completo",d:"Projeto luminotécnico incluso.",a:["Projeto gratuito","Preço por obra","Entrega por etapa","Pós-obra"],b:"Kit showroom"},arquiteto:{t:"Design e Exclusividade",d:"Produtos personalizáveis.",a:["Customização","Acabamentos diferenciados","Comissão indicação","Catálogo premium"],b:"Luminária exclusiva + catálogo"},instalador:{t:"Facilidade",d:"Instalação fácil e suporte rápido.",a:["Instalação simples","Suporte WhatsApp","Programa indicação","Garantia fácil"],b:"Kit ferramentas PowerPic"},atacadista:{t:"Volume e Logística",d:"Preço por volume, condições flexíveis.",a:["Melhor preço volume","Frete CIF","Prazo estendido","Exclusividade regional"],b:"Condições comerciais agressivas"},prestador:{t:"Parceria Técnica",d:"Suporte para projetos.",a:["Treinamento","Indicação mútua","Suporte prioritário","Desconto parceiro"],b:"Kit demonstração"}};
  const e=es[sel];
  return (
    <div>
      <h2 style={{fontSize:22,fontWeight:700,marginBottom:16,color:"#1e293b"}}>Estratégias de Abordagem</h2>
      <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:18}}>{TIPOS.map(t=><button key={t.v} onClick={()=>setSel(t.v)} style={{padding:"7px 12px",borderRadius:8,border:"2px solid",borderColor:sel===t.v?"#4f46e5":"#e2e8f0",background:sel===t.v?"#eef2ff":"white",color:sel===t.v?"#4f46e5":"#475569",fontSize:12,fontWeight:600,cursor:"pointer"}}>{t.i} {t.l}</button>)}</div>
      {e&&<div style={{...S.card,padding:22}}><h3 style={{fontSize:17,fontWeight:700,color:"#4f46e5",marginBottom:4}}>{e.t}</h3><p style={{fontSize:14,color:"#475569",marginBottom:14}}>{e.d}</p><div style={{marginBottom:12}}><h4 style={{fontSize:13,fontWeight:600,marginBottom:6}}>Argumentos</h4>{e.a.map((a,i)=><div key={i} style={{fontSize:13,color:"#475569",padding:"3px 0"}}>✓ {a}</div>)}</div><div style={{padding:"10px 14px",background:"#f0fdf4",borderRadius:8,borderLeft:"4px solid #22c55e"}}><strong style={{color:"#166534",fontSize:13}}>Brindes:</strong> <span style={{fontSize:13,color:"#15803d"}}>{e.b}</span></div></div>}
    </div>
  );
}

function Materiais() {
  const cats=[{t:"Presença Digital",i:"🌐",it:[["Site dedicado","Prioritário"],["Redes sociais","Prioritário"],["E-commerce B2B","Fase 2"],["Google Meu Negócio","Rápido"]]},{t:"Digitais",i:"📱",it:[["Folders PDF","Prioritário"],["Fichas técnicas","Prioritário"],["Vídeos","Fase 2"],["Banco de imagens","Prioritário"]]},{t:"Impressos",i:"🖨️",it:[["Catálogos papel","Fase 2"],["Cartões de visita","Rápido"],["Banners PDV","Fase 2"]]},{t:"Brindes",i:"🎁",it:[["Kit amostra","Prioritário"],["Display funcional","Fase 2"],["Pen drive catálogo","Rápido"],["Brindes com logo","Fase 3"]]}];
  const pc={"Prioritário":"#ef4444","Fase 2":"#f59e0b","Fase 3":"#94a3b8","Rápido":"#22c55e"};
  return (
    <div>
      <h2 style={{fontSize:22,fontWeight:700,marginBottom:16,color:"#1e293b"}}>Materiais Comerciais</h2>
      {cats.map((c,ci)=><div key={ci} style={{marginBottom:18}}><h3 style={{fontSize:15,fontWeight:600,marginBottom:8}}>{c.i} {c.t}</h3>{c.it.map(([n,f],i)=><div key={i} style={{...S.card,padding:"8px 14px",marginBottom:3,display:"flex",justifyContent:"space-between",alignItems:"center"}}><span style={{fontSize:13}}>{n}</span><span style={{padding:"2px 8px",borderRadius:20,fontSize:11,fontWeight:600,background:(pc[f]||"#94a3b8")+"18",color:pc[f]}}>{f}</span></div>)}</div>)}
    </div>
  );
}

function Produtos() {
  const lin=[["LED Industrial","High-bay, projetores"],["LED Comercial","Painéis, spots, trilho"],["LED Residencial","Bulbo, tubular, fita"],["LED Decorativo","Filamento, pendentes"],["Solar/Outdoor","Postes solares, refletores"],["Emergência","Luminárias de emergência"]];
  const comp=[["Drivers/Fontes","Alto"],["Fitas e Perfis","Alto"],["Sensores Presença","Médio"],["Dimmers","Alto"],["Sistemas IoT","Alto"],["Painéis Solares","Alto"],["Grow Light","Médio"],["Cabos","Baixo"],["Baterias","Médio"]];
  const pc={"Alto":"#22c55e","Médio":"#f59e0b","Baixo":"#94a3b8"};
  return (
    <div>
      <h2 style={{fontSize:22,fontWeight:700,marginBottom:16,color:"#1e293b"}}>Produtos</h2>
      <h3 style={{fontSize:15,fontWeight:600,marginBottom:8}}>💡 Linhas de Luminárias</h3>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:20}}>{lin.map(([n,d],i)=><div key={i} style={{...S.card,padding:14,borderTop:"3px solid #4f46e5"}}><div style={{fontSize:14,fontWeight:600,marginBottom:2}}>{n}</div><div style={{fontSize:12,color:"#64748b"}}>{d}</div></div>)}</div>
      <h3 style={{fontSize:15,fontWeight:600,marginBottom:8}}>🔗 Complementares</h3>
      {comp.map(([n,p],i)=><div key={i} style={{...S.card,padding:"8px 14px",marginBottom:3,display:"flex",justifyContent:"space-between"}}><span style={{fontSize:13}}>{n}</span><span style={{padding:"2px 8px",borderRadius:20,fontSize:11,fontWeight:600,background:(pc[p])+"18",color:pc[p]}}>Potencial {p}</span></div>)}
    </div>
  );
}

function Dicas() {
  const d=[["🇧🇷","Diferenciação Nacional","Prazo menor, personalização, sem risco cambial, suporte local."],["🏆","Credibilidade Rápida","Certificações INMETRO, laudos, garantia estendida, amostras grátis."],["🎯","Segmentação Inteligente","Comece por nichos acessíveis, conquiste cases, depois ataque maiores."],["🎁","Programa Primeiro Pedido","Desconto, frete grátis, prazo estendido, kit brindes."],["📱","Marketing de Conteúdo","Vídeos instalação, comparativos, dicas técnicas."],["🤝","Representantes Motivados","Comissão alta, bonificação, treinamento, material de qualidade."],["🛡️","Pós-Venda Diferencial","Suporte WhatsApp, garantia fácil, reposição rápida."],["🚀","Tendências","Smart lighting, eficiência energética, energia solar, human-centric."]];
  return (
    <div>
      <h2 style={{fontSize:22,fontWeight:700,marginBottom:16,color:"#1e293b"}}>Dicas para o Sucesso</h2>
      {d.map(([ic,t,desc],i)=><div key={i} style={{...S.card,padding:16,marginBottom:8,display:"flex",gap:12,alignItems:"flex-start"}}><span style={{fontSize:28,flexShrink:0}}>{ic}</span><div><h3 style={{fontSize:15,fontWeight:600,marginBottom:3}}>{t}</h3><p style={{fontSize:13,color:"#475569",lineHeight:1.5}}>{desc}</p></div></div>)}
    </div>
  );
}

// ====== MAIN ======
export default function App() {
  const [user,setUser] = useState(LS.get("user",null));
  const [users,setUsers] = useState(LS.get("users",DEFAULT_USERS));
  const [logs,setLogs] = useState(LS.get("logs",[]));
  const [perms,setPerms] = useState(LS.get("perms",DEFAULT_PERMS));
  const [sec,setSec]=useState("projetos");
  const [projs,setProjs]=useState(PROJECTS0);
  const [ap,setAp]=useState(null);
  const [sel,setSel]=useState(null);

  const logAction = (action,detail,nome) => {
    const who = nome || (user && user.nome) || "Sistema";
    const newLog = {ts:new Date().toISOString(),usuario:who,acao:action,detalhe:detail};
    const updated = [...logs,newLog];
    setLogs(updated);
    try { LS.set("logs",updated); } catch {}
  };

  const handleLogin = (u) => {
    setUser(u);
    LS.set("user",u);
    logAction("Login","Usuário autenticado",u.nome);
  };

  const handleLogout = () => {
    const nome = user?.nome;
    setUser(null);
    LS.set("user",null);
    logAction("Logout","Usuário desconectado",nome);
  };

  // Persist on change (wrapped safely)
  try { LS.set("users",users); LS.set("perms",perms); LS.set("logs",logs); } catch {}

  if(!user) return <Login onLogin={handleLogin}/>;

  const proj=projs.find(p=>p.id===ap);
  const cls=proj?.clients||[];
  const setCls=nc=>setProjs(projs.map(p=>p.id===ap?{...p,clients:nc}:p));
  const addCl=c=>{ setProjs(projs.map(p=>p.id===ap?{...p,clients:[...p.clients,c]}:p)); logAction("Importar Cliente",c.nome); };
  const canEdit = user.role==="admin"||user.role==="vendedor";

  const page=()=>{
    if(sec==="projetos") return <Projetos projs={projs} setProjs={setProjs} setAp={setAp} setSec={setSec} canEdit={canEdit}/>;
    if(sec==="admin"&&user.role==="admin") return <AdminPanel users={users} setUsers={setUsers} logs={logs} setLogs={setLogs} perms={perms} setPerms={setPerms}/>;
    if(!proj){setSec("projetos");return null;}
    switch(sec){
      case "dashboard": return <Dashboard cls={cls} proj={proj}/>;
      case "clientes": return <Clientes cls={cls} setCls={setCls} setSec={setSec} setSel={setSel} canEdit={canEdit}/>;
      case "detalhe": return <Detalhe cl={sel} setSec={setSec}/>;
      case "pipeline": return <Pipeline cls={cls} setCls={setCls} canEdit={canEdit}/>;
      case "busca": return <Busca proj={proj} onImport={addCl} canEdit={canEdit}/>;
      case "swot": return <Swot/>;
      case "estrategias": return <Estrategias/>;
      case "materiais": return <Materiais/>;
      case "produtos": return <Produtos/>;
      case "dicas": return <Dicas/>;
      default: return <Dashboard cls={cls} proj={proj}/>;
    }
  };

  return (
    <div style={{display:"flex",fontFamily:"'Inter',-apple-system,BlinkMacSystemFont,sans-serif",background:"#f8fafc",minHeight:"100vh"}}>
      <Sidebar sec={sec} setSec={setSec} projs={projs} ap={ap} setAp={setAp} user={user} onLogout={handleLogout} perms={perms}/>
      <div style={{flex:1,marginLeft:250,padding:"24px 28px",maxWidth:1100}}>{page()}</div>
    </div>
  );
}
