import { useState } from 'react';
import * as XLSX from 'xlsx-js-style';
import JSZip from 'jszip';
import { smartphoneService, smartphoneModelService, distributorService } from '../services/api';

function SmartphoneImport({ onImportComplete, onCancel }) {
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
          const model = models.find(m => String(m.productId) === smartphone.product_id);
          if (!model) {
            errorCount++;
            errors.push(`${smartphone.imei_1}: Product ID "${smartphone.product_id}" no encontrado`);
            continue;
          }

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
        setError(`Importación parcial: ${successCount} exitosas, ${errorCount} fallidas.\n${errors.join('\n')}`);
        if (successCount > 0) setTimeout(() => onImportComplete(), 3000);
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

      const ws = XLSX.utils.aoa_to_sheet([
        ['IMEI 1', 'Product ID', 'Distribuidor'],
        ['860000000000001', productIds[0] || '', distributorNames[0] || ''],
        ['860000000000002', productIds[0] || '', distributorNames[0] || ''],
      ]);
      ws['!cols'] = [{ wch: 24 }, { wch: 24 }, { wch: 24 }];
      const headerStyle = {
        fill: { fgColor: { rgb: '2D3F6E' } },
        font: { color: { rgb: 'FFFFFF' }, bold: true, sz: 12 },
        alignment: { horizontal: 'center', vertical: 'center' }
      };
      ['A1', 'B1', 'C1'].forEach(c => { ws[c].s = headerStyle; });
      ws['!rows'] = [{ hpt: 24 }];

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
    <div style={{ maxWidth: '720px', margin: '2rem auto', backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 8px 30px rgba(0,0,0,0.08)', overflow: 'hidden', width: '100%', boxSizing: 'border-box' }}>
      <div style={{ background: 'linear-gradient(135deg, #1a2340, #2d3f6e)', padding: '1.5rem 2rem', color: 'white' }}>
        <h2 style={{ margin: 0, fontSize: '1.25rem' }}>Importar Smartphones desde Excel</h2>
        <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', opacity: 0.75 }}>
          El Tag Model se genera con los primeros 8 dígitos del IMEI y el estado queda como available
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
            Columnas: <strong>IMEI 1</strong>, <strong>Product ID</strong>, <strong>Distribuidor</strong> (con listas desplegables)
          </p>
        </div>

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
            <h3 style={{ marginBottom: '0.75rem', color: '#1a2340', fontSize: '0.95rem' }}>Vista Previa ({previewData.length} smartphones)</h3>
            <div style={{ maxHeight: '280px', overflowY: 'auto', border: '1px solid #e5e5e5', borderRadius: '10px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                <thead style={{ position: 'sticky', top: 0 }}>
                  <tr style={{ backgroundColor: '#f8f9fa' }}>
                    <th style={{ padding: '0.6rem 1rem', textAlign: 'left', borderBottom: '2px solid #e5e5e5', color: '#495057' }}>IMEI 1</th>
                    <th style={{ padding: '0.6rem 1rem', textAlign: 'left', borderBottom: '2px solid #e5e5e5', color: '#495057' }}>Product ID</th>
                    <th style={{ padding: '0.6rem 1rem', textAlign: 'left', borderBottom: '2px solid #e5e5e5', color: '#495057' }}>Distribuidor</th>
                  </tr>
                </thead>
                <tbody>
                  {previewData.map((sm, index) => (
                    <tr key={index} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '0.6rem 1rem', color: '#333' }}>{sm.imei_1}</td>
                      <td style={{ padding: '0.6rem 1rem', color: '#333' }}>{sm.product_id}</td>
                      <td style={{ padding: '0.6rem 1rem', color: '#333' }}>{sm.distributor_name}</td>
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
            {loading ? 'Importando...' : 'Importar Smartphones'}
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

export default SmartphoneImport;
