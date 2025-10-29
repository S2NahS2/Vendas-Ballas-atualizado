const PRODUCTS=[
  {id:'fiveseven',name:'Five Seven',price:80000,weight:2.75,materials:{
    'Alumínio':180,'Cobre':180,'Vidro':215,'Corpo de pistola':1,'Plástico':215,'Borracha':215,'Peças de armas':3,'Engrenagem':1,'Parafusos pequenos':1,'Upgrade pistola':1
  }},
  {id:'m1911',name:'M1911',price:67000,weight:2.25,materials:{
    'Alumínio':150,'Cobre':150,'Vidro':175,'Corpo de pistola':1,'Plástico':175,'Borracha':175,'Peças de armas':3
  }}
];
const $=s=>document.querySelector(s);
const fmt=v=>'$'+Number(v).toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2});
const clone=o=>JSON.parse(JSON.stringify(o));

function calc(){
  const buyer=$('#buyerName').value.trim()||'—';
  const fac=$('#buyerFaction').value.trim()||'—';
  const pct=parseFloat($('#discountKind').value||'0')||0;
  const up=$('#upgradeToggle').checked;
  const qFS=parseInt($('#qty_fiveseven').value||'0',10)||0;
  const qM =parseInt($('#qty_m1911').value||'0',10)||0;

  const items=[]; if(qFS>0) items.push({p:PRODUCTS[0],qty:qFS}); if(qM>0) items.push({p:PRODUCTS[1],qty:qM});
  if(!items.length){ $('#result').classList.add('muted'); $('#result').innerHTML='Preencha as quantidades e clique em <strong>Calcular</strong>.'; $('#materials').innerHTML=''; return; }

  const lines=['— (—)'];
  let subtotal=0, weight=0; const mats={};

  for(const {p,qty} of items){
    lines.push(`• ${qty} × ${p.name} = ${fmt(p.price*qty)}`);
    subtotal += p.price*qty;
    weight += (p.weight||0)*qty;

    const mm = clone(p.materials);
    if(up && mm['Upgrade pistola']!=null) delete mm['Upgrade pistola'];
    for(const [k,v] of Object.entries(mm)){ mats[k]=(mats[k]||0)+v*qty; }
  }

  let total=subtotal - subtotal*(pct/100);
  if(up) total -= 10000;
  if(total<0) total=0;
  const dirty= total*1.30;

  $('#result').classList.remove('muted');
  $('#result').innerHTML = lines.join('\n') + '\n\n' + `Total <span class="total-green">${fmt(total)}</span> | Valor sujo <span class="total-red">${fmt(dirty)}</span> | Peso ${weight.toFixed(2)} kg`;

  const matsLines = Object.entries(mats).sort((a,b)=>a[0].localeCompare(b[0],'pt-BR')).map(([k,v])=>`• ${k}: ${v}`);
  $('#materials').innerHTML = matsLines.join('\n');
}

function clearAll(){
  $('#buyerName').value=''; $('#buyerFaction').value=''; $('#discountKind').value='0'; $('#upgradeToggle').checked=false;
  $('#qty_fiveseven').value='0'; $('#qty_m1911').value='0';
  $('#result').classList.add('muted'); $('#result').innerHTML='Preencha as quantidades e clique em <strong>Calcular</strong>.'; $('#materials').innerHTML='';
}

$('#btnCalc').addEventListener('click',calc);
$('#btnClear').addEventListener('click',clearAll);
