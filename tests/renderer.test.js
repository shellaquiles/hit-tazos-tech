// Automated Unit Tests for CardRenderer
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { CardRenderer } from '../web/core/renderer.js';

describe('CardRenderer — Templating & Formatting', () => {

  const renderer = new CardRenderer({
    domains: { 'languages-runtimes': 'Lenguajes' },
    tags: { 'python-genesis': 'Python' },
    volumes: { 'kernel-foundations': 'Volumen 0' }
  });

  const mockCard = {
    id: 'vol0-0x05',
    volumen: 'kernel-foundations',
    domain: 'languages-runtimes',
    tag: 'python-genesis',
    hito: 'Lanzamiento de **Python 0.9.0** por Guido van Rossum.',
    year: 1991,
    autor: 'Guido van Rossum (CWI)',
    trivia: 'Nombrado en honor a Monty Python.'
  };

  test('Renderiza disco con radio seguro r=112', () => {
    const html = renderer.buildDiscHTML(mockCard);
    assert.ok(html.includes('d="M 38,150 A 112,112 0 0,1 262,150"'));
    assert.ok(html.includes('d="M 38,150 A 112,112 0 0,0 262,150"'));
    assert.ok(html.includes('disc-physical'));
    assert.ok(html.includes('disc-face-front'));
    assert.ok(html.includes('disc-face-back'));
  });

  test('Renderiza tarjeta cuadrada con clases correctas', () => {
    const html = renderer.buildSquareCardHTML(mockCard);
    assert.ok(html.includes('hittazos-card-3d'));
    assert.ok(html.includes('card-sheet sheet-front'));
    assert.ok(html.includes('card-sheet sheet-back'));
    assert.ok(html.includes('Lanzamiento de <strong>Python 0.9.0</strong>'));
  });

  test('Formatea Markdown a HTML seguro', () => {
    const md = 'Uso de **negrita** y *cursiva* con `código`.';
    const parsed = renderer.formatMarkdown(md);
    assert.ok(parsed.includes('<strong>negrita</strong>'));
    assert.ok(parsed.includes('<em>cursiva</em>'));
    assert.ok(parsed.includes('<code>código</code>'));
  });

  test('Genera paletas correctas por dominio', () => {
    const palette = renderer.getDiscPalette(mockCard);
    assert.ok(palette.c1);
    assert.ok(palette.c2);
    assert.equal(palette.c1, '#0f172a');
  });

});
