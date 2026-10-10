import { useState } from 'react';
import * as XLSX from 'xlsx';
import { storeService, userService } from '../services/api';

function StoreImport({ onImportComplete, onCancel }) {
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
          
          // Transformar datos al formato esperado
          const transformedData = jsonData.map(row => ({
            store_code: row['Código'] || row['store_code'] || row['Código de Tienda'] || '',
            store_name: row['Nombre'] || row['store_name'] || row['Nombre de Tienda'] || '',
            rms_store_code: row['Código RMS'] || row['rms_store_code'] || '',
            mi_id: row['MI ID'] || row['mi_id'] || row['Usuario ID'] || row['user_id'] || row['ID de Usuario'] || '',
            city: row['Ciudad'] || row['city'] || ''
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
      // Obtener todos los usuarios para hacer el lookup de MI ID
      const usersResponse = await userService.getUsers();
      const users = usersResponse.data;
      
      // Importar una por una
      let successCount = 0;
      let errorCount = 0;
      const errors = [];

      for (const store of previewData) {
        try {
          // Buscar user_id por mi_id (convertir a string para comparación)
          const user = users.find(u => String(u.miId) === String(store.mi_id));
          
          if (!user) {
            errorCount++;
            errors.push(`${store.store_code}: MI ID ${store.mi_id} no encontrado`);
            continue;
          }

          const storeData = {
            store_code: store.store_code,
            user_id: user.userId,
            rms_store_code: store.rms_store_code,
            store_name: store.store_name,
            city: store.city,
          };

          await storeService.createStore(storeData);
          successCount++;
        } catch (err) {
          errorCount++;
          errors.push(`${store.store_code}: ${err.response?.data?.message || err.message}`);
        }
      }

      if (errorCount > 0) {
        setError(`Importación parcial: ${successCount} exitosas, ${errorCount} fallidas. Errores: ${errors.join(', ')}`);
      } else {
        setSuccess(`Se importaron ${successCount} tiendas exitosamente!`);
        setTimeout(() => {
          onImportComplete();
        }, 1500);
      }
    } catch (err) {
      setError('Error al importar tiendas: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const downloadTemplate = () => {
    const template = [
      {
        'Código': 'STORE001',
        'Nombre': 'Tienda Centro',
        'Código RMS': 'RMS001',
        'MI ID': '6846878912',
        'Ciudad': 'Santa Cruz'
      },
      {
        'Código': 'STORE002',
        'Nombre': 'Tienda Norte',
        'Código RMS': 'RMS002',
        'MI ID': '6846878912',
        'Ciudad': 'La Paz'
      }
    ];

    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Plantilla');
    XLSX.writeFile(wb, 'plantilla_tiendas.xlsx');
  };

  return (
    <div style={{ maxWidth: '800px', margin: '2rem auto', padding: '2rem', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: 'white' }}>
      <h2>Importar Tiendas desde Excel</h2>
      
      {success && (
        <div style={{ padding: '1rem', marginBottom: '1rem', backgroundColor: '#d4edda', color: '#155724', borderRadius: '4px' }}>
          {success}
        </div>
      )}
      
      {error && (
        <div style={{ padding: '1rem', marginBottom: '1rem', backgroundColor: '#f8d7da', color: '#721c24', borderRadius: '4px' }}>
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
          Descarga la plantilla para ver el formato requerido. Las columnas deben ser: Código, Nombre, Código RMS, MI ID
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
          <h3 style={{ marginBottom: '1rem' }}>Vista Previa ({previewData.length} tiendas)</h3>
          <div style={{ maxHeight: '300px', overflowY: 'auto', border: '1px solid #dee2e6', borderRadius: '4px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead style={{ position: 'sticky', top: 0, backgroundColor: '#f8f9fa' }}>
                <tr>
                  <th style={{ padding: '0.5rem', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Código</th>
                  <th style={{ padding: '0.5rem', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Nombre</th>
                  <th style={{ padding: '0.5rem', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Código RMS</th>
                  <th style={{ padding: '0.5rem', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>MI ID</th>
                  <th style={{ padding: '0.5rem', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Ciudad</th>
                </tr>
              </thead>
              <tbody>
                {previewData.map((store, index) => (
                  <tr key={index} style={{ borderBottom: '1px solid #dee2e6' }}>
                    <td style={{ padding: '0.5rem' }}>{store.store_code}</td>
                    <td style={{ padding: '0.5rem' }}>{store.store_name}</td>
                    <td style={{ padding: '0.5rem' }}>{store.rms_store_code}</td>
                    <td style={{ padding: '0.5rem' }}>{store.mi_id}</td>
                    <td style={{ padding: '0.5rem' }}>{store.city}</td>
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
          {loading ? 'Importando...' : 'Importar Tiendas'}
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

export default StoreImport;
