import { useState, useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import { reportService } from '../services/api';
import { useAuth } from '../context/AuthContext';

const API_BASE = 'http://localhost:3000';

const PALETTE = ['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de', '#3ba272', '#fc8452', '#9a60b4'];

const useChart = (option, deps = []) => {
  const ref = useRef(null);
  useEffect(() => {
    if (!ref.current || !option) return;
    const chart = echarts.init(ref.current);
    chart.setOption(option);
    const onResize = () => chart.resize();
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      chart.dispose();
    };
  }, [option, ...deps]);
  return ref;
};

const cardStyle = {
  backgroundColor: 'white',
  borderRadius: '8px',
  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  padding: '1.25rem'
};

const kpiCard = (color) => ({
  ...cardStyle,
  borderLeft: `4px solid ${color}`,
  flex: '1 1 150px',
  minWidth: '140px'
});

function ReportsDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [previewImg, setPreviewImg] = useState(null);
  const [detailDelivery, setDetailDelivery] = useState(null);
  const [mapReady, setMapReady] = useState(false);

  // Registra el mapa de Bolivia en ECharts una sola vez
  useEffect(() => {
    fetch('/bolivia-departamentos.geojson')
      .then(r => r.json())
      .then(geo => {
        echarts.registerMap('bolivia', geo);
        setMapReady(true);
      })
      .catch(() => setError('No se pudo cargar el mapa de Bolivia'));
  }, []);

  const level = user?.levelUser?.toLowerCase();
  const scopeLabel = level === 'field force'
    ? 'Mostrando solo tus datos'
    : level === 'city manager'
      ? 'Mostrando tus datos y los de tu equipo'
      : 'Mostrando todos los datos';

  useEffect(() => {
    const load = async () => {
      try {
        const res = await reportService.getSummary(user);
        setData(res.data);
      } catch (err) {
        setError('Error al cargar el reporte: ' + (err.response?.data?.error || err.message));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  const pieOption = (title, rows, center, nameKey = 'status') => ({
    color: PALETTE,
    title: { text: title, left: 'center', textStyle: { fontSize: 15 } },
    tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
    legend: { bottom: 0 },
    series: [{
      type: 'pie',
      radius: ['40%', '65%'],
      center,
      avoidLabelOverlap: true,
      itemStyle: { borderRadius: 6, borderColor: '#fff', borderWidth: 2 },
      label: { show: false },
      emphasis: { label: { show: true, fontWeight: 'bold' } },
      data: rows.map(r => ({ name: r[nameKey] || 'sin datos', value: r.count }))
    }]
  });

  const barOption = (title, rows, nameKey, color) => ({
    title: { text: title, left: 'center', top: 0, textStyle: { fontSize: 15 } },
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    grid: { left: '3%', right: '4%', bottom: '3%', top: 60, containLabel: true },
    xAxis: {
      type: 'category',
      data: rows.map(r => r[nameKey] || '—'),
      axisLabel: { rotate: rows.length > 4 ? 30 : 0, fontSize: 11 }
    },
    yAxis: { type: 'value', minInterval: 1 },
    series: [{
      type: 'bar',
      data: rows.map(r => r.count),
      barMaxWidth: 48,
      itemStyle: { color: color || '#5470c6', borderRadius: [4, 4, 0, 0] },
      label: { show: true, position: 'top' }
    }]
  });

  const lineOption = (title, rows) => ({
    title: { text: title, left: 'center', top: 0, textStyle: { fontSize: 15 } },
    tooltip: { trigger: 'axis' },
    grid: { left: '3%', right: '4%', bottom: '3%', top: 60, containLabel: true },
    xAxis: {
      type: 'category',
      data: rows.map(r => r.day?.substring(0, 10)),
      boundaryGap: false
    },
    yAxis: { type: 'value', minInterval: 1 },
    series: [{
      type: 'line',
      data: rows.map(r => r.count),
      smooth: true,
      symbol: 'circle',
      symbolSize: 7,
      lineStyle: { width: 3, color: '#ee6666' },
      itemStyle: { color: '#ee6666' },
      areaStyle: { color: 'rgba(238,102,102,0.15)' }
    }]
  });

  const bundlesPieRef = useChart(data && pieOption('Bandeos Disponibles por Usuario', data.bundlesAvailableByUser, ['50%', '55%'], 'name'));
  const storeBarRef = useChart(data && barOption('Entregas por Tienda', data.deliveriesByStore, 'store_name', '#91cc75'));
  const userBarRef = useChart(data && barOption('Entregas por Usuario', data.deliveriesByUser, 'name', '#73c0de'));
  const dayLineRef = useChart(data && lineOption('Entregas por Día', data.deliveriesByDay));
  // Ciudad del store → departamento de Bolivia + coordenadas para el scatter
  const DEPT_MAP = {
    'SANTA CRUZ': { dep: 'Santa Cruz', coord: [-63.18, -17.78] },
    'LA PAZ': { dep: 'La Paz', coord: [-68.15, -16.50] },
    'EL ALTO': { dep: 'La Paz', coord: [-68.20, -16.50] },
    'COCHABAMBA': { dep: 'Cochabamba', coord: [-66.16, -17.38] },
    'ORURO': { dep: 'Oruro', coord: [-67.15, -17.98] },
    'POTOSI': { dep: 'Potosí', coord: [-65.75, -19.59] },
    'TARIJA': { dep: 'Tarija', coord: [-64.73, -21.53] },
    'CHUQUISACA': { dep: 'Chuquisaca', coord: [-65.26, -19.02] },
    'SUCRE': { dep: 'Chuquisaca', coord: [-65.26, -19.02] },
    'BENI': { dep: 'Beni', coord: [-64.90, -14.83] },
    'TRINIDAD': { dep: 'Beni', coord: [-64.90, -14.83] },
    'PANDO': { dep: 'Pando', coord: [-68.73, -11.03] },
    'COBIJA': { dep: 'Pando', coord: [-68.73, -11.03] },
  };

  const deptAgg = {};
  const scatterData = [];
  if (data) {
    for (const r of data.deliveriesByCity) {
      const m = DEPT_MAP[String(r.name || '').toUpperCase().trim()];
      if (!m) continue;
      deptAgg[m.dep] = (deptAgg[m.dep] || 0) + r.count;
      const existing = scatterData.find(s => s.name === m.dep);
      if (existing) existing.value[2] += r.count;
      else scatterData.push({ name: m.dep, value: [...m.coord, r.count] });
    }
  }
  const ALL_DEPTS = ['Chuquisaca', 'La Paz', 'Cochabamba', 'Oruro', 'Potosí', 'Tarija', 'Santa Cruz', 'Beni', 'Pando'];
  const deptData = ALL_DEPTS.map(name => ({ name, value: deptAgg[name] || 0 }));
  const maxDept = Math.max(1, ...deptData.map(d => d.value));

  const mapOption = mapReady && data && {
    title: { text: 'Entregas por Departamento', left: 'center', top: 0, textStyle: { fontSize: 15 } },
    tooltip: { trigger: 'item', formatter: (p) => `${p.name}: ${p.value ?? 0} entrega(s)` },
    visualMap: {
      min: 0,
      max: maxDept,
      left: 10,
      bottom: 10,
      calculable: true,
      text: ['Más', 'Menos'],
      inRange: { color: ['#e8f1fb', '#5470c6'] }
    },
    series: [
      {
        type: 'map',
        map: 'bolivia',
        nameProperty: 'nombre_dep',
        roam: false,
        top: 35,
        label: { show: true, color: '#666', fontSize: 9 },
        itemStyle: { areaColor: '#f4f4f4', borderColor: '#999' },
        emphasis: { itemStyle: { areaColor: '#c8d9f0' }, label: { color: '#222' } },
        data: deptData
      },
      {
        type: 'effectScatter',
        coordinateSystem: 'geo',
        geoIndex: 0,
        data: scatterData,
        symbolSize: (val) => Math.max(8, Math.min(26, val[2] * 8)),
        rippleEffect: { scale: 2.2 },
        itemStyle: { color: '#ee6666' },
        label: { show: true, position: 'right', formatter: '{b}', fontSize: 10, color: '#333' }
      }
    ]
  };
  const cityMapRef = useChart(mapOption, [mapReady]);
  const canSeeProfiles = level !== 'field force';
  const profilesBarRef = useChart(canSeeProfiles && data && barOption('Cantidad de Perfiles', data.usersByLevel, 'name', '#3ba272'));

  if (loading) return <div style={{ textAlign: 'center', padding: '2rem' }}>Cargando reporte…</div>;
  if (error) return <div style={{ padding: '1rem', backgroundColor: '#f8d7da', color: '#721c24', borderRadius: '4px' }}>{error}</div>;

  const t = data.totals;
  const kpis = [
    { label: 'Total Bandeos', value: t.bundles, color: '#5470c6' },
    { label: 'Bandeos Disponibles', value: t.bundlesAvailable, color: '#91cc75' },
    { label: 'Bandeos Entregados', value: t.deliveries, color: '#ee6666' },
    { label: 'Total Tiendas', value: t.stores, color: '#fac858' },
    { label: 'Usuarios', value: t.users, color: '#73c0de' },
    { label: 'Proyectos', value: t.projects, color: '#9a60b4' },
  ].filter(k => {
    if (level === 'field force' && (k.label === 'Usuarios' || k.label === 'Bandeos Disponibles')) return false;
    if (level === 'city manager' && k.label === 'Bandeos Disponibles') return false;
    return true;
  });

  return (
    <div style={{ padding: '1rem', width: '100%', boxSizing: 'border-box' }}>
      <h2 style={{ marginBottom: '0.25rem', color: '#333' }}>Reporte de Resumen</h2>
      <p style={{ color: '#666', marginBottom: '1.5rem', fontSize: '0.875rem' }}>{scopeLabel}</p>

      {/* KPIs */}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
        {kpis.map(k => (
          <div key={k.label} style={kpiCard(k.color)}>
            <div style={{ fontSize: '0.8rem', color: '#666', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{k.label}</div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: k.color }}>{k.value}</div>
          </div>
        ))}
      </div>

      {/* Gráficos */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '1rem' }}>
        <div style={cardStyle}><div ref={bundlesPieRef} style={{ width: '100%', height: '320px' }} /></div>
        {canSeeProfiles && (
          <div style={cardStyle}><div ref={profilesBarRef} style={{ width: '100%', height: '320px' }} /></div>
        )}
        <div style={cardStyle}><div ref={cityMapRef} style={{ width: '100%', height: '420px' }} /></div>
        <div style={cardStyle}><div ref={storeBarRef} style={{ width: '100%', height: '320px' }} /></div>
        <div style={cardStyle}><div ref={userBarRef} style={{ width: '100%', height: '320px' }} /></div>
        <div style={cardStyle}><div ref={dayLineRef} style={{ width: '100%', height: '320px' }} /></div>
      </div>

      {/* Lista de entregas */}
      <div style={{ ...cardStyle, marginTop: '1rem' }}>
        <h3 style={{ marginTop: 0 }}>Entregas Registradas ({data.deliveriesList.length})</h3>
        {data.deliveriesList.length === 0 ? (
          <p style={{ color: '#666' }}>No hay entregas registradas.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
                  <th style={{ padding: '0.75rem', textAlign: 'center', color: '#495057' }}>#</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', color: '#495057' }}>Cliente</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', color: '#495057' }}>Store</th>
                  <th style={{ padding: '0.75rem', textAlign: 'center', color: '#495057' }}>Foto</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', color: '#495057' }}>Fecha de Entrega</th>
                </tr>
              </thead>
              <tbody>
                {data.deliveriesList.map((d, i) => (
                  <tr key={d.bundle_delivered_id} style={{ borderBottom: '1px solid #dee2e6' }}>
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
                  ['Serial del Bundle', detailDelivery.serial_number],
                  ['Modelo de Bundle', detailDelivery.bundle_name],
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

export default ReportsDashboard;
