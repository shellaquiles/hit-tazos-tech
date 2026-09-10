import { spawn } from 'node:child_process';
import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve, join } from 'node:path';

const CHROME_BIN = '/home/kubrick/.cache/ms-playwright/chromium_headless_shell-1234/chrome-headless-shell-linux64/chrome-headless-shell';
const HTML_PATH = 'file://' + resolve('web/index.html');
const OUT_DIR = resolve('docs/screenshots');

mkdirSync(OUT_DIR, { recursive: true });

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

class CDPClient {
  constructor(wsUrl) {
    this.ws = new WebSocket(wsUrl);
    this.msgId = 0;
    this.callbacks = new Map();
  }

  async connect() {
    return new Promise((resolve, reject) => {
      this.ws.onopen = () => resolve();
      this.ws.onerror = (err) => reject(err);
      this.ws.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        if (msg.id && this.callbacks.has(msg.id)) {
          const { resolve, reject } = this.callbacks.get(msg.id);
          this.callbacks.delete(msg.id);
          if (msg.error) {
            reject(new Error(msg.error.message || JSON.stringify(msg.error)));
          } else {
            resolve(msg.result);
          }
        }
      };
    });
  }

  send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = ++this.msgId;
      this.callbacks.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  async eval(expression) {
    return this.send('Runtime.evaluate', {
      expression,
      awaitPromise: true,
      returnByValue: true
    });
  }

  async screenshot(filePath) {
    const res = await this.send('Page.captureScreenshot', { format: 'png' });
    const buffer = Buffer.from(res.data, 'base64');
    writeFileSync(filePath, buffer);
    console.log(`Saved screenshot: ${filePath} (${buffer.length} bytes)`);
  }

  close() {
    this.ws.close();
  }
}

async function main() {
  console.log('Launching headless browser on port 9223...');
  const proc = spawn(CHROME_BIN, [
    '--headless',
    '--no-sandbox',
    '--remote-debugging-port=9223',
    '--allow-file-access-from-files',
    '--disable-web-security',
    '--window-size=1280,820',
    HTML_PATH
  ], { stdio: 'ignore' });

  // Give browser 2 seconds to start
  await sleep(2000);

  try {
    // Get target websocket
    const listRes = await fetch('http://127.0.0.1:9223/json');
    const targets = await listRes.json();
    const pageTarget = targets.find(t => t.type === 'page');
    if (!pageTarget) {
      throw new Error('No page target found');
    }

    const cdp = new CDPClient(pageTarget.webSocketDebuggerUrl);
    await cdp.connect();
    console.log('Connected to CDP');

    await cdp.send('Page.enable');
    await cdp.send('Runtime.enable');

    // Wait for app to be ready
    await sleep(1500);

    // 1. Selector Modal (first time experience)
    console.log('Capturing 01-selector-version.png...');
    await cdp.screenshot(join(OUT_DIR, '01-selector-version.png'));

    // 2. Gameplay: Hit-Tazo (disc mode)
    console.log('Setting up Hit-Tazo gameplay...');
    await cdp.eval(`
      (() => {
        if (window.app) {
          window.app.isFirstTimeOnboarding = false;
          window.app.selectGameVersion('tazo');
          if (window.app.versionDialog?.open) window.app.versionDialog.close();
          if (window.app.helpDialog?.open) window.app.helpDialog.close();
        }
      })()
    `);
    await sleep(600);
    console.log('Capturing 02-gameplay-hit-tazo.png...');
    await cdp.screenshot(join(OUT_DIR, '02-gameplay-hit-tazo.png'));

    // 3. Gameplay: Hit-Cards (square card mode)
    console.log('Switching to Hit-Cards gameplay...');
    await cdp.eval(`
      (() => {
        if (window.app) {
          window.app.isFirstTimeOnboarding = false;
          window.app.selectGameVersion('cards');
          if (window.app.versionDialog?.open) window.app.versionDialog.close();
          if (window.app.helpDialog?.open) window.app.helpDialog.close();
        }
      })()
    `);
    await sleep(600);
    console.log('Capturing 03-gameplay-hit-cards.png...');
    await cdp.screenshot(join(OUT_DIR, '03-gameplay-hit-cards.png'));

    // 4. Guía Rápida / Atajos de Teclado Modal
    console.log('Opening Help Modal for 04-guia-rapida-juego.png...');
    await cdp.eval(`
      (() => {
        if (window.app) {
          window.app.openHelpModal();
        }
      })()
    `);
    await sleep(600);
    console.log('Capturing 04-guia-rapida-juego.png...');
    await cdp.screenshot(join(OUT_DIR, '04-guia-rapida-juego.png'));

    cdp.close();
    console.log('All screenshots captured successfully!');
  } finally {
    proc.kill();
  }
}

main().catch(err => {
  console.error('Screenshot capture failed:', err);
  process.exit(1);
});
