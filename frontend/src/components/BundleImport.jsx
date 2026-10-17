import { useState } from 'react';
import * as XLSX from 'xlsx';
import JSZip from 'jszip';
import { bundleService, projectService, bundleModelService } from '../services/api';
import { useAuth } from '../context/AuthContext';

function BundleImport({ onImportComplete, onCancel }) {
  const { user } = useAuth();
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
            serial_number: String(row['Serial Number'] || row['Número de Serie'] || row['serial_number'] || ''),
            project_name: String(row['Proyecto'] || row['Project'] || row['project_name'] || ''),
            bundle_model_name: String(row['Modelo de Bundle'] || row['Bundle Model'] || row['bundle_model_name'] || ''),
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
      const [projectsResponse, bundleModelsResponse] = await Promise.all([
        projectService.getProjects(),
        bundleModelService.getBundleModels(),
      ]);
      const projects = projectsResponse.data;
      const bundleModels = bundleModelsResponse.data;

      let successCount = 0;
      let errorCount = 0;
      const errors = [];

      for (const bundle of previewData) {
        try {
          // Lookup project por nombre
          const project = projects.find(p => String(p.projectName).toLowerCase() === bundle.project_name.toLowerCase());
          if (!project) {
            errorCount++;
            errors.push(`${bundle.serial_number}: Proyecto "${bundle.project_name}" no encontrado`);
            continue;
          }

          // Lookup bundle model por nombre
          const bundleModel = bundleModels.find(bm => String(bm.bundleName).toLowerCase() === bundle.bundle_model_name.toLowerCase());
          if (!bundleModel) {
            errorCount++;
            errors.push(`${bundle.serial_number}: Modelo de bundle "${bundle.bundle_model_name}" no encontrado`);
            continue;
          }

          const bundleData = {
            serial_number: bundle.serial_number,
            project_id: project.projectId,
            user_id: user.userId, // Usuario de la sesión activa
            bundle_model_id: bundleModel.bundleModelId,
            create_time: new Date().toISOString(),
          };

          await bundleService.createBundle(bundleData);
          successCount++;
        } catch (err) {
          errorCount++;
          errors.push(`${bundle.serial_number}: ${err.response?.data?.error || err.message}`);
        }
      }

      if (errorCount > 0) {
        setError(`Importación parcial: ${successCount} exitosas, ${errorCount} fallidas. Errores: ${errors.join(', ')}`);
      } else {
        setSuccess(`Se importaron ${successCount} bundles exitosamente!`);
        setTimeout(() => {
          onImportComplete();
        }, 1500);
      }
    } catch (err) {
      setError('Error al importar bundles: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const downloadTemplate = async () => {
    try {
      const [projectsRes, modelsRes] = await Promise.all([
        projectService.getProjects(),
        bundleModelService.getBundleModels(),
      ]);
      const projectNames = projectsRes.data.map(p => p.projectName);
      const modelNames = modelsRes.data.map(m => m.bundleName);

      // Hoja principal con encabezados y filas de ejemplo
      const ws = XLSX.utils.aoa_to_sheet([
        ['Serial Number', 'Proyecto', 'Modelo de Bundle'],
        ['BNDL001', projectNames[0] || '', modelNames[0] || ''],
        ['BNDL002', projectNames[0] || '', modelNames[0] || ''],
      ]);

      // Hoja oculta con las listas para los desplegables
      const listsData = [['Proyectos', 'Modelos de Bundle']];
      const maxLen = Math.max(projectNames.length, modelNames.length);
      for (let i = 0; i < maxLen; i++) {
        listsData.push([projectNames[i] || '', modelNames[i] || '']);
      }
      const listsWs = XLSX.utils.aoa_to_sheet(listsData);

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Bundles');
      XLSX.utils.book_append_sheet(wb, listsWs, 'Listas');

      const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });

      // Inyectar validaciones de datos (listas desplegables) en la hoja principal
      const zip = await JSZip.loadAsync(wbout);
      let sheetXml = await zip.file('xl/worksheets/sheet1.xml').async('string');

      const validations = [];
      if (projectNames.length > 0) {
        validations.push(
          `<dataValidation type="list" allowBlank="1" showErrorMessage="1" sqref="B2:B1000"><formula1>Listas!$A$2:$A$${projectNames.length + 1}</formula1></dataValidation>`
        );
      }
      if (modelNames.length > 0) {
        validations.push(
          `<dataValidation type="list" allowBlank="1" showErrorMessage="1" sqref="C2:C1000"><formula1>Listas!$B$2:$B$${modelNames.length + 1}</formula1></dataValidation>`
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
      a.download = 'plantilla_bundles.xlsx';
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError('Error al generar la plantilla: ' + err.message);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '2rem auto', padding: '2rem', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: 'white' }}>
      <h2>Importar Bundles desde Excel</h2>

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
          Descarga la plantilla para ver el formato requerido. Las columnas deben ser: Serial Number, Proyecto, Modelo de Bundle.
          Las columnas Proyecto y Modelo de Bundle tienen listas desplegables con los valores existentes.
          Los bundles se asignarán automáticamente a tu usuario.
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
          <h3 style={{ marginBottom: '1rem' }}>Vista Previa ({previewData.length} bundles)</h3>
          <div style={{ maxHeight: '300px', overflowY: 'auto', border: '1px solid #dee2e6', borderRadius: '4px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead style={{ position: 'sticky', top: 0, backgroundColor: '#f8f9fa' }}>
                <tr>
                  <th style={{ padding: '0.5rem', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Serial Number</th>
                  <th style={{ padding: '0.5rem', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Proyecto</th>
                  <th style={{ padding: '0.5rem', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Modelo de Bundle</th>
                </tr>
              </thead>
              <tbody>
                {previewData.map((bundle, index) => (
                  <tr key={index} style={{ borderBottom: '1px solid #dee2e6' }}>
                    <td style={{ padding: '0.5rem' }}>{bundle.serial_number}</td>
                    <td style={{ padding: '0.5rem' }}>{bundle.project_name}</td>
                    <td style={{ padding: '0.5rem' }}>{bundle.bundle_model_name}</td>
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
          {loading ? 'Importando...' : 'Importar Bundles'}
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

export default BundleImport;
