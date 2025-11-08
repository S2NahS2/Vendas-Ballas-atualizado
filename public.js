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
  // ——— Munições (preço por unidade; batch=30 produz 30 un.) ———
  {
    id: 'muni_pt',
    name: 'Munição Pistola',
    category: 'Munições',
    price: 150,
    weight: 0.025,
    batch: 30,
    materials: {
      'Cobre': 10,
      'Frascos de pólvora': 2
    }
  },
  {
    id: 'muni_sub',
    name: 'Munição Sub',
    category: 'Munições',
    price: 225,
    weight: 0.025,
    batch: 30,
    materials: {
      'Alumínio': 10,
      'Cobre': 10,
      'Frascos de pólvora': 3
    }
  },
  {
    id: 'muni_rifle',
    name: 'Munição Rifle',
    category: 'Munições',
    price: 290,
    weight: 0.025,
    batch: 30,
    materials: {
      'Alumínio': 20,
      'Cobre': 20,
      'Frascos de pólvora': 5
    }
  }
];

const $   = (s) => document.querySelector(s);
const fmt = (v) => '$' + Number(v).toLocaleString('pt-BR', {
  minimumFractionDigits: 2, maximumFractionDigits: 2
});
const clone = (o) => JSON.parse(JSON.stringify(o));

/**
 * Resolve descontos para geral (armas/outros) e munição.
 * Valores positivos = desconto; valores negativos = sobretaxa.
 * tipo:
 *  - base .................. 0%
 *  - base_2_5 .............. +2.5% (sobretaxa)
 *  - parceria .............. 5%
 *  - parceria10k ........... 5% geral; muni 7.5% se total muni >= 10k
 *  - parceria_especial ..... 10%
 *  - parceria_especial10k .. 10% geral; muni 12.5% se total muni >= 10k
 *  - alianca ............... 15%
 *  - alianca10k ............ 15% geral; muni 17.5% se total muni >= 10k
 *  - interno ............... 20%
 */
function resolveDiscounts(tipo, totalMunicoes) {
  let descontoGeral = 0;
  let descontoMunicao = 0;

  switch (tipo) {
    case 'base':
      descontoGeral = 0;
      descontoMunicao = 0;
      break;
    case 'base10k':
      descontoGeral = 0;
      // Aplica +2.5% SOMENTE se total de munições ≥ 10k
      descontoMunicao = (totalMunicoes >= 10000) ? -2.5 : 0;
      break;
    case 'parceria':
      descontoGeral = descontoMunicao = 5; break;
    case 'parceria10k':
      descontoGeral = 5;
      descontoMunicao = (totalMunicoes >= 10000) ? 7.5 : 5;
      break;
    case 'parceria_especial':
      descontoGeral = descontoMunicao = 10; break;
    case 'parceria_especial10k':
      descontoGeral = 10;
      descontoMunicao = (totalMunicoes >= 10000) ? 12.5 : 10;
      break;
    case 'alianca':
      descontoGeral = descontoMunicao = 15; break;
    case 'alianca10k':
      descontoGeral = 15;
      descontoMunicao = (totalMunicoes >= 10000) ? 17.5 : 15;
      break;
    case 'interno':
      descontoGeral = descontoMunicao = 20; break;
    default:
      descontoGeral = descontoMunicao = 0;
  }
  return { descontoGeral, descontoMunicao };
}

function calc() {
  const comprador       = $('#comprador').value.trim() || '—';
  const faccao          = $('#faccao').value.trim()    || '—';
  const tipo            = $('#tipo').value;
  const upgradeEntregue = $('#upgrade').checked;

  // Quantidades
  const qFS         = parseInt($('#qty_fiveseven').value || '0', 10) || 0;
  const qM          = parseInt($('#qty_m1911').value     || '0', 10) || 0;
  const qMuniPT     = parseInt($('#qty_muni_pt')?.value    || '0', 10) || 0;
  const qMuniSub    = parseInt($('#qty_muni_sub')?.value   || '0', 10) || 0;
  const qMuniRifle  = parseInt($('#qty_muni_rifle')?.value || '0', 10) || 0;

  const items = [];
  if (qFS        > 0) items.push({ p: PRODUCTS.find(x => x.id === 'fiveseven'),  qty: qFS });
  if (qM         > 0) items.push({ p: PRODUCTS.find(x => x.id === 'm1911'),      qty: qM  });
  if (qMuniPT    > 0) items.push({ p: PRODUCTS.find(x => x.id === 'muni_pt'),    qty: qMuniPT });
  if (qMuniSub   > 0) items.push({ p: PRODUCTS.find(x => x.id === 'muni_sub'),   qty: qMuniSub });
  if (qMuniRifle > 0) items.push({ p: PRODUCTS.find(x => x.id === 'muni_rifle'), qty: qMuniRifle });

  const excWrap = document.getElementById('excedentes-wrap');
  const matsBox = document.getElementById('materiais');
  const excBox  = document.getElementById('excedentes');

  if (!items.length) {
    $('#resultado').innerHTML = '<p class="small">Preencha as quantidades e clique em <strong>Calcular</strong>.</p>';
    matsBox.textContent = '';
    excBox.textContent  = '';
    if (excWrap) excWrap.style.display = 'none';
    return;
  }

  // ——— Descontos (com lógica +10k só na munição) ———
  const totalMunicoes = qMuniPT + qMuniSub + qMuniRifle;
  const { descontoGeral, descontoMunicao } = resolveDiscounts(tipo, totalMunicoes);

  const lines      = [`${comprador} (${faccao})`];
  let subtotal     = 0;
  let pesoTotal    = 0;
  const mats       = {};
  const excedentes = [];

  // ——— Cálculo por item ———
  for (const { p, qty } of items) {
    // Detecta munição de forma robusta
    const isAmmo = p.id.startsWith('muni_');
    const descontoAplicado = isAmmo ? descontoMunicao : descontoGeral;

    // Batches só para munição
    const hasBatch = isAmmo && Number(p.batch) > 1;
    let producedBatches = 1;
    let produced = qty;
    let leftover = 0;

    if (hasBatch) {
      producedBatches = Math.ceil(qty / p.batch);
      produced = producedBatches * p.batch;
      leftover = produced - qty;
      excedentes.push({ nome: p.name, produzido: produced, vendido: qty, sobra: leftover });
    }

    // Preço unitário considerando desconto (ou sobretaxa se negativo)
    const unitPrice = p.price * (1 - descontoAplicado / 100);
    const lineTotal = unitPrice * qty;

    subtotal  += lineTotal;
    pesoTotal += (p.weight || 0) * qty;

    // Exibe batches no texto, ex: "45 (2) × Munição Pistola"
    const batchText = (hasBatch && producedBatches > 1) ? ` (${producedBatches})` : '';
    lines.push(`• ${qty}${batchText} × ${p.name} = ${fmt(lineTotal)}`);

    // Materiais (munição usa producedBatches; armas usam qty)
    const mm = clone(p.materials);
    if (upgradeEntregue && mm['Upgrade pistola'] != null) delete mm['Upgrade pistola'];

    const multiplier = hasBatch ? producedBatches : qty;
    for (const [nome, base] of Object.entries(mm)) {
      mats[nome] = (mats[nome] || 0) + base * multiplier;
    }
  }

  // ——— Totais finais ———
  let total = subtotal;
  if (upgradeEntregue) total -= 10000;
  if (total < 0) total = 0;

  const valorSujo = total * 1.30;

  // ——— Render: Orçamento ———
  const resumoHtml =
    lines.join('\n') +
    '\n\n' +
    `Total <span class="text-total">${fmt(total)}</span> | ` +
    `Valor sujo <span class="text-sujo">${fmt(valorSujo)}</span> | ` +
    `Peso ${pesoTotal.toFixed(2)} kg`;

  $('#resultado').innerHTML = resumoHtml;

  // ——— Render: Materiais ———
  const matsText = Object.entries(mats)
    .sort((a, b) => a[0].localeCompare(b[0], 'pt-BR'))
    .map(([nome, qtd]) => `• ${nome}: ${qtd}`)
    .join('\n');

  matsBox.textContent = matsText || '—';

  // ——— Render: Excedentes ———
  if (excedentes.length > 0) {
    const excText = excedentes
      .map(e => `• ${e.nome}: Produzido ${e.produzido} | Vendido ${e.vendido} | Excedente ${e.sobra}`)
      .join('\n');
    excBox.textContent = excText;
    if (excWrap) excWrap.style.display = '';
  } else {
    excBox.textContent = '';
    if (excWrap) excWrap.style.display = 'none';
  }
}

function clearAll() {
  $('#comprador').value = '';
  $('#faccao').value = '';
  $('#tipo').value = 'base';
  $('#upgrade').checked = false;

  ['qty_fiveseven','qty_m1911','qty_muni_pt','qty_muni_sub','qty_muni_rifle'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '0';
  });

  $('#resultado').innerHTML = '<p class="small">Preencha as quantidades e clique em <strong>Calcular</strong>.</p>';
  const matsBox = document.getElementById('materiais');
  const excWrap = document.getElementById('excedentes-wrap');
  const excBox  = document.getElementById('excedentes');
  if (matsBox) matsBox.textContent = '';
  if (excBox)  excBox.textContent  = '';
  if (excWrap) excWrap.style.display = 'none';
}

document.getElementById('calcular').addEventListener('click', calc);
document.getElementById('limpar').addEventListener('click', clearAll);
