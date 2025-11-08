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
  // ——— Munições (preço por unidade; batch=30 produz 30 un. por fabricação) ———
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

const $  = (s) => document.querySelector(s);
const fmt = (v) =>
  '$' + Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const clone = (o) => JSON.parse(JSON.stringify(o));

function calc() {
  const comprador       = $('#comprador').value.trim() || '—';
  const faccao          = $('#faccao').value.trim()    || '—';
  const tipo            = $('#tipo').value;             // <— agora é string (parceria, parceria10k, etc.)
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
    excWrap.style.display = 'none';
    return;
  }

  // ===== Descontos: geral vs munição (lógica +10k) =====
  const totalMunicoes = qMuniPT + qMuniSub + qMuniRifle;

  let descontoGeral   = 0;   // aplica em pistolas e demais itens
  let descontoMunicao = 0;   // aplica SOMENTE nas munições

  switch (tipo) {
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
      descontoGeral = descontoMunicao = 0; break;
  }

  const lines       = [`${comprador} (${faccao})`];
  let subtotal      = 0;
  let pesoTotal     = 0;
  const mats        = {};
  const excedentes  = [];

  // ===== Cálculo por item =====
  for (const { p, qty } of items) {
    const isAmmo          = p.category === 'Munições';
    const descontoAplicado = isAmmo ? descontoMunicao : descontoGeral;

    // Batches (apenas p/ munição)
    const hasBatch = Number(p.batch) > 1;
    let producedBatches = 1;
    let produced        = qty;
    let leftover        = 0;

    if (hasBatch) {
      producedBatches = Math.ceil(qty / p.batch);
      produced        = producedBatches * p.batch;
      leftover        = produced - qty;
      excedentes.push({ nome: p.name, produzido: produced, vendido: qty, sobra: leftover });
    }

    // Preço unitário e total (desconto por categoria)
    const unitPrice = p.price * (1 - descontoAplicado / 100);
    const lineTotal = unitPrice * qty;

    subtotal  += lineTotal;
    pesoTotal += (p.weight || 0) * qty;

    // Mostra número de batches (ex: "45 (2) × Munição Pistola")
    const batchText = (hasBatch && producedBatches > 1) ? ` (${producedBatches})` : '';
    lines.push(`• ${qty}${batchText} × ${p.name} = ${fmt(lineTotal)}`);

    // Materiais (para munição usa producedBatches; armas usam qty)
    const mm = clone(p.materials);
    if (upgradeEntregue && mm['Upgrade pistola'] != null) delete mm['Upgrade pistola'];

    const multiplier = hasBatch ? producedBatches : qty;
    for (const [nome, base] of Object.entries(mm)) {
      mats[nome] = (mats[nome] || 0) + base * multiplier;
    }
  }

  // ===== Totais finais =====
  let total = subtotal;
  if (upgradeEntregue) total -= 10000;
  if (total < 0) total = 0;

  const valorSujo = total * 1.30;

  // ===== Render: Orçamento =====
  const resumoHtml =
    lines.join('\n') +
    '\n\n' +
    `Total <span class="text-total">${fmt(total)}</span> | ` +
    `Valor sujo <span class="text-sujo">${fmt(valorSujo)}</span> | ` +
    `Peso ${pesoTotal.toFixed(2)} kg`;

  $('#resultado').innerHTML = resumoHtml;

  // ===== Render: Materiais =====
  const matsText = Object.entries(mats)
    .sort((a, b) => a[0].localeCompare(b[0], 'pt-BR'))
    .map(([nome, qtd]) => `• ${nome}: ${qtd}`)
    .join('\n');
  matsBox.textContent = matsText || '—';

  // ===== Render: Excedentes =====
  if (excedentes.length > 0) {
    const excText = excedentes
      .map(e => `• ${e.nome}: Produzido ${e.produzido} | Vendido ${e.vendido} | Excedente ${e.sobra}`)
      .join('\n');
    excBox.textContent = excText;
    excWrap.style.display = '';
  } else {
    excBox.textContent = '';
    excWrap.style.display = 'none';
  }
}

function clearAll() {
  $('#comprador').value = '';
  $('#faccao').value = '';
  $('#tipo').value = '0';
  $('#upgrade').checked = false;

  ['qty_fiveseven','qty_m1911','qty_muni_pt','qty_muni_sub','qty_muni_rifle'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '0';
  });

  $('#resultado').innerHTML = '<p class="small">Preencha as quantidades e clique em <strong>Calcular</strong>.</p>';
  document.getElementById('materiais').textContent = '';
  const excWrap = document.getElementById('excedentes-wrap');
  const excBox  = document.getElementById('excedentes');
  excBox.textContent = '';
  excWrap.style.display = 'none';
}

document.getElementById('calcular').addEventListener('click', calc);
document.getElementById('limpar').addEventListener('click', clearAll);
