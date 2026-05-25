import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom';
import api from './api/client';
import './style.css';

function getUser() {
  try { return JSON.parse(localStorage.getItem('user')); } catch { return null; }
}

function Auth({ mode }) {
  const nav = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'MEMBER' });
  const [error, setError] = useState('');

  async function submit(e) {
    e.preventDefault();
    setError('');
    try {
      const { data } = await api.post(`/auth/${mode}`, form);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      nav('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    }
  }

  return <div className="auth card">
    <h1>{mode === 'login' ? 'Login' : 'Signup'}</h1>
    <form onSubmit={submit}>
      {mode === 'signup' && <input placeholder="Name" onChange={e=>setForm({...form,name:e.target.value})} />}
      <input placeholder="Email" onChange={e=>setForm({...form,email:e.target.value})} />
      <input type="password" placeholder="Password" onChange={e=>setForm({...form,password:e.target.value})} />
      {mode === 'signup' && <select onChange={e=>setForm({...form,role:e.target.value})}><option>MEMBER</option><option>ADMIN</option></select>}
      <button>{mode === 'login' ? 'Login' : 'Create account'}</button>
      {error && <p className="error">{error}</p>}
    </form>
    <Link to={mode === 'login' ? '/signup' : '/login'}>{mode === 'login' ? 'Need account?' : 'Already have account?'}</Link>
  </div>;
}

function Layout({ children }) {
  const user = getUser();
  const nav = useNavigate();
  function logout(){ localStorage.clear(); nav('/login'); }
  return <><nav><b>Team Task Manager</b><span>{user?.name} ({user?.role})</span><Link to="/dashboard">Dashboard</Link><Link to="/projects">Projects</Link><Link to="/tasks">Tasks</Link><button onClick={logout}>Logout</button></nav><main>{children}</main></>;
}

function Private({ children }) { return localStorage.getItem('token') ? children : <Navigate to="/login" />; }

function Dashboard() {
  const [stats, setStats] = useState(null);
  useEffect(()=>{ api.get('/dashboard').then(r=>setStats(r.data)); },[]);
  return <Layout><h1>Dashboard</h1><div className="grid">{stats && Object.entries(stats).map(([k,v])=><div className="card" key={k}><h3>{k}</h3><p className="big">{v}</p></div>)}</div></Layout>;
}

function Projects() {
  const user = getUser();
  const [projects, setProjects] = useState([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const load = () => api.get('/projects').then(r=>setProjects(r.data));
  useEffect(load, []);
  async function createProject(e){ e.preventDefault(); await api.post('/projects',{name}); setName(''); load(); }
  async function addMember(id){ await api.post(`/projects/${id}/members`,{email}); setEmail(''); load(); }
  return <Layout><h1>Projects</h1>{user?.role==='ADMIN'&&<form className="inline" onSubmit={createProject}><input placeholder="Project name" value={name} onChange={e=>setName(e.target.value)}/><button>Create</button></form>}<div className="list">{projects.map(p=><div className="card" key={p._id}><h2>{p.name}</h2><p>{p.description}</p><small>Members: {p.members?.map(m=>m.name).join(', ')}</small>{user?.role==='ADMIN'&&<div className="inline"><input placeholder="member@email.com" value={email} onChange={e=>setEmail(e.target.value)}/><button onClick={()=>addMember(p._id)}>Add member</button></div>}</div>)}</div></Layout>;
}

function Tasks() {
  const user = getUser();
  const [tasks, setTasks] = useState([]), [projects,setProjects]=useState([]);
  const [form,setForm]=useState({title:'',dueDate:'',project:'',assignedTo:''});
  const load = async()=>{ const [t,p]=await Promise.all([api.get('/tasks'), api.get('/projects')]); setTasks(t.data); setProjects(p.data); };
  useEffect(()=>{load()},[]);
  async function createTask(e){ e.preventDefault(); await api.post('/tasks',form); setForm({title:'',dueDate:'',project:'',assignedTo:''}); load(); }
  async function updateStatus(id,status){ await api.patch(`/tasks/${id}`,{status}); load(); }
  const selectedProject = projects.find(p=>p._id===form.project);
  return <Layout><h1>Tasks</h1>{user?.role==='ADMIN'&&<form className="card form" onSubmit={createTask}><input placeholder="Task title" value={form.title} onChange={e=>setForm({...form,title:e.target.value})}/><input type="date" value={form.dueDate} onChange={e=>setForm({...form,dueDate:e.target.value})}/><select value={form.project} onChange={e=>setForm({...form,project:e.target.value,assignedTo:''})}><option value="">Select project</option>{projects.map(p=><option value={p._id} key={p._id}>{p.name}</option>)}</select><select value={form.assignedTo} onChange={e=>setForm({...form,assignedTo:e.target.value})}><option value="">Assign to</option>{selectedProject?.members?.map(m=><option key={m._id} value={m._id}>{m.name}</option>)}</select><button>Create task</button></form>}<div className="list">{tasks.map(t=><div className="card" key={t._id}><h2>{t.title}</h2><p>Project: {t.project?.name}</p><p>Assigned: {t.assignedTo?.name}</p><p>Due: {new Date(t.dueDate).toLocaleDateString()}</p><select value={t.status} onChange={e=>updateStatus(t._id,e.target.value)}><option>TODO</option><option>IN_PROGRESS</option><option>DONE</option></select></div>)}</div></Layout>;
}

function App(){return <BrowserRouter><Routes><Route path="/" element={<Navigate to="/dashboard"/>}/><Route path="/login" element={<Auth mode="login"/>}/><Route path="/signup" element={<Auth mode="signup"/>}/><Route path="/dashboard" element={<Private><Dashboard/></Private>}/><Route path="/projects" element={<Private><Projects/></Private>}/><Route path="/tasks" element={<Private><Tasks/></Private>}/></Routes></BrowserRouter>}

createRoot(document.getElementById('root')).render(<App/>);
