const { chromium } = require(process.env.HF + '/node_modules/playwright-core');

// Recorrido con pausas: el scroll continuo marea y no deja leer nada. Se
// detiene en cada sección el tiempo suficiente para que se lea, y viaja entre
// ellas con easeInOut -- el mismo gesto que hace una persona interesada.
const RUTA = [
  { y: 0,    hold: 2000 },   // hero
  { y: 1019, viaje: 1500, hold: 1200 },   // trabajo
  { y: 1950, viaje: 1600, hold: 1000 },   // galería
  { y: 3157, viaje: 1500, hold: 1300 },   // servicios
  { y: 4470, viaje: 1400, hold: 1200 },   // experiencia
  { y: 5114, viaje: 1200, hold: 1200 },   // perfil
  { y: 6114, viaje: 1400, hold: 1800 },   // contacto
];

(async () => {
  const b = await chromium.launch({
    executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
    args: ['--no-sandbox', '--disable-dev-shm-usage', '--force-device-scale-factor=1'],
  });
  const ctx = await b.newContext({
    viewport: { width: 1512, height: 945 },
    recordVideo: { dir: process.env.HF + '/scroll/raw', size: { width: 1512, height: 945 } },
    reducedMotion: 'no-preference',
  });
  const p = await ctx.newPage();
  await p.goto('http://127.0.0.1:8899/', { waitUntil: 'load', timeout: 90000 }).catch(() => {});
  await p.waitForTimeout(4000);          // deja terminar el cargador y el aterrizaje del logo

  // scroll-behavior:smooth pelearía con el driver; se apaga.
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
          const t0 = performance.now();
          const d = paso.y - desde;
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

  await p.waitForTimeout(600);
  await ctx.close();
  await b.close();
  console.log('grabado');
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
