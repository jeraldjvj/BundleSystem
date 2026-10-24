import { useState } from 'react';
import * as XLSX from 'xlsx';
import JSZip from 'jszip';
import { smartphoneService, smartphoneModelService, distributorService } from '../services/api';

function SmartphoneImport({ onImportComplete, onCancel }) {
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
            imei_1: String(row['IMEI 1'] || row['IMEI'] || row['imei_1'] || ''),
            product_id: String(row['Product ID'] || row['product_id'] || ''),
            distributor_name: String(row['Distribuidor'] || row['Distributor'] || row['distributor_name'] || ''),
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
      // Cargar datos para los lookups
      const [modelsResponse, distributorsResponse] = await Promise.all([
        smartphoneModelService.getSmartphoneModels(),
        distributorService.getDistributors(),
      ]);
      const models = modelsResponse.data;
      const distributors = distributorsResponse.data;

      let successCount = 0;
      let errorCount = 0;
      const errors = [];

      for (const smartphone of previewData) {
        try {
          // Lookup modelo por Product ID
          const model = models.find(m => String(m.productId) === smartphone.product_id);
          if (!model) {
            errorCount++;
            errors.push(`${smartphone.imei_1}: Product ID "${smartphone.product_id}" no encontrado`);
            continue;
          }

          // Lookup distribuidor por nombre
          const distributor = distributors.find(d => String(d.distributorName).toLowerCase() === smartphone.distributor_name.toLowerCase());
          if (!distributor) {
            errorCount++;
            errors.push(`${smartphone.imei_1}: Distribuidor "${smartphone.distributor_name}" no encontrado`);
            continue;
          }

          const smartphoneData = {
            smartphone_model_id: model.smartphoneModelId,
            tag_model: smartphone.imei_1.slice(0, 8),
            imei_1: smartphone.imei_1,
            distributor_id: distributor.distributorId,
            status: 'available',
          };

          await smartphoneService.createSmartphone(smartphoneData);
          successCount++;
        } catch (err) {
          errorCount++;
          errors.push(`${smartphone.imei_1}: ${err.response?.data?.error || err.message}`);
        }
      }

      if (errorCount > 0) {
        setError(`Importación parcial: ${successCount} exitosas, ${errorCount} fallidas. Errores: ${errors.join(', ')}`);
      } else {
        setSuccess(`Se importaron ${successCount} smartphones exitosamente!`);
        setTimeout(() => {
          onImportComplete();
        }, 1500);
      }
    } catch (err) {
      setError('Error al importar smartphones: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const downloadTemplate = async () => {
    try {
      const [modelsRes, distributorsRes] = await Promise.all([
        smartphoneModelService.getSmartphoneModels(),
        distributorService.getDistributors(),
      ]);
      const productIds = modelsRes.data.map(m => String(m.productId));
      const distributorNames = distributorsRes.data.map(d => d.distributorName);

      // Hoja principal con encabezados y fila de ejemplo
      const ws = XLSX.utils.aoa_to_sheet([
        ['IMEI 1', 'Product ID', 'Distribuidor'],
        ['860000000000001', productIds[0] || '', distributorNames[0] || ''],
        ['860000000000002', productIds[0] || '', distributorNames[0] || ''],
      ]);

      // Hoja oculta con las listas para los desplegables
      const listsData = [['Product IDs', 'Distribuidores']];
      const maxLen = Math.max(productIds.length, distributorNames.length);
      for (let i = 0; i < maxLen; i++) {
        listsData.push([productIds[i] || '', distributorNames[i] || '']);
      }
      const listsWs = XLSX.utils.aoa_to_sheet(listsData);

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Smartphones');
      XLSX.utils.book_append_sheet(wb, listsWs, 'Listas');

      const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });

      // Inyectar validaciones de datos (listas desplegables) en la hoja principal
      const zip = await JSZip.loadAsync(wbout);
      let sheetXml = await zip.file('xl/worksheets/sheet1.xml').async('string');

      const validations = [];
      if (productIds.length > 0) {
        validations.push(
          `<dataValidation type="list" allowBlank="1" showErrorMessage="1" sqref="B2:B1000"><formula1>Listas!$A$2:$A$${productIds.length + 1}</formula1></dataValidation>`
        );
      }
      if (distributorNames.length > 0) {
        validations.push(
          `<dataValidation type="list" allowBlank="1" showErrorMessage="1" sqref="C2:C1000"><formula1>Listas!$B$2:$B$${distributorNames.length + 1}</formula1></dataValidation>`
        );
      }

      if (validations.length > 0) {
        const dvXml = `<dataValidations count="${validations.length}">${validations.join('')}</dataValidations>`;
        sheetXml = sheetXml.includes('<ignoredErrors>')
          ? sheetXml.replace('<ignoredErrors>', `${dvXml}<ignoredErrors>`)
          : sheetXml.replace('</worksheet>', `${dvXml}</worksheet>`);
        zip.file('xl/worksheets/sheet1.xml', sheetXml);
      }

      // Ocultar la hoja de listas
      let workbookXml = await zip.file('xl/workbook.xml').async('string');
      workbookXml = workbookXml.replace('<sheet name="Listas"', '<sheet name="Listas" state="hidden"');
      zip.file('xl/workbook.xml', workbookXml);

      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'plantilla_smartphones.xlsx';
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError('Error al generar la plantilla: ' + err.message);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '2rem auto', padding: '2rem', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: 'white' }}>
      <h2>Importar Smartphones desde Excel</h2>

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
          Descarga la plantilla para ver el formato requerido. Las columnas deben ser: IMEI 1, Product ID, Distribuidor.
          Las columnas Product ID y Distribuidor tienen listas desplegables con los valores existentes.
          El Tag Model se genera automáticamente con los primeros 8 dígitos del IMEI y el estado queda como "available".
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
          <h3 style={{ marginBottom: '1rem' }}>Vista Previa ({previewData.length} smartphones)</h3>
          <div style={{ maxHeight: '300px', overflowY: 'auto', border: '1px solid #dee2e6', borderRadius: '4px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead style={{ position: 'sticky', top: 0, backgroundColor: '#f8f9fa' }}>
                <tr>
                  <th style={{ padding: '0.5rem', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>IMEI 1</th>
                  <th style={{ padding: '0.5rem', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Product ID</th>
                  <th style={{ padding: '0.5rem', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Distribuidor</th>
                </tr>
              </thead>
              <tbody>
                {previewData.map((s, index) => (
                  <tr key={index} style={{ borderBottom: '1px solid #dee2e6' }}>
                    <td style={{ padding: '0.5rem' }}>{s.imei_1}</td>
                    <td style={{ padding: '0.5rem' }}>{s.product_id}</td>
                    <td style={{ padding: '0.5rem' }}>{s.distributor_name}</td>
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
          {loading ? 'Importando...' : 'Importar Smartphones'}
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

export default SmartphoneImport;
