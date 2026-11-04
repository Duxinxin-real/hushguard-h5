/* Credential storage only. No plaintext secrets or key material are persisted. */
(()=>{
const bytes=s=>Uint8Array.from(atob(s),c=>c.charCodeAt(0)),b64=a=>btoa(String.fromCharCode(...a)),enc=new TextEncoder(),dec=new TextDecoder();
async function derive(password,salt){const base=await crypto.subtle.importKey('raw',enc.encode(password),'PBKDF2',false,['deriveKey']);return crypto.subtle.deriveKey({name:'PBKDF2',salt,iterations:310000,hash:'SHA-256'},base,{name:'AES-GCM',length:256},false,['encrypt','decrypt'])}
async function seal(key,items,salt){const iv=crypto.getRandomValues(new Uint8Array(12));const ciphertext=await crypto.subtle.encrypt({name:'AES-GCM',iv},key,enc.encode(JSON.stringify(items)));return {version:1,kdf:'PBKDF2-SHA256',iterations:310000,salt,iv:b64(iv),ciphertext:b64(new Uint8Array(ciphertext))}}
async function create(password){const salt=b64(crypto.getRandomValues(new Uint8Array(16))),key=await derive(password,bytes(salt));return {key,envelope:await seal(key,[],salt)}}
async function open(password,envelope){if(envelope.version!==1||envelope.iterations!==310000)throw Error('Unsupported vault format');const key=await derive(password,bytes(envelope.salt));const raw=await crypto.subtle.decrypt({name:'AES-GCM',iv:bytes(envelope.iv)},key,bytes(envelope.ciphertext));const items=JSON.parse(dec.decode(raw));if(!Array.isArray(items))throw Error('Invalid vault');return {key,items}}
globalThis.HushVaultCrypto={create,open,seal};
})();
