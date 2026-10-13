'use client';

import { useEffect, useState } from 'react';

type Credential = { id:string; title:string; website:string|null; username:string; password:string; notes:string|null; created_at:string; updated_at:string };

export default function Home() {
  const [user, setUser] = useState<{name:string;email:string}|null>(null);
  const [mode, setMode] = useState<'login'|'register'>('login');
  const [form, setForm] = useState({name:'',email:'',password:''});
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [entry, setEntry] = useState({title:'',website:'',username:'',password:'',notes:''});
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  async function request(url:string, options:RequestInit={}) {
    const response = await fetch(url, { ...options, headers:{'Content-Type':'application/json', ...(options.headers||{})} });
    const data = await response.json().catch(()=>({}));
    if (!response.ok) throw new Error(data.error || 'Ocorreu um erro.');
    return data;
  }

  async function loadSession() {
    try {
      const data = await request('/api/auth/me');
      setUser(data.user);
      const vault = await request('/api/credentials');
      setCredentials(vault.credentials);
    } catch { setUser(null); }
  }

  useEffect(() => { loadSession(); }, []);

  async function submitAuth(e:React.FormEvent) {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register';
      const data = await request(endpoint, {method:'POST', body:JSON.stringify(form)});
      setUser(data.user); setForm({name:'',email:'',password:''});
      const vault = await request('/api/credentials'); setCredentials(vault.credentials);
    } catch (err) { setError(err instanceof Error ? err.message : 'Erro.'); }
    finally { setLoading(false); }
  }

  async function addCredential(e:React.FormEvent) {
    e.preventDefault(); setError(''); setMessage(''); setLoading(true);
    try {
      await request('/api/credentials', {method:'POST', body:JSON.stringify(entry)});
      setEntry({title:'',website:'',username:'',password:'',notes:''});
      const vault = await request('/api/credentials'); setCredentials(vault.credentials); setMessage('Login salvo com sucesso.');
    } catch (err) { setError(err instanceof Error ? err.message : 'Erro.'); }
    finally { setLoading(false); }
  }

  async function removeCredential(id:string) {
    if (!confirm('Excluir este login do cofre?')) return;
    try { await request(`/api/credentials/${id}`, {method:'DELETE'}); setCredentials(credentials.filter(c=>c.id!==id)); }
    catch (err) { setError(err instanceof Error ? err.message : 'Erro.'); }
  }

  async function logout() { await request('/api/auth/logout',{method:'POST'}); setUser(null); setCredentials([]); }

  if (!user) return <main className="center"><section className="card auth"><div className="logo">🔐</div><h1>Cofre de Senhas</h1><p className="muted">Guarde seus logins em um único lugar.</p>
    <div className="tabs"><button className={mode==='login'?'active':''} onClick={()=>setMode('login')}>Entrar</button><button className={mode==='register'?'active':''} onClick={()=>setMode('register')}>Criar conta</button></div>
    <form onSubmit={submitAuth}>{mode==='register'&&<label>Nome<input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required maxLength={80}/></label>}<label>E-mail<input type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} required/></label><label>Senha principal<input type="password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} required minLength={8}/></label><button className="primary" disabled={loading}>{loading?'Aguarde...':mode==='login'?'Entrar':'Criar conta'}</button></form>
    {error&&<p className="error">{error}</p>}<p className="small">Projeto acadêmico — API REST + Neon PostgreSQL + Vercel.</p></section></main>;

  return <main className="container"><header><div><h1>🔐 Cofre de Senhas</h1><p className="muted">Olá, {user.name}. Seus logins ficam protegidos.</p></div><button onClick={logout}>Sair</button></header>
    <section className="grid"><div className="card"><h2>Novo login</h2><p className="muted">Cadastre qualquer conta que queira guardar.</p><form onSubmit={addCredential}><label>Nome do serviço<input placeholder="Ex.: GitHub" value={entry.title} onChange={e=>setEntry({...entry,title:e.target.value})} required maxLength={120}/></label><label>Site<input placeholder="https://..." value={entry.website} onChange={e=>setEntry({...entry,website:e.target.value})} maxLength={500}/></label><label>Usuário / e-mail<input value={entry.username} onChange={e=>setEntry({...entry,username:e.target.value})} required maxLength={255}/></label><label>Senha<input type="password" value={entry.password} onChange={e=>setEntry({...entry,password:e.target.value})} required maxLength={500}/></label><label>Observações<textarea value={entry.notes} onChange={e=>setEntry({...entry,notes:e.target.value})} maxLength={2000}/></label><button className="primary" disabled={loading}>Salvar login</button></form>{message&&<p className="success">{message}</p>}{error&&<p className="error">{error}</p>}</div>
    <div className="card"><div className="row"><div><h2>Meus logins</h2><p className="muted">{credentials.length} credencial(is) salva(s).</p></div></div>{credentials.length===0?<div className="empty">Nenhum login salvo ainda.</div>:<div className="list">{credentials.map(c=><article className="credential" key={c.id}><div><h3>{c.title}</h3>{c.website&&<a href={c.website} target="_blank" rel="noreferrer">Abrir site</a>}<p><strong>Usuário:</strong> {c.username}</p><p><strong>Senha:</strong> <code>{c.password}</code></p>{c.notes&&<p className="muted">{c.notes}</p>}</div><button className="danger" onClick={()=>removeCredential(c.id)}>Excluir</button></article>)}</div>}</div></section>
    <footer>As senhas dos logins salvos são criptografadas no servidor. A senha principal da conta é armazenada como hash.</footer>
  </main>;
}
