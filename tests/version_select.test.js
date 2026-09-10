// Test Suite para la Separación de Versiones: Hit-Tazo y Hit-Cards
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { CardRenderer, TazoRenderer, CardsRenderer } from '../web/core/renderer.js';
import { CARD_FORMATS, GAME_VERSIONS, STORAGE_KEYS } from '../web/core/constants.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

describe('Separación de Versiones — Hit-Tazo & Hit-Cards', () => {

  const catalog = {
    domains: { 'ai-data-science': 'Inteligencia Artificial' },
    tags: { 'neural-networks-papers': 'Redes Neuronales' },
    volumes: { 'kernel-foundations': 'Kernel Foundations' }
  };

  const mockCard = {
    id: 'vol0-0x01',
    volumen: 'kernel-foundations',
    domain: 'ai-data-science',
    tag: 'neural-networks-papers',
    hito: 'Publicación del paper del **Perceptrón** por Frank Rosenblatt.',
    year: 1957,
    autor: 'Frank Rosenblatt (Cornell Lab)',
    trivia: 'Primer modelo de aprendizaje en IBM 704.'
  };

  test('TazoRenderer genera anatomía exclusiva de Hit-Tazo (disco 3D y notches)', () => {
    const html = TazoRenderer.renderDisc(
      mockCard,
      {},
      catalog,
      (t) => t.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>'),
      () => ({ c1: '#0f172a', c2: '#0e7490', accent: '#38bdf8', glow: 'rgba(56, 189, 248, 0.4)' })
    );

    assert.ok(html.includes('disc-physical'), 'Debe contener la clase física de disco');
    assert.ok(html.includes('tazo-physical'), 'Debe contener la clase física de tazo');
    assert.ok(html.includes('disc-notches'), 'Debe contener las muescas/ranuras perimetrales');
    assert.ok(html.includes('d="M 38,150 A 112,112 0 0,1 262,150"'), 'Debe usar radio seguro r=112');
    assert.ok(html.includes('disc-core-front'), 'Debe contener el núcleo frontal del tazo');
    assert.ok(html.includes('disc-year-hero'), 'Debe contener el año hero del reverso');
  });

  test('CardsRenderer genera anatomía exclusiva de Hit-Cards (tarjeta cuadrada 65x65)', () => {
    const html = CardsRenderer.renderSquareCard(
      mockCard,
      {},
      catalog,
      (t) => t.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>'),
      () => ({ bg: '#0284c7', frontBg: '#111524', text: '#ffffff', accent: '#38bdf8' })
    );

    assert.ok(html.includes('hittazos-card-3d'), 'Debe contener la clase hittazos-card-3d');
    assert.ok(html.includes('sheet-front'), 'Debe contener cara frontal cuadrada');
    assert.ok(html.includes('sheet-back'), 'Debe contener cara trasera cuadrada');
    assert.ok(html.includes('card-topbar-minimal'), 'Debe contener la barra superior editorial');
    assert.ok(html.includes('INTELIGENCIA ARTIFICIAL'), 'Debe contener el nombre del dominio');
  });

  test('CardRenderer orquesta correctamente entre formatos DISC y CARD', () => {
    const renderer = new CardRenderer(catalog);

    const discHTML = renderer.buildCardHTML(mockCard, {}, CARD_FORMATS.DISC);
    assert.ok(discHTML.includes('disc-physical'), 'El formato DISC debe renderizar un tazo');
    assert.ok(!discHTML.includes('hittazos-card-3d'), 'El formato DISC no debe renderizar una tarjeta cuadrada');

    const cardHTML = renderer.buildCardHTML(mockCard, {}, CARD_FORMATS.CARD);
    assert.ok(cardHTML.includes('hittazos-card-3d'), 'El formato CARD debe renderizar una tarjeta cuadrada');
    assert.ok(!cardHTML.includes('disc-notches'), 'El formato CARD no debe renderizar ranuras de disco');
  });

  test('Constantes GAME_VERSIONS y STORAGE_KEYS están configuradas correctamente', () => {
    assert.equal(GAME_VERSIONS.TAZO.name, 'HIT-TAZOS');
    assert.equal(GAME_VERSIONS.TAZO.format, CARD_FORMATS.DISC);
    assert.equal(GAME_VERSIONS.CARDS.name, 'HIT-CARDS');
    assert.equal(GAME_VERSIONS.CARDS.format, CARD_FORMATS.CARD);
    assert.equal(STORAGE_KEYS.VERSION_CHOSEN, 'hittazos_version_chosen');
  });

  test('web/index.html incluye los archivos CSS especializados y el diálogo de selección', () => {
    const html = fs.readFileSync(path.join(projectRoot, 'web', 'index.html'), 'utf-8');

    assert.ok(html.includes('href="css/tazo.css"'), 'Debe vincular css/tazo.css');
    assert.ok(html.includes('href="css/cards.css"'), 'Debe vincular css/cards.css');
    assert.ok(html.includes('id="btn-brand-version"'), 'Debe tener el icono de marca como botón selector');
    assert.ok(html.includes('id="version-select-dialog"'), 'Debe tener el diálogo modal de versiones');
    assert.ok(html.includes('id="option-select-tazo"'), 'Debe tener la opción Hit-Tazo');
    assert.ok(html.includes('id="option-select-cards"'), 'Debe tener la opción Hit-Cards');
  });

  test('web/style.css contiene los estilos del diálogo y referencias a tazo.css y cards.css', () => {
    const css = fs.readFileSync(path.join(projectRoot, 'web', 'style.css'), 'utf-8');

    assert.ok(css.includes("@import url('css/tazo.css');"), 'Debe importar css/tazo.css');
    assert.ok(css.includes("@import url('css/cards.css');"), 'Debe importar css/cards.css');
    assert.ok(css.includes('.version-modal'), 'Debe incluir estilos para el modal de versión');
    assert.ok(css.includes('.version-options-grid'), 'Debe incluir estilos para el grid de opciones');
    assert.ok(css.includes('.brand-icon.version-cards'), 'Debe incluir estilo variante para la versión cards');
  });

  test('Los archivos CSS dedicados existen y tienen contenido válido', () => {
    const tazoCSS = fs.readFileSync(path.join(projectRoot, 'web', 'css', 'tazo.css'), 'utf-8');
    const cardsCSS = fs.readFileSync(path.join(projectRoot, 'web', 'css', 'cards.css'), 'utf-8');

    assert.ok(tazoCSS.includes('.disc-physical') || tazoCSS.includes('.tazo-physical'));
    assert.ok(tazoCSS.includes('.disc-notches') || tazoCSS.includes('.tazo-notches'));
    assert.ok(cardsCSS.includes('.hittazos-matte-card'));
    assert.ok(cardsCSS.includes('.card-topbar-minimal'));
  });

});
