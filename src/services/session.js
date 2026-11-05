// Ephemeral tab session only. Replace this adapter when accounts are introduced.
const key='micredito-session-v1';
export function load(){try{return JSON.parse(sessionStorage.getItem(key)||'null')}catch{return null}}
export function save(value){try{sessionStorage.setItem(key,JSON.stringify(value))}catch{}}
export function clear(){try{sessionStorage.removeItem(key)}catch{}}
