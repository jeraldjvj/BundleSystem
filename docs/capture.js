const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const URL = 'http://localhost:5173';
const OUT = path.join(__dirname, 'screenshots');

// Session objects matching backend toCamelCase shape
const omUser = {
  userId: 1, miId: '6846878912', email: 'josevaca@gmail.com',
  levelUser: 'Office Manager', status: 'active',
  firstName: 'José', lastName: 'Vaca', profilePicture: null
};
const ffUser = {
  userId: 4, miId: '6859677442', email: 'dvasquezjim@gmail.com',
  levelUser: 'Field Force', status: 'active',
  firstName: 'Damaris', lastName: 'Vasquez', profilePicture: null
};

const OM_PAGES = [
  ['reportes', 'Reportes'],
  ['usuarios', 'Usuarios'],
  ['tiendas', 'Tiendas'],
  ['proyectos', 'Proyectos'],
  ['modelos-de-bandeo', 'Modelos de Bandeo'],
  ['bandeos', 'Bandeos'],
  ['modelos-de-smartphone', 'Modelos de Smartphone'],
  ['smartphones', 'Smartphones'],
  ['distribuidores', 'Distribuidores'],
  ['recibir-bandeos', 'Recibir Bandeos'],
];

const FF_PAGES = [
  ['ff-reportes', 'Reportes'],
  ['ff-entrega-bandeos', 'Entrega de Bandeos'],
  ['ff-compartir-bandeos', 'Compartir Bandeos'],
  ['ff-recibir-bandeos', 'Recibir Bandeos'],
];

async function clickMenu(page, label) {
  const clicked = await page.evaluate((lbl) => {
    const els = [...document.querySelectorAll('nav button')];
    const target = els.find(e => e.textContent.trim() === lbl);
    if (target) { target.click(); return true; }
    return false;
  }, label);
  return clicked;
}

async function capture(page, user, pages, prefix) {
  await page.evaluateOnNewDocument((u) => {
    localStorage.setItem('user', JSON.stringify(u));
  }, user);
  await page.goto(URL, { waitUntil: 'networkidle2', timeout: 30000 });
  await new Promise(r => setTimeout(r, 1500));

  for (const [file, label] of pages) {
    const ok = await clickMenu(page, label);
    await new Promise(r => setTimeout(r, 2200));
    await page.screenshot({ path: path.join(OUT, `${file}.png`) });
    console.log(`${ok ? 'OK ' : 'MISS'} ${file} (${label})`);
  }
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: 'new',
    args: ['--window-size=1440,900', '--lang=es'],
    defaultViewport: { width: 1440, height: 900 },
  });
  const page = await browser.newPage();

  // 1. Login (sin sesión)
  await page.goto(URL, { waitUntil: 'networkidle2', timeout: 30000 });
  await new Promise(r => setTimeout(r, 1200));
  await page.screenshot({ path: path.join(OUT, '00-login.png') });
  console.log('OK 00-login');

  // 2. Office Manager pages
  await capture(page, omUser, OM_PAGES, 'om');

  // 3. Field Force pages — new page so localStorage reset cleanly
  const page2 = await browser.newPage();
  await capture(page2, ffUser, FF_PAGES, 'ff');

  await browser.close();
  console.log('DONE');
})().catch(e => { console.error('FATAL', e.message); process.exit(1); });
