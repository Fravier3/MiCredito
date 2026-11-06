export const rawAmount=value=>String(value).replaceAll(',','');
export function formatAmount(value){
 const raw=rawAmount(value);
 if(!/^\d*(?:\.\d{0,2})?$/.test(raw))return null;
 if(!raw)return '';
 const [whole,fraction]=raw.split('.');
 return (whole||'0').replace(/\B(?=(\d{3})+(?!\d))/g,',')+(fraction===undefined?'':'.'+fraction);
}
export function bindMoneyInput(input){
 let previous=formatAmount(input.value)||'';
 input.addEventListener('input',()=>{
  const position=input.selectionStart??input.value.length;
  const significant=input.value.slice(0,position).replaceAll(',','').length;
  const formatted=formatAmount(input.value);
  if(formatted===null){input.value=previous;return}
  input.value=formatted;previous=formatted;
  let cursor=0,count=0;
  while(cursor<formatted.length&&count<significant){if(formatted[cursor]!==',')count++;cursor++}
  input.setSelectionRange(cursor,cursor);
 });
}
