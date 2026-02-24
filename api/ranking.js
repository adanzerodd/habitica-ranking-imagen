import { ImageResponse } from '@vercel/og';

export const config = { runtime: 'edge' };

export default async function handler(req) {
  try {
    // 1. OBTENER DATOS DEL SHEET (Tu ID de ranking principal)
    const SHEET_ID = '1LxKHsLjPAfp_cvWvGXbxkUZLTyHEz9-4WqLpiQ24Kho';
    const csvUrl = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=Ranking`;
    
    const response = await fetch(csvUrl);
    const text = await response.text();
    
    // 2. PROCESAR EL CSV
    // Dividimos por filas y limpiamos las comillas que pone Google
    const filas = text.split('\n').slice(1); 
    const jugadores = filas.map(fila => {
      // Usamos una expresión regular para separar por comas respetando los textos
      const c = fila.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
      return {
        nombre: c[8] ? c[8].replace(/"/g, '') : "Anon", // Columna Name
        diario: parseInt(c[10]) || 0,   // Columna MisDía
        semanal: parseInt(c[11]) || 0,  // Columna MisSemana
        mensual: parseInt(c[12]) || 0   // Columna MisMes
      };
    })
    .sort((a, b) => b.semanal - a.semanal) // Ordenamos por el Top Semanal
    .slice(0, 5); // Tomamos los 5 mejores

    // 3. DIBUJAR LA IMAGEN (HTML + CSS)
    return new ImageResponse(
      (
        <div style={{
          height: '100%', width: '100%', display: 'flex', flexDirection: 'column',
          alignItems: 'center', backgroundColor: '#2d1c4d', // Morado Habitica
          color: 'white', padding: '30px', fontFamily: 'sans-serif',
          backgroundImage: 'radial-gradient(circle at 25% 25%, #4e3481 0%, #2d1c4d 100%)',
        }}>
          <h1 style={{ fontSize: '42px', color: '#ffa600', marginBottom: '10px' }}>
            ⚔️ TOP 5 MISIONEROS ⚔️
          </h1>
          <div style={{ display: 'flex', width: '90%', borderBottom: '2px solid #ffa600', paddingBottom: '5px', marginBottom: '10px', fontSize: '20px', opacity: 0.8 }}>
            <span style={{ width: '50%' }}>Guerrero</span>
            <span style={{ width: '16%', textAlign: 'center' }}>Día</span>
            <span style={{ width: '16%', textAlign: 'center' }}>Sem</span>
            <span style={{ width: '16%', textAlign: 'center' }}>Mes</span>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', width: '90%' }}>
            {jugadores.map((j, i) => (
              <div key={i} style={{ 
                display: 'flex', alignItems: 'center', padding: '12px 0', 
                borderBottom: '1px solid rgba(255,255,255,0.1)', fontSize: '24px'
              }}>
                <span style={{ width: '50%', color: i === 0 ? '#ffd700' : 'white' }}>
                  {i + 1}. {j.nombre}
                </span>
                <span style={{ width: '16%', textAlign: 'center' }}>{j.diario}</span>
                <span style={{ width: '16%', textAlign: 'center', fontWeight: 'bold', color: '#ffa600' }}>{j.semanal}</span>
                <span style={{ width: '16%', textAlign: 'center' }}>{j.mensual}</span>
              </div>
            ))}
          </div>
        </div>
      ),
      { width: 700, height: 450 }
    );
  } catch (e) {
    return new Response(`Error: ${e.message}`, { status: 500 });
  }
}
