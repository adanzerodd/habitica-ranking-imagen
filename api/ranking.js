import { ImageResponse } from '@vercel/og';

export default async function handler(req) {
  try {
    const SHEET_ID = '1LxKHsLjPAfp_cvWvGXbxkUZLTyHEz9-4WqLpiQ24Kho';
    // Usamos exportar a CSV
    const csvUrl = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=Ranking`;
    
    const response = await fetch(csvUrl);
    if (!response.ok) throw new Error('No se pudo leer el Sheet');
    const text = await response.text();
    
    // Procesar filas
    const filas = text.split('\n').slice(1); 
    const jugadores = filas.map(fila => {
      // Separar por comas ignorando las que están dentro de comillas
      const c = fila.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
      return {
        nombre: c[8] ? c[8].replace(/"/g, '') : "Guerrero", 
        diario: parseInt(c[10]) || 0,
        semanal: parseInt(c[11]) || 0,
        mensual: parseInt(c[12]) || 0
      };
    })
    .sort((a, b) => b.semanal - a.semanal)
    .slice(0, 5);

    return new ImageResponse(
      (
        <div style={{
          height: '100%', width: '100%', display: 'flex', flexDirection: 'column',
          alignItems: 'center', backgroundColor: '#2d1c4d', color: 'white', padding: '30px'
        }}>
          <h1 style={{ fontSize: '40px', color: '#ffa600' }}>🏆 TOP SEMANAL 🏆</h1>
          <div style={{ display: 'flex', flexDirection: 'column', width: '90%', marginTop: '20px' }}>
            {jugadores.map((j, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '24px', padding: '10px', borderBottom: '1px solid #4e3481' }}>
                <span>{i + 1}. {j.nombre}</span>
                <span>{j.semanal} pts</span>
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
