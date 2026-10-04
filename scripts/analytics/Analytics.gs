/**
 * Lee GA4 de notmanrivera.com y lo deja en la pestaña "Analytics" de la hoja
 * de prospección, para que Rubén y la rutina diaria lo vean sin abrir GA4.
 *
 * Corre todos los días a las 7 am (antes de la rutina de las 7:45):
 *   1. Reescribe la pestaña Analytics: tráfico de la última semana, visitas
 *      que llegaron desde los correos (por empresa) y páginas más vistas.
 *   2. Si ayer alguien llegó desde un correo y se quedó un rato, manda un
 *      aviso de "lead caliente" a hola@.
 *
 * Los correos de prospección llevan utm_medium=outreach y
 * utm_content=<empresa en slug> (ver linkSitio/slugEmpresa en
 * scripts/apps-script/Código.gs): de ahí sale qué empresa visitó el sitio.
 *
 * Proyecto aparte, propiedad de hola@ (como scripts/resenas-webapp/): la hoja
 * es de rnrivera93@ y el acceso a Analytics lo tiene hola@.
 *
 * Primera vez: abrir el proyecto como hola@, correr `instalar` y aceptar los
 * permisos. Eso busca la propiedad de GA4, llena la pestaña e instala el
 * disparador diario.
 */

const ANALYTICS = {
  HOJA_ID: '1240Zwpx5A8QslkJonFUdGXSTyV4wbS_PuIX_0JvoMe0', // Prospección deportiva
  PESTANA: 'Analytics',
  MEDICION: 'G-KMZ6Q35TJ8', // la etiqueta del sitio; con esto se encuentra la propiedad
  AVISAR_A: 'hola@notmanrivera.com',
  DIAS_CORREOS: 90,          // ventana de "visitas desde los correos"
  // Lead caliente: al menos un minuto de interacción, o 3 páginas con algo
  // de interacción. Las visitas con 0 s casi siempre son el filtro antispam
  // de la empresa abriendo el link (Mimecast, Safe Links...): llegan el día
  // del envío, a veces varias, y nadie lee nada. No cuentan.
  CALIENTE_SEGUNDOS: 60,
  CALIENTE_PAGINAS: 3,
  CALIENTE_PAGINAS_MIN_SEGUNDOS: 20,
  HORA: 7,
};

/** Primera vez (como hola@): permisos, propiedad, pestaña y disparador. */
function instalar() {
  const id = propiedad_(true);
  Logger.log('Propiedad de GA4: ' + id);
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === 'diario') ScriptApp.deleteTrigger(t);
  });
  ScriptApp.newTrigger('diario').timeBased().everyDays(1).atHour(ANALYTICS.HORA)
    .inTimezone('America/Mexico_City').create();
  actualizarPestana();
  Logger.log('Listo: pestaña "' + ANALYTICS.PESTANA + '" llena y disparador diario a las ' + ANALYTICS.HORA + ' am.');
}

function diario() {
  actualizarPestana();
  avisarLeadsCalientes();
}

// ─────────────────────────────────────────────────────────────
//  Pestaña Analytics
// ─────────────────────────────────────────────────────────────
function actualizarPestana() {
  const libro = SpreadsheetApp.openById(ANALYTICS.HOJA_ID);
  let hoja = libro.getSheetByName(ANALYTICS.PESTANA);
  if (!hoja) hoja = libro.insertSheet(ANALYTICS.PESTANA);
  hoja.clear();

  const empresas = empresasPorSlug_(libro);
  const filas = [];
  const titulos = []; // números de fila (base 1) que van en negritas
  const bloque = function (titulo, encabezado, datos, vacio) {
    if (filas.length) filas.push(['']);
    titulos.push(filas.length + 1);
    filas.push([titulo]);
    filas.push(encabezado);
    if (datos.length) datos.forEach(function (d) { filas.push(d); });
    else filas.push([vacio]);
  };

  filas.push(['Actualizado ' + Utilities.formatDate(new Date(), 'America/Mexico_City', 'd/M/yyyy HH:mm') +
              ' · GA4 ' + propiedad_() + ' · Tiempo = tiempo de interacción real (pestaña al frente)']);

  // 1. Tráfico de la última semana por canal
  const canales = reporte_({
    dateRanges: [{ startDate: '7daysAgo', endDate: 'yesterday' }],
    dimensions: [{ name: 'sessionDefaultChannelGroup' }],
    metrics: [{ name: 'sessions' }, { name: 'engagedSessions' }, { name: 'userEngagementDuration' }, { name: 'activeUsers' }],
    orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
  });
  bloque('Últimos 7 días, por canal',
    ['Canal', 'Sesiones', 'Con interacción', 'Usuarios', 'Tiempo total (min)', 'Tiempo por sesión (s)'],
    canales.map(function (r) {
      const s = num_(r.m[0]), t = num_(r.m[2]);
      return [r.d[0], s, num_(r.m[1]), num_(r.m[3]), Math.round(t / 60), s ? Math.round(t / s) : 0];
    }),
    'Sin visitas');

  // 2. Visitas desde los correos, por empresa
  bloque('Visitas desde los correos (últimos ' + ANALYTICS.DIAS_CORREOS + ' días), la más reciente arriba',
    ['Empresa', 'Fila en Prospectos', 'Campaña', 'Entró por', 'Sesiones', 'Tiempo total (min)', 'Páginas vistas', 'Última visita', 'Lectura', 'Estado / notas'],
    visitasDesdeCorreos_(ANALYTICS.DIAS_CORREOS + 'daysAgo').map(function (v) {
      const e = empresas[v.slug];
      return [e ? e.nombre : v.slug + ' (no está en la hoja)', e ? e.fila : '', v.campanas.join(', '),
              v.entradas.join(', '), v.sesiones, Math.round(v.segundos / 60 * 10) / 10, v.paginas, fechaCorta_(v.ultima),
              lectura_(v), e ? notaCorta_(e.notas) : ''];
    }),
    'Nadie ha llegado desde un correo en este periodo');

  // 3. Páginas más vistas
  const paginas = reporte_({
    dateRanges: [{ startDate: '7daysAgo', endDate: 'yesterday' }],
    dimensions: [{ name: 'pagePath' }],
    metrics: [{ name: 'screenPageViews' }, { name: 'userEngagementDuration' }],
    orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
    limit: 12,
  });
  bloque('Páginas más vistas, últimos 7 días',
    ['Página', 'Vistas', 'Tiempo total (min)'],
    paginas.map(function (r) { return [r.d[0], num_(r.m[0]), Math.round(num_(r.m[1]) / 60)]; }),
    'Sin datos');

  // 4–7. La foto de 90 días: de dónde llega la gente, qué lee y en qué.
  const seg = function (r, i) { const v = num_(r.m[i]); return v; };
  const noventa = { startDate: '90daysAgo', endDate: 'yesterday' };
  const fuentes = reporte_({
    dateRanges: [noventa],
    dimensions: [{ name: 'sessionSource' }, { name: 'sessionMedium' }],
    metrics: [{ name: 'sessions' }, { name: 'engagedSessions' }, { name: 'userEngagementDuration' }],
    orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
    limit: 15,
  });
  bloque('Últimos 90 días, por fuente',
    ['Fuente / medio', 'Sesiones', 'Con interacción', '% con interacción', 'Tiempo por sesión (s)'],
    fuentes.map(function (r) {
      const s = seg(r, 0);
      return [r.d[0] + ' / ' + r.d[1], s, seg(r, 1), s ? Math.round(seg(r, 1) / s * 100) + '%' : '', s ? Math.round(seg(r, 2) / s) : 0];
    }),
    'Sin datos');

  const paginas90 = reporte_({
    dateRanges: [noventa],
    dimensions: [{ name: 'pagePath' }],
    metrics: [{ name: 'screenPageViews' }, { name: 'userEngagementDuration' }, { name: 'activeUsers' }],
    orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
    limit: 20,
  });
  bloque('Últimos 90 días, por página',
    ['Página', 'Vistas', 'Usuarios', 'Tiempo por vista (s)'],
    paginas90.map(function (r) {
      const v = seg(r, 0);
      return [r.d[0], v, seg(r, 2), v ? Math.round(seg(r, 1) / v) : 0];
    }),
    'Sin datos');

  const dispositivos = reporte_({
    dateRanges: [noventa],
    dimensions: [{ name: 'deviceCategory' }],
    metrics: [{ name: 'sessions' }, { name: 'engagedSessions' }, { name: 'userEngagementDuration' }],
    orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
  });
  bloque('Últimos 90 días, por dispositivo',
    ['Dispositivo', 'Sesiones', '% con interacción', 'Tiempo por sesión (s)'],
    dispositivos.map(function (r) {
      const s = seg(r, 0);
      return [r.d[0], s, s ? Math.round(seg(r, 1) / s * 100) + '%' : '', s ? Math.round(seg(r, 2) / s) : 0];
    }),
    'Sin datos');

  const paises = reporte_({
    dateRanges: [noventa],
    dimensions: [{ name: 'country' }],
    metrics: [{ name: 'sessions' }, { name: 'engagedSessions' }, { name: 'userEngagementDuration' }],
    orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
    limit: 12,
  });
  bloque('Últimos 90 días, por país',
    ['País', 'Sesiones', '% con interacción', 'Tiempo por sesión (s)'],
    paises.map(function (r) {
      const s = seg(r, 0);
      return [r.d[0], s, s ? Math.round(seg(r, 1) / s * 100) + '%' : '', s ? Math.round(seg(r, 2) / s) : 0];
    }),
    'Sin datos');

  const ancho = filas.reduce(function (a, f) { return Math.max(a, f.length); }, 1);
  const rect = filas.map(function (f) { const c = f.slice(); while (c.length < ancho) c.push(''); return c; });
  // ⚠️ Texto plano antes de escribir: si no, Sheets reinterpreta las celdas
  // (una columna que antes tuvo fechas mostraba "1 página" como 31/12/1899, y
  // "2/10/2026" podía leerse como 10 de febrero). La rutina lee texto de todas
  // formas.
  hoja.getRange(1, 1, rect.length, ancho).setNumberFormat('@');
  hoja.getRange(1, 1, rect.length, ancho).setValues(rect.map(function (f) {
    return f.map(function (c) { return c === '' ? '' : String(c); });
  }));
  hoja.getRange(1, 1).setFontColor('#666666');
  titulos.forEach(function (n) {
    hoja.getRange(n, 1).setFontWeight('bold').setFontSize(12);
    hoja.getRange(n + 1, 1, 1, ancho).setFontWeight('bold').setBackground('#000000').setFontColor('#ffffff');
  });
  hoja.setColumnWidth(1, 260);
  hoja.setColumnWidth(10, 360);
}

// ─────────────────────────────────────────────────────────────
//  Leads calientes
// ─────────────────────────────────────────────────────────────
function avisarLeadsCalientes() {
  const ayer = Utilities.formatDate(new Date(Date.now() - 864e5), 'America/Mexico_City', 'yyyyMMdd');
  const props = PropertiesService.getScriptProperties();
  if (props.getProperty('ULTIMO_AVISO') === ayer) return; // ya se avisó de ese día

  const calientes = visitasDesdeCorreos_('yesterday').filter(esCaliente_);
  props.setProperty('ULTIMO_AVISO', ayer);
  if (!calientes.length) return;

  const libro = SpreadsheetApp.openById(ANALYTICS.HOJA_ID);
  const empresas = empresasPorSlug_(libro);
  const rutas = paginasPorEmpresa_('yesterday');
  const lineas = calientes.map(function (v) {
    const e = empresas[v.slug];
    const quien = e ? e.nombre + ' (fila ' + e.fila + ')' : v.slug;
    return '• ' + quien + ': ' + Math.round(v.segundos / 60 * 10) / 10 + ' min, ' + v.paginas + ' páginas' +
      ' · desde ' + v.campanas.join(', ') +
      (rutas[v.slug] ? '\n  Vio: ' + rutas[v.slug].join(', ') : '') +
      (e && e.notas ? '\n  Notas: ' + notaCorta_(e.notas) : '');
  });
  const nombres = calientes.map(function (v) { return empresas[v.slug] ? empresas[v.slug].nombre : v.slug; });
  MailApp.sendEmail(ANALYTICS.AVISAR_A,
    'Lead caliente: ' + nombres.join(', '),
    'Ayer llegaron desde tus correos y se quedaron un rato:\n\n' + lineas.join('\n\n') +
    '\n\nBuen momento para un mensaje personal (LinkedIn o Instagram) mientras te tienen fresco.' +
    '\n\nDetalle en la pestaña Analytics: ' + libro.getUrl(),
    { name: 'Analytics notmanrivera.com' });
}

// ─────────────────────────────────────────────────────────────
//  GA4
// ─────────────────────────────────────────────────────────────

/** Visitas con utm_medium=outreach, agrupadas por utm_content (empresa). */
function visitasDesdeCorreos_(desde) {
  const filas = reporte_({
    dateRanges: [{ startDate: desde, endDate: 'yesterday' }],
    dimensions: [{ name: 'sessionManualAdContent' }, { name: 'sessionCampaignName' }, { name: 'date' }, { name: 'landingPage' }],
    metrics: [{ name: 'sessions' }, { name: 'userEngagementDuration' }, { name: 'screenPageViews' }],
    dimensionFilter: { filter: { fieldName: 'sessionMedium', stringFilter: { value: 'outreach' } } },
    limit: 10000,
  });
  const porSlug = {};
  filas.forEach(function (r) {
    const slug = decodificar_(r.d[0]);
    if (!slug || slug === '(not set)') return;
    const v = porSlug[slug] || (porSlug[slug] = { slug: slug, campanas: [], entradas: [], sesiones: 0, segundos: 0, paginas: 0, ultima: '' });
    if (v.campanas.indexOf(r.d[1]) === -1) v.campanas.push(r.d[1]);
    // Página de entrada, para la prueba portada contra caso de estudio.
    const entrada = String(r.d[3] || '').split('?')[0];
    if (entrada && entrada !== '(not set)' && v.entradas.indexOf(entrada) === -1) v.entradas.push(entrada);
    v.sesiones += num_(r.m[0]);
    v.segundos += num_(r.m[1]);
    v.paginas += num_(r.m[2]);
    if (r.d[2] > v.ultima) v.ultima = r.d[2];
  });
  return Object.keys(porSlug).map(function (k) { return porSlug[k]; })
    .sort(function (a, b) { return a.ultima < b.ultima ? 1 : a.ultima > b.ultima ? -1 : b.segundos - a.segundos; });
}

/** { slug: ['/casos/al-arabi-sc/', ...] } de las visitas desde correos. */
function paginasPorEmpresa_(desde) {
  const salida = {};
  reporte_({
    dateRanges: [{ startDate: desde, endDate: 'yesterday' }],
    dimensions: [{ name: 'sessionManualAdContent' }, { name: 'pagePath' }],
    metrics: [{ name: 'screenPageViews' }],
    dimensionFilter: { filter: { fieldName: 'sessionMedium', stringFilter: { value: 'outreach' } } },
    orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
    limit: 1000,
  }).forEach(function (r) {
    const slug = decodificar_(r.d[0]);
    (salida[slug] = salida[slug] || []).push(r.d[1]);
  });
  return salida;
}

function reporte_(pedido) {
  const res = AnalyticsData.Properties.runReport(pedido, 'properties/' + propiedad_());
  return (res.rows || []).map(function (r) {
    return {
      d: (r.dimensionValues || []).map(function (x) { return x.value; }),
      m: (r.metricValues || []).map(function (x) { return x.value; }),
    };
  });
}

/**
 * ID numérico de la propiedad de GA4 del sitio. Se busca una vez por la
 * etiqueta (G-...) entre las cuentas a las que hola@ tiene acceso y se
 * guarda en las propiedades del script.
 */
function propiedad_(buscar) {
  const props = PropertiesService.getScriptProperties();
  const guardada = props.getProperty('GA4_PROPIEDAD');
  if (guardada && !buscar) return guardada;

  let token, vistas = [];
  do {
    const res = AnalyticsAdmin.AccountSummaries.list({ pageSize: 200, pageToken: token });
    (res.accountSummaries || []).forEach(function (cuenta) {
      (cuenta.propertySummaries || []).forEach(function (p) {
        vistas.push(p.displayName + ' (' + p.property + ')');
        const flujos = AnalyticsAdmin.Properties.DataStreams.list(p.property).dataStreams || [];
        flujos.forEach(function (f) {
          if (f.webStreamData && f.webStreamData.measurementId === ANALYTICS.MEDICION) {
            props.setProperty('GA4_PROPIEDAD', p.property.split('/')[1]);
          }
        });
      });
    });
    token = res.nextPageToken;
  } while (token);

  const id = props.getProperty('GA4_PROPIEDAD');
  if (!id) {
    throw new Error('Esta cuenta no ve ninguna propiedad con la etiqueta ' + ANALYTICS.MEDICION +
      '. Propiedades visibles: ' + (vistas.join(', ') || 'ninguna') +
      '. Dale acceso de Lector a hola@ en GA4 (Administrar → Acceso a la propiedad).');
  }
  return id;
}

// ─────────────────────────────────────────────────────────────
//  Hoja de prospección
// ─────────────────────────────────────────────────────────────

/** { slug: { nombre, fila, notas } } con el mismo slug que usan los correos. */
function empresasPorSlug_(libro) {
  const hoja = libro.getSheetByName('Prospectos');
  const n = hoja.getLastRow();
  const salida = {};
  if (n < 2) return salida;
  const datos = hoja.getRange(2, 1, n - 1, 8).getValues();
  for (let i = 0; i < datos.length; i++) {
    const nombre = String(datos[i][0] || '').trim();
    if (!nombre) continue;
    salida[slug_(nombre)] = { nombre: nombre, fila: i + 2, notas: String(datos[i][7] || '') };
  }
  return salida;
}

/** Igual que slugEmpresa() de Código.gs, pero sin codificar: GA4 lo guarda ya decodificado. */
function slug_(texto) {
  return String(texto).toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function decodificar_(v) {
  try { return decodeURIComponent(String(v || '')); } catch (e) { return String(v || ''); }
}

/** Lo útil de Notas para saber en qué va: respuestas, seguimientos, rebotes. */
function notaCorta_(notas) {
  const marcas = String(notas).split('·').map(function (s) { return s.trim(); })
    .filter(function (s) { return /respondi|seguimiento|último toque|bounce|baja|no seguir/i.test(s); });
  return marcas.slice(-2).join(' · ');
}

function esCaliente_(v) {
  return v.segundos >= ANALYTICS.CALIENTE_SEGUNDOS ||
    (v.paginas >= ANALYTICS.CALIENTE_PAGINAS && v.segundos >= ANALYTICS.CALIENTE_PAGINAS_MIN_SEGUNDOS);
}

function lectura_(v) {
  if (esCaliente_(v)) return 'Interés real';
  if (v.segundos > 0) return 'Vistazo';
  return 'Probable antispam (0 s)';
}

function fechaCorta_(aaaammdd) {
  const s = String(aaaammdd || '');
  return s.length === 8 ? Number(s.slice(6)) + '/' + Number(s.slice(4, 6)) + '/' + s.slice(0, 4) : s;
}

function num_(v) {
  return Number(v) || 0;
}
