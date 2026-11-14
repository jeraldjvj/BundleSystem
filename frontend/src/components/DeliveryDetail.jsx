import { useState, useEffect } from 'react';
import * as XLSX from 'xlsx-js-style';
import { reportService } from '../services/api';
import { useAuth } from '../context/AuthContext';

const API_BASE = `http://${window.location.hostname}:3000`;

function DeliveryDetail() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [previewImg, setPreviewImg] = useState(null);
  const [detailDelivery, setDetailDelivery] = useState(null);
  const [deliveryFilters, setDeliveryFilters] = useState({});
  const [deliveryActiveFilter, setDeliveryActiveFilter] = useState(null);

  const level = user?.levelUser?.toLowerCase();
  const canSeeProfiles = level !== 'field force';

  useEffect(() => {
    const load = async () => {
      try {
        const res = await reportService.getSummary();
        setData(res.data);
      } catch (err) {
        setError('Error al cargar las entregas: ' + (err.response?.data?.error || err.message));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  if (loading) return <div style={{ textAlign: 'center', padding: '2rem' }}>Cargando entregas…</div>;
  if (error) return <div style={{ padding: '1rem', backgroundColor: '#f8d7da', color: '#721c24', borderRadius: '4px' }}>{error}</div>;

  const deliveryColumns = [
    { key: 'cliente', label: 'Cliente', value: d => d.client_full_name },
    { key: 'tienda', label: 'Tienda', value: d => d.store_name },
    { key: 'usuario', label: 'Usuario', value: d => d.delivered_by },
    { key: 'sn', label: 'SN del Bandeo', value: d => d.serial_number },
    { key: 'imei', label: 'IMEI', value: d => d.imei_1 },
    { key: 'ciudad', label: 'Ciudad', value: d => d.city },
    { key: 'fecha', label: 'Fecha de Entrega', value: d => new Date(d.create_time).toISOString().substring(0, 10) },
  ];
  const filteredDeliveries = data.deliveriesList.filter(d =>
    deliveryColumns.every(c => {
      const f = (deliveryFilters[c.key] || '').toLowerCase();
      if (!f) return true;
      return String(c.value(d) ?? '').toLowerCase().includes(f);
    })
  );

  const exportToExcel = () => {
    const exportCols = [
      { label: 'Nombre de Cliente', value: d => d.client_full_name },
      { label: 'Telefono del Cliente', value: d => d.client_phone },
      { label: 'Nombre de Tienda', value: d => d.store_name },
      { label: 'Codigo de Tienda', value: d => d.store_code },
      { label: 'Nombre de Usuario', value: d => d.delivered_by, onlyAdmin: true },
      { label: 'Mi ID', value: d => d.mi_id, onlyAdmin: true },
      { label: 'SN del Bandeo', value: d => d.serial_number },
      { label: 'Modelo de Bandeo', value: d => d.bundle_name },
      { label: 'IMEI', value: d => d.imei_1 },
      { label: 'Modelo Smartphone', value: d => d.model_name },
      { label: 'Ciudad', value: d => d.city, onlyAdmin: true },
    ].filter(c => canSeeProfiles || !c.onlyAdmin);
    const headers = ['Nº', ...exportCols.map(c => c.label), 'Enlace de Foto de Entrega al Cliente', 'Fecha de Entrega'];
    const rows = filteredDeliveries.map((d, i) => [
      i + 1,
      ...exportCols.map(c => c.value(d) || '—'),
      d.client_picture ? `${API_BASE}/${d.client_picture}` : '—',
      (() => { const t = new Date(d.create_time); const p = n => String(n).padStart(2, '0'); return `${t.getFullYear()}-${p(t.getMonth() + 1)}-${p(t.getDate())} ${p(t.getHours())}:${p(t.getMinutes())}:${p(t.getSeconds())}`; })(),
    ]);
    const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    // Links clickeables en la columna Foto
    const fotoCol = headers.indexOf('Enlace de Foto de Entrega al Cliente');
    filteredDeliveries.forEach((d, i) => {
      if (d.client_picture) {
        const cell = ws[XLSX.utils.encode_cell({ r: i + 1, c: fotoCol })];
        if (cell) cell.l = { Target: `${API_BASE}/${d.client_picture}` };
      }
    });
    ws['!cols'] = headers.map((_, i) => ({ wch: i === 0 ? 5 : i === fotoCol ? 40 : 22 }));
    const headerStyle = {
      fill: { fgColor: { rgb: '2D3F6E' } },
      font: { color: { rgb: 'FFFFFF' }, bold: true, sz: 11 },
      alignment: { horizontal: 'center', vertical: 'center' }
    };
    headers.forEach((_, i) => {
      const cell = ws[XLSX.utils.encode_cell({ r: 0, c: i })];
      if (cell) cell.s = headerStyle;
    });
    ws['!rows'] = [{ hpt: 22 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Entregas');
    const now = new Date();
    const p = n => String(n).padStart(2, '0');
    const stamp = `${now.getFullYear()}-${p(now.getMonth() + 1)}-${p(now.getDate())}_${p(now.getHours())}-${p(now.getMinutes())}-${p(now.getSeconds())}`;
    XLSX.writeFile(wb, `detalle_entregas_${stamp}.xlsx`);
  };

  return (
    <div style={{ padding: '1rem', width: '100%', boxSizing: 'border-box' }}>
      {/* Lista de entregas */}
      <div style={{ backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', padding: '1.25rem', minWidth: 0, boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <h3 style={{ margin: 0, color: '#1a2340', fontSize: '1rem' }}>Entregas Registradas ({filteredDeliveries.length} de {data.deliveriesList.length})</h3>
          <button
            onClick={exportToExcel}
            disabled={filteredDeliveries.length === 0}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.55rem 1.1rem', borderRadius: '10px', cursor: filteredDeliveries.length === 0 ? 'not-allowed' : 'pointer',
              fontSize: '0.85rem', fontWeight: 600, backgroundColor: '#eef2fb', color: '#2d3f6e', border: '1px solid #c7d3f0'
            }}
            title="Exportar las entregas mostradas a Excel"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Exportar
          </button>
        </div>
        {data.deliveriesList.length === 0 ? (
          <p style={{ color: '#666' }}>No hay entregas registradas.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', tableLayout: 'auto', minWidth: '800px' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #eee' }}>
                  <th style={{ padding: '0.9rem 0.5rem', width: '48px', textAlign: 'center', color: '#495057', fontWeight: 'bold', fontSize: '0.85rem', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>Nº</th>
                  {deliveryColumns.filter(col => col.key !== 'fecha' && (canSeeProfiles || (col.key !== 'usuario' && col.key !== 'ciudad'))).map(col => (
                    <th key={col.key} style={{ padding: '0.9rem 1.25rem', textAlign: 'left', color: '#495057', fontWeight: 'bold', fontSize: '0.85rem', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span>{col.label}</span>
                        <button
                          onClick={() => setDeliveryActiveFilter(deliveryActiveFilter === col.key ? null : col.key)}
                          style={{ padding: '0.25rem', backgroundColor: 'transparent', border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', color: deliveryFilters[col.key] ? '#5470c6' : '#6c757d' }}
                          title={`Buscar en ${col.label}`}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="11" cy="11" r="8"></circle>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                          </svg>
                        </button>
                      </div>
                      {deliveryActiveFilter === col.key && (
                        <input
                          type="text"
                          autoFocus
                          placeholder={`Buscar ${col.label}...`}
                          value={deliveryFilters[col.key] || ''}
                          onChange={(e) => setDeliveryFilters(prev => ({ ...prev, [col.key]: e.target.value }))}
                          style={{ width: '100%', marginTop: '0.5rem', padding: '0.35rem 0.6rem', border: '1px solid #e0e0e0', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 'normal', boxSizing: 'border-box', backgroundColor: '#f8f9fa', color: '#333', colorScheme: 'light', outline: 'none' }}
                        />
                      )}
                    </th>
                  ))}
                  <th style={{ padding: '0.9rem 1.25rem', textAlign: 'center', color: '#495057', fontWeight: 'bold', fontSize: '0.85rem', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>Foto</th>
                  <th style={{ padding: '0.9rem 1.25rem', textAlign: 'left', color: '#495057', fontWeight: 'bold', fontSize: '0.85rem', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span>Fecha de Entrega</span>
                      <button
                        onClick={() => setDeliveryActiveFilter(deliveryActiveFilter === 'fecha' ? null : 'fecha')}
                        style={{ padding: '0.25rem', backgroundColor: 'transparent', border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', color: deliveryFilters['fecha'] ? '#5470c6' : '#6c757d' }}
                        title="Filtrar por fecha"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                          <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                        </svg>
                      </button>
                    </div>
                    {deliveryActiveFilter === 'fecha' && (
                      <input
                        type="date"
                        autoFocus
                        value={deliveryFilters['fecha'] || ''}
                        onChange={(e) => setDeliveryFilters(prev => ({ ...prev, fecha: e.target.value }))}
                        style={{ width: '100%', marginTop: '0.5rem', padding: '0.35rem 0.6rem', border: '1px solid #e0e0e0', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 'normal', boxSizing: 'border-box', backgroundColor: '#f8f9fa', color: '#333', colorScheme: 'light', outline: 'none' }}
                      />
                    )}
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredDeliveries.map((d, i) => (
                  <tr key={d.bundle_delivered_id} style={{ borderBottom: '1px solid #f0f0f0' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fb'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                    <td style={{ padding: '0.5rem', textAlign: 'center', color: '#666' }}>{i + 1}</td>
                    <td
                      style={{ padding: '0.5rem', color: '#333', fontWeight: 500, cursor: 'pointer', transition: 'color 0.15s' }}
                      onClick={() => setDetailDelivery(d)}
                      onMouseEnter={(e) => { e.currentTarget.style.color = '#000'; e.currentTarget.style.fontWeight = 'bold'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.color = '#333'; e.currentTarget.style.fontWeight = '500'; }}
                      title="Ver detalle de la entrega"
                    >
                      {d.client_full_name}
                    </td>
                    <td style={{ padding: '0.5rem', color: '#666' }}>{d.store_name}</td>
                    {canSeeProfiles && <td style={{ padding: '0.5rem', color: '#666' }}>{d.delivered_by || '-'}</td>}
                    <td style={{ padding: '0.5rem', color: '#666' }}>{d.serial_number || '-'}</td>
                    <td style={{ padding: '0.5rem', color: '#666' }}>{d.imei_1 || '-'}</td>
                    {canSeeProfiles && <td style={{ padding: '0.5rem', color: '#666' }}>{d.city || '-'}</td>}
                    <td style={{ padding: '0.5rem', textAlign: 'center' }}>
                      {d.client_picture ? (
                        <img
                          src={`${API_BASE}/${d.client_picture}`}
                          alt="Cliente"
                          onClick={() => setPreviewImg(`${API_BASE}/${d.client_picture}`)}
                          style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #ddd', cursor: 'pointer' }}
                          title="Clic para ampliar"
                        />
                      ) : '—'}
                    </td>
                    <td style={{ padding: '0.5rem', color: '#333' }}>
                      {new Date(d.create_time).toLocaleString()}
                    </td>
                  </tr>
                ))}
                {filteredDeliveries.length === 0 && (
                  <tr>
                    <td colSpan="9" style={{ padding: '1.5rem', textAlign: 'center', color: '#999', fontSize: '0.9rem' }}>
                      No se encontraron resultados para los filtros aplicados
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detalle completo de la entrega */}
      {detailDelivery && (
        <div
          onClick={() => setDetailDelivery(null)}
          style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            zIndex: 2000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              padding: '1.5rem',
              maxWidth: '480px',
              width: '90%',
              maxHeight: '90vh',
              overflowY: 'auto',
              position: 'relative'
            }}
          >
            <button
              onClick={() => setDetailDelivery(null)}
              style={{
                position: 'absolute', top: '10px', right: '10px',
                width: '32px', height: '32px', borderRadius: '50%',
                border: 'none', backgroundColor: '#dc3545', color: 'white',
                fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}
              title="Cerrar"
            >
              ✕
            </button>
            <h3 style={{ marginTop: 0, color: '#333' }}>Detalle de Entrega</h3>
            {detailDelivery.client_picture && (
              <img
                src={`${API_BASE}/${detailDelivery.client_picture}`}
                alt="Cliente"
                onClick={() => setPreviewImg(`${API_BASE}/${detailDelivery.client_picture}`)}
                style={{ width: '120px', height: '120px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #ddd', marginBottom: '1rem', cursor: 'pointer' }}
                title="Clic para ampliar"
              />
            )}
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
              <tbody>
                {[
                  ['Cliente', detailDelivery.client_full_name],
                  ['Teléfono', detailDelivery.client_phone],
                  ['Serial del Bandeo', detailDelivery.serial_number],
                  ['Modelo de Bandeo', detailDelivery.bundle_name],
                  ['IMEI', detailDelivery.imei_1],
                  ['Modelo Smartphone', detailDelivery.model_name],
                  ['Store', `${detailDelivery.store_name} (${detailDelivery.store_code})`],
                  ['Entregado por', detailDelivery.delivered_by || `Usuario #${detailDelivery.user_id}`],
                  ['Fecha de Entrega', new Date(detailDelivery.create_time).toLocaleString()],
                ].map(([label, value]) => (
                  <tr key={label} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '0.5rem', fontWeight: 'bold', color: '#495057', width: '45%' }}>{label}</td>
                    <td style={{ padding: '0.5rem', color: '#333' }}>{value || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Visor de foto ampliada */}
      {previewImg && (
        <div
          onClick={() => setPreviewImg(null)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            zIndex: 2000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <div onClick={(e) => e.stopPropagation()} style={{ position: 'relative', maxWidth: '90%', maxHeight: '90%' }}>
            <img
              src={previewImg}
              alt="Foto del cliente"
              style={{ maxWidth: '100%', maxHeight: '85vh', borderRadius: '8px', display: 'block' }}
            />
            <button
              onClick={() => setPreviewImg(null)}
              style={{
                position: 'absolute',
                top: '-14px',
                right: '-14px',
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                border: 'none',
                backgroundColor: '#dc3545',
                color: 'white',
                fontSize: '1.1rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(0,0,0,0.4)'
              }}
              title="Cerrar"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default DeliveryDetail;
