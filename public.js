// =================== CATÁLOGO ===================
const PRODUCTS = [
  {
    id: 'fiveseven',
    name: 'Five Seven',
    category: 'Pistola',
    price: 80000,
    weight: 2.75,
    batch: 1,
    materials: {
      'Alumínio': 180,
      'Cobre': 180,
      'Vidro': 215,
      'Plástico': 215,
      'Borracha': 215,
      'Corpo de pistola': 1,
      'Peças de armas': 3,
      'Engrenagem': 1,
      'Parafusos pequenos': 1,
      'Upgrade pistola': 1
    },
    materials_rules: {
      omit_on_entrega: ['Upgrade pistola'],
      omit_on_parceria_entrega: ['Upgrade pistola']
    }
  },
  {
    id: 'm1911',
    name: 'M1911',
    category: 'Pistola',
    price: 67000,
    weight: 2.25,
    batch: 1,
    materials: {
      'Alumínio': 150,
      'Cobre': 150,
      'Vidro': 175,
      'Corpo de pistola': 1,
      'Plástico': 175,
      'Borracha': 175,
      'Peças de armas': 3
    }
  },
  {
    id: 'munipt',
    name: 'Munição Pistola',
    category: 'Munições',
    price: 150,
    weight: 0.025,
    batch: 30,
    materials: {
      'Cobre': 15,
      'Frascos de pólvora': 3
    }
  },
  {
    id: 'munisub',
    name: 'Munição Sub',
    category: 'Munições',
    price: 225,
    weight: 0.025,
    batch: 30,
    materials: {
      'Alumínio': 15,
      'Cobre': 15,
      'Frascos de pólvora': 5
    }
  },
  {
    id: 'munirifle',
    name: 'Munição Rifle',
    category: 'Munições',
    price: 290,
    weight: 0.025,
    batch: 30,
    materials: {
      'Alumínio': 30,
      'Cobre': 30,
      'Frascos de pólvora': 8
    }
  }
];

const $    = (s) => document.querySelector(s);
const fmt  = (v) => '$' + Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const clone = (o) => JSON.parse(JSON.stringify(o));

function calc() {
  const comprador = $('#comprador').value.trim() || '—';
  const faccao    = $('#faccao').value.trim()    || '—';

  // "tipo" = % de desconto (0, 5, 10, 15, 20)
  const descontoPct = parseFloat($('#tipo').value || '0') || 0;

  // upgrade entregue → omite "Upgrade pistola" e -$10.000 no total
  const upgradeEntregue = $('#upgrade').checked;

  // quantidades
  const qFS        = parseInt($('#qty_fiveseven').value || '0', 10) || 0;
  const qM         = parseInt($('#qty_m1911').value     || '0', 10) || 0;
  const qMuniPT    = parseInt($('#qty_muni_pt')?.value      || '0', 10) || 0;
  const qMuniSub   = parseInt($('#qty_muni_sub')?.value     || '0', 10) || 0;
  const qMuniRifle = parseInt($('#qty_muni_rifle')?.value   || '0', 10) || 0;

  const items = [];
  if (qFS        > 0) items.push({ p: PRODUCTS.find(x => x.id === 'fiveseven'),  qty: qFS });
  if (qM         > 0) items.push({ p: PRODUCTS.find(x => x.id === 'm1911'),      qty: qM  });
  if (qMuniPT    > 0) items.push({ p: PRODUCTS.find(x => x.id === 'muni_pt'),    qty: qMuniPT });
  if (qMuniSub   > 0) items.push({ p: PRODUCTS.find(x => x.id === 'muni_sub'),   qty: qMuniSub });
  if (qMuniRifle > 0) items.push({ p: PRODUCTS.find(x => x.id === 'muni_rifle'), qty: qMuniRifle });

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
    // preço unitário com desconto aplicado
    const unitPrice = p.price * (1 - descontoPct / 100);
    const lineTotal = unitPrice * qty;

    lines.push(`• ${qty} × ${p.name} = ${fmt(unitPrice)} (un.) — ${fmt(lineTotal)}`);

    subtotal  += lineTotal;
    pesoTotal += (p.weight || 0) * qty;

    const mm = clone(p.materials);
    if (upgradeEntregue && mm['Upgrade pistola'] != null) {
      delete mm['Upgrade pistola'];
    }
    for (const [nome, base] of Object.entries(mm)) {
      mats[nome] = (mats[nome] || 0) + base * qty;
    }
  }

  // desconto fixo de upgrade (-$10.000) se marcado
  let total = subtotal;
  if (upgradeEntregue) total -= 10000;
  if (total < 0) total = 0;

  const valorSujo = total * 1.30;

  // resumo (Total verde, Sujo vermelho)
  const resumoHtml =
    lines.join('\n') +
    '\n\n' +
    `Total <span class="text-total">${fmt(total)}</span> | ` +
    `Valor sujo <span class="text-sujo">${fmt(valorSujo)}</span> | ` +
    `Peso ${pesoTotal.toFixed(2)} kg`;

  $('#resultado').innerHTML = resumoHtml;

  // materiais (sem bullet duplicado)
  const matsLines = Object.entries(mats)
    .sort((a, b) => a[0].localeCompare(b[0], 'pt-BR'))
    .map(([nome, qtd]) => `<li>${nome}: ${qtd}</li>`)
    .join('');
  $('#materiais').innerHTML = matsLines || '';
}

function clearAll() {
  $('#comprador').value = '';
  $('#faccao').value = '';
  $('#tipo').value = '0';
  $('#upgrade').checked = false;

  // zera todas as quantidades (pistolas + munições)
  ['qty_fiveseven','qty_m1911','qty_muni_pt','qty_muni_sub','qty_muni_rifle'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '0';
  });

  $('#resultado').innerHTML = '<p class="small">Preencha as quantidades e clique em <strong>Calcular</strong>.</p>';
  $('#materiais').innerHTML = '';
}

document.getElementById('calcular').addEventListener('click', calc);
document.getElementById('limpar').addEventListener('click', clearAll);
