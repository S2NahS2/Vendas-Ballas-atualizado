const PRODUCTS = [
  { id:'fiveseven', name:'Five Seven', weight:2.75, price:80000 },
  { id:'m1911', name:'M1911', weight:2.25, price:67000 }
];

const $ = s => document.querySelector(s);
const fmtMoney = v => '$' + v.toLocaleString('pt-BR',{minimumFractionDigits:2});

function calculate(){
  const name = $('#buyerName').value.trim() || '—';
  const faction = $('#buyerFaction').value.trim() || '—';
  const upgrade = $('#upgradeToggle').checked;
  const discount = parseFloat($('#discountKind').value || '0');
  const qFS = parseInt($('#qty_fiveseven').value||'0'), qM = parseInt($('#qty_m1911').value||'0');

  let subtotal = 0, lines=[], totalPeso=0;
  if(qFS>0){ subtotal+=qFS*80000; totalPeso+=qFS*2.75; lines.push(`• ${qFS} × Five Seven = $${(qFS*80000).toLocaleString('pt-BR')}`); }
  if(qM>0){ subtotal+=qM*67000; totalPeso+=qM*2.25; lines.push(`• ${qM} × M1911 = $${(qM*67000).toLocaleString('pt-BR')}`); }

  let descontoValor = subtotal*(discount/100);
  let total = subtotal - descontoValor;
  if(upgrade) total -= 10000;
  let sujo = total*1.3;

  let txt = `— (${name} • ${faction})\n` + lines.join('\n') + 
    `\n\nSubtotal: $${subtotal.toLocaleString('pt-BR')}`+
    (discount>0?`\nDesconto (${discount}%): -$${descontoValor.toLocaleString('pt-BR')}`:'')+
    (upgrade?`\nUpgrade entregue: -$10.000,00`:'')+
    `\n\nTotal: <span class='total-green'>$${total.toLocaleString('pt-BR')}</span> | Valor sujo <span class='total-red'>$${sujo.toLocaleString('pt-BR')}</span> | Peso ${totalPeso.toFixed(2)} kg`;

  $('#result').innerHTML=txt;
}

$('#btnCalc').onclick=calculate;
$('#btnClear').onclick=()=>location.reload();
