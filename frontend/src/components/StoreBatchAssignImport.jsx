import { useState } from 'react';
import * as XLSX from 'xlsx';
import { storeService, userService } from '../services/api';

function StoreBatchAssignImport({ onImportComplete, onCancel }) {
  const [file, setFile] = useState(null);
  const [previewData, setPreviewData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    setError('');
    setSuccess('');

    if (selectedFile) {
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
    }
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
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Plantilla');
    XLSX.writeFile(wb, 'plantilla_reasignar_tiendas.xlsx');
  };

  return (
    <div style={{ maxWidth: '800px', margin: '2rem auto', padding: '2rem', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: 'white' }}>
      <h2>Batch Reasignar Tiendas desde Excel</h2>
      <p style={{ color: '#666', marginBottom: '1.5rem' }}>
        Cambia el propietario de varias tiendas a la vez. El archivo solo necesita dos columnas: el código de la tienda y el MI ID del nuevo propietario.
      </p>

      {success && (
        <div style={{ padding: '1rem', marginBottom: '1rem', backgroundColor: '#d4edda', color: '#155724', borderRadius: '4px' }}>
          {success}
        </div>
      )}

      {error && (
        <div style={{ padding: '1rem', marginBottom: '1rem', backgroundColor: '#f8d7da', color: '#721c24', borderRadius: '4px', whiteSpace: 'pre-line' }}>
          {error}
        </div>
      )}

      <div style={{ marginBottom: '1.5rem' }}>
        <button
          onClick={downloadTemplate}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#17a2b8',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '0.875rem',
            marginBottom: '1rem'
          }}
        >
          📥 Descargar Plantilla
        </button>
        <p style={{ fontSize: '0.875rem', color: '#666', marginTop: '0.5rem' }}>
          Columnas requeridas: <strong>Código</strong> (código de la tienda existente) y <strong>MI ID</strong> (del nuevo propietario).
        </p>
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <label htmlFor="file" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
          Seleccionar archivo Excel:
        </label>
        <input
          type="file"
          id="file"
          accept=".xlsx,.xls"
          onChange={handleFileChange}
          style={{ width: '100%', padding: '0.5rem' }}
        />
      </div>

      {previewData.length > 0 && (
        <div style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ marginBottom: '1rem' }}>Vista Previa ({previewData.length} reasignaciones)</h3>
          <div style={{ maxHeight: '300px', overflowY: 'auto', border: '1px solid #dee2e6', borderRadius: '4px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead style={{ position: 'sticky', top: 0, backgroundColor: '#f8f9fa' }}>
                <tr>
                  <th style={{ padding: '0.5rem', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Código de Tienda</th>
                  <th style={{ padding: '0.5rem', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>MI ID (nuevo propietario)</th>
                </tr>
              </thead>
              <tbody>
                {previewData.map((row, index) => (
                  <tr key={index} style={{ borderBottom: '1px solid #dee2e6' }}>
                    <td style={{ padding: '0.5rem' }}>{row.store_code}</td>
                    <td style={{ padding: '0.5rem' }}>{row.mi_id}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
        <button
          onClick={handleImport}
          disabled={loading || previewData.length === 0}
          style={{
            flex: 1,
            padding: '0.75rem',
            backgroundColor: loading ? '#6c757d' : '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '1rem',
            fontWeight: 'bold'
          }}
        >
          {loading ? 'Procesando...' : 'Reasignar Tiendas'}
        </button>
        <button
          onClick={onCancel}
          style={{
            flex: 1,
            padding: '0.75rem',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '1rem',
            fontWeight: 'bold'
          }}
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}

export default StoreBatchAssignImport;
