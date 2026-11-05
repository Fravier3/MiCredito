import {appShell} from './features/app-shell.js';
import './styles/app.css';
import {cents,money,percent,calculate,dateKey,addDays,daysBetween,dateLabel,purchaseCycle,status} from './features/calculator.ts';
import {load,save,clear} from './services/session.js';
document.querySelector('#app').innerHTML=appShell;
const el=id=>document.getElementById(id);
const text=(id,value)=>el(id).textContent=value;
const today=()=>dateKey(new Date());
const fields=['limit','balance','cutoff','due'];
let target=30;
const stored=load();
for(const f of fields)if(typeof stored?.[f]==='string')el(f).value=stored[f];
if([30,9,0].includes(Number(stored?.target)))target=Number(stored.target);
function update(){
 const data=Object.fromEntries(fields.map(f=>[f,el(f).value]));save({...data,target});
 for(const b of document.querySelectorAll('[data-target]'))b.setAttribute('aria-pressed',String(Number(b.dataset.target)===target));
 text('error','');
 const goalLabel=target===0?'Saldar todo':target===9?'Quedar por debajo de 10%':'Quedar en 30%';
 text('payment-label',target===0?'Para saldar tu tarjeta':`Paga para ${goalLabel.toLowerCase()}`);
 const numbers=['limit','balance'];
 const invalid=numbers.some(f=>el(f).value!==''&&!el(f).validity.valid);
 let r;
 if(!invalid&&numbers.every(f=>data[f]!=='')){
  try{r=calculate(cents(data.limit),cents(data.balance),0,0,target)}catch(e){text('error',e.message)}
 }
 if(invalid)text('error','Revisa los importes. El límite debe ser mayor que cero; usa hasta dos decimales y saldos de cero o más.');
 if(r){
  const s=status(r.current);el('utilization').innerHTML=`${percent(r.current)}<span>%</span>`;
  text('ratio',`${money(cents(data.balance))} de ${money(cents(data.limit))}`);
  text('status',r.current===30?'En la referencia de 30%':s.label);el('status').className=`badge ${s.tone}`;
  el('meter-fill').style.width=`${Math.min(r.current,100)}%`;el('meter-fill').className=s.tone;
  text('thirty-money',money(Math.floor(cents(data.limit)*.3)));
  text('goal-money',money(r.needed));
  const remaining=cents(data.balance)-r.needed;
  text('remaining',money(remaining));text('after-percent',`${percent(remaining/cents(data.limit)*100)}%`);
  text('goal-note',r.needed===0?(target===0?'Ya tienes la tarjeta saldada.':'Ya cumples esta meta. No necesitas un pago adicional para alcanzarla.'):(target===0?'Este pago cubre todo lo que debes ahora.':`Este es el pago necesario desde tu saldo actual. ${target===9?'Usamos 9% como meta para quedar por debajo de 10%.':'Para quedar por debajo de 30%, paga un poco más o elige menos de 10%.'}`));
  if(r.current>100)text('error','El saldo supera tu límite. Revisa los datos; el cálculo incluye lo que excede el límite.');
 }else{
  el('utilization').innerHTML='—<span>%</span>';text('status','Añade tus datos');el('status').className='badge neutral';el('meter-fill').style.width='0';
  for(const id of ['thirty-money','goal-money','remaining','after-percent'])text(id,'—');
  text('ratio','De tu límite de crédito.');text('goal-note','Añade tu límite y lo que debes.');
 }
 const cut=data.cutoff;
 if(cut&&el('cutoff').validity.valid){
  const days=daysBetween(today(),cut);
  text('when-title',days<0?'Ese corte ya pasó':days===0?'Tu corte es hoy':`Aplicado antes del ${dateLabel(cut)}`);
  text('when-note',days<0?'Actualiza la próxima fecha de corte. Un pago hoy no cambia un estado ya cerrado.':days===0?'Confirma con tu banco si un pago hoy alcanzaría a registrarse antes del cierre. No podemos garantizarlo.':`Faltan ${days} días. Haz el pago con la anticipación que requiera tu banco; no esperes al último día. Si compras antes del corte, revisa el importe otra vez.`);
  const cycle=purchaseCycle(addDays(today(),1),cut);
  text('cycle-answer',days<0?'Ese corte ya pasó. Actualízalo para ubicar una compra futura.':cycle==='current'?`Si mañana (${dateLabel(addDays(today(),1))}) se registra una compra, cuenta en el ciclo que cierra el ${dateLabel(cut)}, aunque hayas saldado hoy. Esa compra aumenta el saldo de este corte; su pago vence después de emitirse ese estado.`:cycle==='boundary'?'Mañana es tu fecha de corte. Una compra registrada ese día puede entrar en este estado o en el siguiente, según el procesamiento del banco.':`Una compra registrada mañana, después del corte del ${dateLabel(cut)}, entra en el siguiente ciclo. Pagar hoy no cambia esa fecha.`);
 }else{text('when-title','¿Cuándo hacer el pago?');text('when-note','Añade tu próximo corte para ver cuándo debe estar aplicado.');text('cycle-answer','Añade la fecha de corte para ubicar una compra registrada mañana.');}
 el('when-title').parentElement.parentElement.classList.toggle('urgent',!!cut&&daysBetween(today(),cut)<=0);
 const due=data.due;
 if(due&&el('due').validity.valid){const d=daysBetween(today(),due);text('due-title',d<0?`El vencimiento del ${dateLabel(due)} ya pasó`:d===0?'Tu fecha de pago es hoy':`Paga tu estado antes del ${dateLabel(due)}`);text('due-note',d<0?'Revisa hoy con tu banco si queda saldo vencido y actualiza la fecha.':`${d===0?'Confirma la hora límite de tu banco. ':''}Paga el saldo completo pendiente del estado de cuenta para evitar intereses en compras, si conservas el período de gracia. ${d>0?`Faltan ${d} días.`:''}`)}else{text('due-title','Añade el próximo vencimiento');text('due-note','Paga el saldo completo pendiente del estado de cuenta antes del vencimiento para evitar intereses en compras, si conservas el período de gracia.');}
}
for(const f of fields)el(f).addEventListener('input',update);
for(const b of document.querySelectorAll('[data-target]'))b.onclick=()=>{target=Number(b.dataset.target);update()};
el('form').onsubmit=e=>e.preventDefault();
el('example').onclick=()=>{el('limit').value='6000';el('balance').value='2000';el('cutoff').value=addDays(today(),5);el('due').value=addDays(today(),2);target=30;update()};
el('reset').onclick=()=>{for(const f of fields)el(f).value='';target=30;clear();update()};
update();
let registration, reloading=false;
const activate=()=>{if(registration?.waiting){navigator.serviceWorker.addEventListener('controllerchange',()=>{if(!reloading){reloading=true;location.reload()}},{once:true});registration.waiting.postMessage('SKIP_WAITING')}};
if(import.meta.env.PROD&&'serviceWorker' in navigator){navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`).then(r=>{registration=r;activate();r.addEventListener('updatefound',()=>{const worker=r.installing;worker?.addEventListener('statechange',()=>{if(worker.state==='installed'&&navigator.serviceWorker.controller)activate()})});r.update().catch(()=>{})}).catch(()=>{});for(const event of ['online','focus'])window.addEventListener(event,()=>registration?.update().catch(()=>{}));}
el('update').onclick=async()=>{try{if(!navigator.onLine){text('update-status','Sin conexión. Puedes seguir calculando.');return}await registration?.update();activate();text('update-status','Comprobación completada.')}catch{text('update-status','No se pudo comprobar. Intenta de nuevo.')}};
