import test from 'node:test';import assert from 'node:assert/strict';
import {loadCards,saveCards,newCard,loadBalances,saveBalances,clearCards} from '../src/services/cards.js';
function storage(){const data=new Map();return {getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,v),removeItem:k=>data.delete(k)}}
function setup(){globalThis.localStorage=storage();globalThis.sessionStorage=storage()}
test('three named cards and selection survive a new session; balances do not',()=>{
 setup();const cards=['Sapphire','Discover','Otra'].map(newCard);cards[0].limit='6000';cards[1].limit='3000';cards[2].cutoff='1';
 const state={cards,selected:cards[1].id};assert.equal(saveCards(state),true);saveBalances({[cards[0].id]:'400',[cards[1].id]:'100'});
 assert.equal(loadBalances()[cards[1].id],'100');globalThis.sessionStorage=storage();assert.deepEqual(loadCards(),state);assert.deepEqual(loadBalances(),{});
});
test('delete one profile, retain another and clear only this app data',()=>{
 setup();const first=newCard('Sapphire'),second=newCard('Discover');saveCards({cards:[first,second],selected:first.id});
 saveCards({cards:[second],selected:second.id});assert.deepEqual(loadCards().cards,[second]);localStorage.setItem('other-app','keep');clearCards();assert.equal(loadCards().cards.length,1);assert.equal(loadCards().cards[0].name,'Mi tarjeta');assert.equal(localStorage.getItem('other-app'),'keep');
});
test('legacy session fields migrate; corrupt and unavailable storage are recoverable',()=>{
 setup();sessionStorage.setItem('micredito-session-v1',JSON.stringify({limit:'6000',cutoff:'2026-11-10',due:'2026-11-05'}));const state=loadCards();assert.equal(state.cards[0].limit,'6000');saveCards(state);assert.equal(sessionStorage.getItem('micredito-session-v1'),null);
 localStorage.setItem('micredito-cards-v1','{bad');assert.equal(loadCards().cards.length,1);
 globalThis.localStorage={getItem(){throw Error()},setItem(){throw Error()},removeItem(){throw Error()}};assert.equal(saveCards(state),false);assert.equal(loadCards().cards.length,1);assert.equal(clearCards(),false);
});
test('persistent storage excludes balances, unknown fields and secrets',()=>{
 setup();const card={...newCard(),balance:'999',secret:'not stored'};saveCards({cards:[card],selected:card.id});const saved=JSON.parse(localStorage.getItem('micredito-cards-v1'));assert.equal(saved.cards[0].balance,undefined);assert.equal(saved.cards[0].secret,undefined);
});

test('saved full dates migrate to recurring days without losing card or limit',()=>{
 setup();localStorage.setItem('micredito-cards-v1',JSON.stringify({version:1,selected:'a',cards:[{id:'a',name:'Sapphire',limit:'10000',cutoff:'2026-11-20',due:'2026-12-17'}]}));
 const state=loadCards();assert.deepEqual(state.cards[0],{id:'a',name:'Sapphire',limit:'10000',cutoff:'20',due:'17'});saveCards(state);assert.deepEqual(loadCards(),state);
});
