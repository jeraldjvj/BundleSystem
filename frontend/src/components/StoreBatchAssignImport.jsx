import { useState } from 'react';
import * as XLSX from 'xlsx-js-style';
import { storeService, userService } from '../services/api';

function StoreBatchAssignImport({ onImportComplete, onCancel }) {
  const [file, setFile] = useState(null);
  const [previewData, setPreviewData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const processFile = (selectedFile) => {
    if (!selectedFile) return;
    if (!/\.(xlsx|xls)$/i.test(selectedFile.name)) {
      setError('El archivo debe ser un Excel (.xlsx o .xls)');
      return;
    }
    setFile(selectedFile);
    setError('');
    setSuccess('');

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet);

        const transformedData = jsonData.map(row => ({
          store_code: row['Código'] || row['store_code'] || row['Código de Tienda'] || '',
          mi_id: row['MI ID'] || row['mi_id'] || row['Usuario ID'] || row['user_id'] || row['ID de Usuario'] || '',
        }));

        setPreviewData(transformedData);
      } catch (err) {
        setError('Error al leer el archivo Excel: ' + err.message);
      }
    };
    reader.readAsArrayBuffer(selectedFile);
  };

  const handleFileChange = (e) => processFile(e.target.files[0]);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    processFile(e.dataTransfer.files?.[0]);
  };

  const handleImport = async () => {
    if (previewData.length === 0) {
      setError('No hay datos para importar');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const usersResponse = await userService.getUsers();
      const users = usersResponse.data;
      const storesResponse = await storeService.getStores();
      const stores = storesResponse.data;

      let successCount = 0;
      let errorCount = 0;
      const errors = [];

      for (const [index, row] of previewData.entries()) {
        const fila = index + 2;
        try {
          if (!row.store_code || !row.mi_id) {
            throw new Error('Faltan datos (Código o MI ID vacío)');
          }

          const store = stores.find(s => String(s.storeCode) === String(row.store_code));
          if (!store) {
            throw new Error(`Tienda ${row.store_code} no encontrada`);
          }

          const user = users.find(u => String(u.miId) === String(row.mi_id));
          if (!user) {
            throw new Error(`MI ID ${row.mi_id} no encontrado`);
          }

          await storeService.updateStore(store.storeCode, { user_id: user.userId });
          successCount++;
        } catch (err) {
          errorCount++;
          errors.push(`Fila ${fila} (${row.store_code}): ${err.response?.data?.error || err.message}`);
        }
      }

      if (errorCount > 0) {
        setError(`Reasignación parcial: ${successCount} exitosas, ${errorCount} fallidas.\n${errors.join('\n')}`);
        if (successCount > 0) setTimeout(() => onImportComplete(), 3000);
      } else {
        setSuccess(`Se reasignaron ${successCount} tiendas exitosamente!`);
        setTimeout(() => onImportComplete(), 1500);
      }
    } catch (err) {
      setError('Error al procesar el archivo: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const downloadTemplate = () => {
    const template = [
      { 'Código': 'BO0001760', 'MI ID': '6846878912' },
      { 'Código': 'BO0001766', 'MI ID': '6846878913' },
    ];

    const ws = XLSX.utils.json_to_sheet(template);

    // Ancho de columnas
    ws['!cols'] = [{ wch: 20 }, { wch: 20 }];

    // Estilo del encabezado: fondo azul, letra blanca en negrita
    const headerStyle = {
      fill: { fgColor: { rgb: '2D3F6E' } },
      font: { color: { rgb: 'FFFFFF' }, bold: true, sz: 12 },
      alignment: { horizontal: 'center', vertical: 'center' },
      border: {
        bottom: { style: 'medium', color: { rgb: '1A2340' } }
      }
    };
    ws['A1'].s = headerStyle;
    ws['B1'].s = headerStyle;
    ws['!rows'] = [{ hpt: 24 }];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Plantilla');
    XLSX.writeFile(wb, 'plantilla_reasignar_tiendas.xlsx');
  };

  return (
    <div style={{ maxWidth: '720px', margin: '2rem auto', backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 8px 30px rgba(0,0,0,0.08)', overflow: 'hidden', width: '100%', boxSizing: 'border-box' }}>
      <div style={{ background: 'linear-gradient(135deg, #1a2340, #2d3f6e)', padding: '1.5rem 2rem', color: 'white' }}>
        <h2 style={{ margin: 0, fontSize: '1.25rem' }}>Reasignar Tiendas desde Excel</h2>
        <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', opacity: 0.75 }}>
          Cambia el propietario de varias tiendas a la vez — solo necesitas 2 columnas: código de tienda y MI ID del nuevo propietario
        </p>
      </div>

      <div style={{ padding: '2rem' }}>
        {success && (
          <div style={{ padding: '0.85rem 1rem', marginBottom: '1.25rem', backgroundColor: '#d4edda', color: '#155724', borderRadius: '10px', fontSize: '0.875rem' }}>
            {success}
          </div>
        )}

        {error && (
          <div style={{ padding: '0.85rem 1rem', marginBottom: '1.25rem', backgroundColor: '#fdecea', color: '#c0392b', borderRadius: '10px', fontSize: '0.875rem', whiteSpace: 'pre-line' }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          <button onClick={downloadTemplate} style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            padding: '0.55rem 1.1rem', backgroundColor: '#eef2fb', color: '#2d3f6e',
            border: '1px solid #c7d3f0', borderRadius: '10px', cursor: 'pointer',
            fontSize: '0.875rem', fontWeight: 600
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Descargar Plantilla
          </button>
          <p style={{ fontSize: '0.8rem', color: '#888', margin: 0 }}>
            Columnas: <strong>Código</strong> (tienda existente) + <strong>MI ID</strong> (nuevo propietario)
          </p>
        </div>

        {/* Zona drag & drop */}
        <label
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            gap: '0.6rem', padding: '2rem', marginBottom: '1.5rem', cursor: 'pointer',
            border: `2px dashed ${dragOver ? '#5470c6' : '#c7d3f0'}`,
            borderRadius: '12px',
            backgroundColor: dragOver ? '#eef2fb' : '#f8f9fb',
            transition: 'all 0.2s', textAlign: 'center'
          }}
        >
          <input type="file" accept=".xlsx,.xls" onChange={handleFileChange} style={{ display: 'none' }} />
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#5470c6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <path d="M12 18v-6"/><polyline points="9 15 12 12 15 15"/>
          </svg>
          {file ? (
            <>
              <span style={{ fontWeight: 600, color: '#1a2340', fontSize: '0.95rem' }}>{file.name}</span>
              <span style={{ fontSize: '0.8rem', color: '#888' }}>Haz clic o arrastra otro archivo para reemplazarlo</span>
            </>
          ) : (
            <>
              <span style={{ fontWeight: 600, color: '#1a2340', fontSize: '0.95rem' }}>
                Arrastra tu archivo Excel aquí
              </span>
              <span style={{ fontSize: '0.85rem', color: '#888' }}>o haz clic para seleccionarlo (.xlsx, .xls)</span>
            </>
          )}
        </label>

        {previewData.length > 0 && (
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ marginBottom: '0.75rem', color: '#1a2340', fontSize: '0.95rem' }}>Vista Previa ({previewData.length} reasignaciones)</h3>
            <div style={{ maxHeight: '280px', overflowY: 'auto', border: '1px solid #e5e5e5', borderRadius: '10px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                <thead style={{ position: 'sticky', top: 0 }}>
                  <tr style={{ backgroundColor: '#f8f9fa' }}>
                    <th style={{ padding: '0.6rem 1rem', textAlign: 'left', borderBottom: '2px solid #e5e5e5', color: '#495057' }}>Código de Tienda</th>
                    <th style={{ padding: '0.6rem 1rem', textAlign: 'left', borderBottom: '2px solid #e5e5e5', color: '#495057' }}>MI ID (nuevo propietario)</th>
                  </tr>
                </thead>
                <tbody>
                  {previewData.map((row, index) => (
                    <tr key={index} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '0.6rem 1rem', color: '#333' }}>{row.store_code}</td>
                      <td style={{ padding: '0.6rem 1rem', color: '#333' }}>{row.mi_id}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: '1rem' }}>
          <button onClick={handleImport} disabled={loading || previewData.length === 0} style={{
            flex: 1, padding: '0.8rem', border: 'none', borderRadius: '10px',
            cursor: (loading || previewData.length === 0) ? 'not-allowed' : 'pointer',
            background: (loading || previewData.length === 0) ? '#adb5bd' : 'linear-gradient(135deg, #5470c6, #2d3f6e)',
            color: 'white', fontSize: '1rem', fontWeight: 'bold',
            boxShadow: previewData.length > 0 ? '0 4px 14px rgba(84,112,198,0.3)' : 'none'
          }}>
            {loading ? 'Procesando...' : 'Reasignar Tiendas'}
          </button>
          <button onClick={onCancel} style={{
            flex: 1, padding: '0.8rem', backgroundColor: 'white', color: '#555',
            border: '1px solid #ddd', borderRadius: '10px', cursor: 'pointer',
            fontSize: '1rem', fontWeight: 'bold'
          }}>
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}

export default StoreBatchAssignImport;
