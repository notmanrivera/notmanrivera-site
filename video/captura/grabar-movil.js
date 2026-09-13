const { chromium } = require(process.env.HF + '/node_modules/playwright-core');

// Recorrido móvil. Más corto y más apretado que el de escritorio: en Reels
// nadie aguanta una pausa larga, y el layout móvil apila todo en vertical,
// así que cada sección ocupa más scroll por menos contenido visible.
const RUTA = [
  { y: 0,    hold: 1700 },   // hero -- los CTA sobre el pliegue
  { y: 1180, viaje: 1000, hold: 800 },   // trabajo
  { y: 2300, viaje: 1100, hold: 750 },   // galería
  { y: 3609, viaje: 1100, hold: 850 },   // servicios
  { y: 5141, viaje: 1000, hold: 750 },   // experiencia
  { y: 6108, viaje:  950, hold: 750 },   // perfil
  { y: 7536, viaje: 1100, hold: 1300 },  // contacto
];

(async () => {
  const b = await chromium.launch({
    executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
    args: ['--no-sandbox', '--disable-dev-shm-usage'],
  });
  const ctx = await b.newContext({
    viewport: { width: 430, height: 932 },
    deviceScaleFactor: 2, isMobile: true, hasTouch: true,
    recordVideo: { dir: process.env.HF + '/scroll/raw-movil', size: { width: 860, height: 1864 } },
  });
  const p = await ctx.newPage();
  await p.goto('http://127.0.0.1:8899/', { waitUntil: 'load', timeout: 90000 }).catch(() => {});
  await p.waitForTimeout(4000);
  await p.addStyleTag({ content: 'html{scroll-behavior:auto !important}' });
  await p.evaluate(() => window.scrollTo(0, 0));
  await p.waitForTimeout(1200);

  await p.evaluate(async (ruta) => {
    const easeInOut = t => t < .5 ? 4*t*t*t : 1 - Math.pow(-2*t+2, 3)/2;
    const dormir = ms => new Promise(r => setTimeout(r, ms));
    let desde = 0;
    for (const paso of ruta) {
      if (paso.viaje) {
        await new Promise(fin => {
          const t0 = performance.now(); const d = paso.y - desde;
          (function cuadro(t) {
            const k = Math.min(1, (t - t0) / paso.viaje);
            window.scrollTo(0, desde + d * easeInOut(k));
            k < 1 ? requestAnimationFrame(cuadro) : fin();
          })(t0);
        });
        desde = paso.y;
      }
      await dormir(paso.hold);
    }
  }, RUTA);
  await p.waitForTimeout(500);
  await ctx.close(); await b.close();
  console.log('grabado movil');
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
