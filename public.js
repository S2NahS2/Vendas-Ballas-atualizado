// Produtos e materiais
const PRODUCTS = [
  {
    id: 'fiveseven',
    name: 'Five Seven',
    price: 80000,
    weight: 2.75,
    materials: {
      'Alumínio': 180,   // 150 + 30
      'Cobre': 180,      // 150 + 30
      'Vidro': 215,      // 175 + 40
      'Corpo de pistola': 1,
      'Plástico': 215,   // 175 + 40
      'Borracha': 215,   // 175 + 40
      'Peças de armas': 3,
      'Engrenagem': 1,
      'Parafusos pequenos': 1,
      'Upgrade pistola': 1
    }
  },
  {
    id: 'm1911',
    name: 'M1911',
    price: 67000,
    weight: 2.25,
    materials: {
      'Alumínio': 150,
      'Cobre': 150,
      'Vidro': 175,
      'Corpo de pistola': 1,
      'Plástico': 175,
      'Borracha': 175,
      'Peças de armas': 3
    }
  }
];

const $ = (s) => document.querySelector(s);
const fmt = (v) => '$' + Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const clone = (o) => JSON.parse(JSON.stringify(o));

function calc() {
  const comprador = $('#comprador').value.trim() || '—';
  const faccao   = $('#faccao').value.trim() || '—';

  // "tipo" agora representa o % de desconto (0,5,10,15,20)
  const descontoPct = parseFloat($('#tipo').value || '0') || 0;

  // upgrade entregue → desconta 10k no total e omite "Upgrade pistola" dos materiais
  const upgradeEntregue = $('#upgrade').checked;

  // quantidades
  const qFS = parseInt($('#qty_fiveseven').value || '0', 10) || 0;
  const qM  = parseInt($('#qty_m1911').value   || '0', 10) || 0;

  const items = [];
  if (qFS > 0) items.push({ p: PRODUCTS[0], qty: qFS });
  if (qM  > 0) items.push({ p: PRODUCTS[1], qty: qM  });

  if (!items.length) {
    $('#resultado').innerHTML = '<p class="small">Preencha as quantidades e clique em <strong>Calcular</strong>.</p>';
    $('#materiais').innerHTML = '';
    return;
  }

  const lines = [`${comprador} (${faccao})`];
  let subtotal = 0;
  let pesoTotal = 0;
  const mats = {};

  // linhas de itens + soma de materiais
  for (const { p, qty } of items) {
    lines.push(`• ${qty} × ${p.name} = ${fmt(p.price * qty)}`);
    subtotal += p.price * qty;
    pesoTotal += (p.weight || 0) * qty;

    const mm = clone(p.materials);
    if (upgradeEntregue && mm['Upgrade pistola'] != null) {
      delete mm['Upgrade pistola'];
    }
    for (const [nome, base] of Object.entries(mm)) {
      mats[nome] = (mats[nome] || 0) + base * qty;
    }
  }

  // aplica desconto
  let total = subtotal - (subtotal * (descontoPct / 100));

  // aplica desconto fixo de upgrade (se marcado)
  if (upgradeEntregue) total -= 10000;

  if (total < 0) total = 0;
  const valorSujo = total * 1.30;

  // render do orçamento (mantendo estilo do original)
  const resumoHtml =
    lines.join('\n') +
    '\n\n' +
    `Total <span class="text-total">${fmt(total)}</span> | ` +
    `Valor sujo <span class="text-sujo">${fmt(valorSujo)}</span> | ` +
    `Peso ${pesoTotal.toFixed(2)} kg`;

  $('#resultado').innerHTML = resumoHtml;

  // materiais listados como <li>
  const matsLines = Object.entries(mats)
    .sort((a, b) => a[0].localeCompare(b[0], 'pt-BR'))
    .map(([nome, qtd]) => `<li>• ${nome}: ${qtd}</li>`)
    .join('');
  $('#materiais').innerHTML = matsLines || '';
}

function clearAll() {
  $('#comprador').value = '';
  $('#faccao').value = '';
  $('#tipo').value = '0';
  $('#upgrade').checked = false;
  $('#qty_fiveseven').value = '0';
  $('#qty_m1911').value = '0';
  $('#resultado').innerHTML = '<p class="small">Preencha as quantidades e clique em <strong>Calcular</strong>.</p>';
  $('#materiais').innerHTML = '';
}

document.getElementById('calcular').addEventListener('click', calc);
document.getElementById('limpar').addEventListener('click', clearAll);
