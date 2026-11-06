const KEY='micredito-cards-v1';
const SESSION='micredito-card-balances-v1';
const LEGACY='micredito-session-v1';
const read=(storage,key)=>{try{return JSON.parse(storage().getItem(key)||'null')}catch{return null}};
const local=()=>globalThis.localStorage;
const session=()=>globalThis.sessionStorage;
export const newCard=(name='Mi tarjeta')=>({id:crypto.randomUUID(),name,limit:'',cutoff:'',due:''});
const str=(value,max=40)=>typeof value==='string'?value.slice(0,max):'';
export function loadCards(){
 const saved=read(local,KEY);
 if(saved?.version===1&&Array.isArray(saved.cards)){
  const ids=new Set();
  const cards=saved.cards.filter(c=>c&&typeof c.id==='string'&&c.id&&!ids.has(c.id)&&ids.add(c.id)).map(c=>({id:c.id,name:str(c.name)||'Mi tarjeta',limit:str(c.limit),cutoff:str(c.cutoff,10),due:str(c.due,10)}));
  if(cards.length)return {cards,selected:cards.some(c=>c.id===saved.selected)?saved.selected:cards[0].id};
 }
 const old=read(session,LEGACY);
 const card={...newCard(),limit:str(old?.limit),cutoff:str(old?.cutoff,10),due:str(old?.due,10)};
 return {cards:[card],selected:card.id};
}
export function saveCards(state){
 try{
  local().setItem(KEY,JSON.stringify({version:1,selected:state.selected,cards:state.cards.map(({id,name,limit,cutoff,due})=>({id,name,limit,cutoff,due}))}));
  session().removeItem(LEGACY);
  return true;
 }catch{return false}
}
export function loadBalances(){const value=read(session,SESSION);return value&&typeof value==='object'&&!Array.isArray(value)?value:{}}
export function saveBalances(value){try{session().setItem(SESSION,JSON.stringify(value));return true}catch{return false}}
export function clearCards(){
 let ok=true;
 for(const [storage,key] of [[local,KEY],[session,SESSION],[session,LEGACY]])try{storage().removeItem(key)}catch{ok=false}
 return ok;
}
