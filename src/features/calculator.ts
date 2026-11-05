// Pure domain functions: no UI or persistence dependencies.
export const cents = (value: number | string) => Math.round(Number(value) * 100);
export const money = (value: number) => new Intl.NumberFormat('es-PR', {style:'currency',currency:'USD'}).format(value / 100);
export const percent = (value: number) => new Intl.NumberFormat('es-PR',{maximumFractionDigits:2}).format(value);
export function calculate(limit: number,balance: number,payment: number,purchase=0,target=9){
  if (![limit,balance,payment,purchase].every(Number.isSafeInteger)||![limit,balance,payment,purchase,target].every(Number.isFinite)||limit<=0||Math.min(balance,payment,purchase,target)<0||target>100) throw new Error('Revisa los números: el límite debe ser mayor que cero y los importes no pueden ser negativos.');
  const applied=Math.min(payment,balance), remaining=balance-applied, projected=remaining+purchase;
  return {applied,remaining,projected,current:balance/limit*100,after:remaining/limit*100,projectedPercent:projected/limit*100,needed:Math.max(0,balance-Math.floor(limit*target/100)),targetBalance:Math.floor(limit*target/100),available:Math.max(0,limit-balance),excess:Math.max(0,payment-balance)};
}
export const parseDate = (s: string) => {const [y,m,d]=s.split('-').map(Number);return new Date(y,m-1,d,12)};
export const dateKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
export const addDays=(s: string,n: number)=>{const d=parseDate(s);d.setDate(d.getDate()+n);return dateKey(d)};
export const daysBetween=(a: string,b: string)=>Math.round((parseDate(b).getTime()-parseDate(a).getTime())/86400000);
export const dateLabel=(s: string)=>parseDate(s).toLocaleDateString('es-PR',{day:'numeric',month:'short',year:'numeric'});
export function purchaseCycle(posted: string,cutoff: string){return posted<cutoff?'current':posted===cutoff?'boundary':'next'}
export function status(p: number){return p===0?{tone:'good',label:'Sin saldo'}:p<10?{tone:'good',label:'Utilización baja'}:p<30?{tone:'watch',label:'Puedes reducirla'}:{tone:'high',label:p>100?'Sobre el límite':'Utilización elevada'}};
