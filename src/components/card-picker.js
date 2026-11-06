import {formatAmount,rawAmount} from './money-input.js';
import {loadCards,saveCards,newCard,loadBalances,saveBalances,clearCards} from '../services/cards.js';
export function cardPicker(onChange){
 const el=id=>document.getElementById(id);
 let state=loadCards(),balances=loadBalances(),example=false;
 const current=()=>state.cards.find(c=>c.id===state.selected);
 const fields=['limit','cutoff','due'];
 function status(ok){
  el('storage-status').textContent=ok?'Guardado en este dispositivo. El corte y el pago se repiten cada mes; confirma los días con tu banco.':'El navegador no permite guardar. Puedes calcular, pero tus cambios podrían perderse al cerrar.';
 }
 function persist(){status(saveCards(state))}
 function render(){
  const list=el('card-list');list.replaceChildren();
  for(const card of state.cards){
   const label=document.createElement('label');label.className='card-choice';
   const radio=document.createElement('input');radio.type='radio';radio.name='selected-card';radio.value=card.id;radio.checked=state.selected===card.id;
   const name=document.createElement('span');name.textContent=card.name||'Mi tarjeta';
   radio.onchange=()=>{state.selected=card.id;example=false;fill();persist();onChange()};
   label.append(radio,name);list.append(label);
  }
 }
 function fill(){
  for(const f of fields)el(f).value=f==='limit'?(formatAmount(current()[f])??''):current()[f];
  el('card-name').value=current().name;
  el('balance').value=typeof balances[state.selected]==='string'?(formatAmount(balances[state.selected])??''):'';
  el('example-back').hidden=!example;
  el('card-name').disabled=example;
  render();
 }
 function capture(){
  if(example){el('storage-status').textContent='Ejemplo de práctica. Tus tarjetas guardadas no se modifican.';onChange();return}
  for(const f of fields)current()[f]=f==='limit'?rawAmount(el(f).value):el(f).value;
  balances[state.selected]=rawAmount(el('balance').value);saveBalances(balances);persist();onChange();
 }
 for(const f of [...fields,'balance'])el(f).addEventListener('input',capture);
 el('card-name').addEventListener('input',()=>{current().name=el('card-name').value.slice(0,40);render();persist()});
 el('card-name').addEventListener('blur',()=>{if(!current().name.trim()){current().name='Mi tarjeta';el('card-name').value=current().name;render();persist()}});
 el('add-card').onclick=()=>{const card=newCard(`Tarjeta ${state.cards.length+1}`);state.cards.push(card);state.selected=card.id;example=false;fill();persist();onChange();el('card-name').focus();el('card-name').select()};
 el('delete-card').onclick=()=>{
  if(!confirm(`¿Eliminar «${current().name||'Mi tarjeta'}» y sus datos de este dispositivo?`))return;
  delete balances[state.selected];saveBalances(balances);
  state.cards=state.cards.filter(c=>c.id!==state.selected);
  if(!state.cards.length)state.cards=[newCard()];
  state.selected=state.cards[0].id;example=false;fill();persist();onChange();
 };
 el('reset').onclick=()=>{
  if(!confirm('¿Borrar todas tus tarjetas y sus datos de este dispositivo?'))return;
  const ok=clearCards();const card=newCard();state={cards:[card],selected:card.id};balances={};example=false;fill();status(ok);if(ok)el('storage-status').textContent='Datos borrados. Añade tu primera tarjeta.';onChange();
 };
 el('example-back').onclick=()=>{example=false;fill();persist();onChange()};
 fill();persist();
 return {getCards(){return state.cards.map(c=>({...c}))},example(){example=true;el('example-back').hidden=false;el('card-name').disabled=true;el('storage-status').textContent='Ejemplo de práctica. Tus tarjetas guardadas no se modifican.';}};
}
