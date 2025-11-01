import React from 'react';
import StudyCard from '../components/StudyCard';

export default function Dashboard() {
  return (
    <main style={{padding:24, background:'#071021', minHeight:'100vh', color:'#E6EEF8', fontFamily:"Inter, sans-serif"}}>
      <header style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24}}>
        <h1 style={{margin:0, fontFamily:'Poppins, sans-serif'}}>StudyApp</h1>
        <div style={{display:'flex', alignItems:'center', gap:12}}>
          <button style={{background:'transparent', border:'1px solid rgba(255,255,255,0.06)', color:'#E6EEF8', padding:'8px 12px', borderRadius:12}}>Perfil</button>
        </div>
      </header>

      <section style={{display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))', gap:16}}>
        <StudyCard title="Matemática" duration="25 min" progress={0.6} />
        <StudyCard title="Física" duration="45 min" progress={0.3} />
        <StudyCard title="Química" duration="15 min" progress={0.9} />
      </section>
    </main>
  );
}