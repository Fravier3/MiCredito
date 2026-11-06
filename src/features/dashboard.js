import {cents,money} from './calculator.ts';
export function renderDashboard(container,cards){
 container.replaceChildren();
 for(const card of cards){
  const panel=document.createElement('article');panel.className='panel dashboard-card';
  const name=document.createElement('h2');name.textContent=card.name||'Mi tarjeta';
  const number=document.createElement('strong');
  const limit=cents(card.limit);
  const valid=card.limit!==''&&Number.isSafeInteger(limit)&&limit>0;
  number.textContent=valid?money(Math.floor(limit*30/100)):'—';
  const label=document.createElement('p');label.textContent=valid?`30% de ${card.name||'Mi tarjeta'}`:'Añade el límite en Calculadora';
  const total=document.createElement('small');total.textContent=valid?`Límite total: ${money(limit)}`:'El importe aparecerá automáticamente.';
  panel.append(name,number,label,total);container.append(panel);
 }
}
