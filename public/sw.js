// Service worker: permite instalar o app e abri-lo sem internet.
//
// Só arquivos do próprio app passam pelo cache. As respostas da API (listas do usuário,
// com token) NUNCA são guardadas: num aparelho compartilhado, quem entrasse depois
// poderia ver as listas de outra pessoa.
//
// Estratégias:
//   - Navegação: REDE PRIMEIRO (com limite de 3 s), cache como reserva.
//     Online, você sempre recebe a versão mais recente do app.
//   - Demais arquivos: CACHE PRIMEIRO. O Vite põe hash no nome dos arquivos
//     (index-Bx12.js), então um arquivo com o mesmo nome nunca muda.
//
// Ao mudar este arquivo de forma relevante, troque a VERSAO: o cache antigo é apagado.

const VERSAO = "listas-app-v1";

const ARQUIVOS_INICIAIS = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./favicon.svg",
  "./icones/icone-192.png",
  "./icones/icone-512.png",
];

self.addEventListener("install", (evento) => {
  evento.waitUntil(caches.open(VERSAO).then((cache) => cache.addAll(ARQUIVOS_INICIAIS)));
  self.skipWaiting();
});

self.addEventListener("activate", (evento) => {
  evento.waitUntil(
    caches
      .keys()
      .then((nomes) => Promise.all(nomes.filter((n) => n !== VERSAO).map((n) => caches.delete(n))))
  );
  self.clients.claim();
});

self.addEventListener("fetch", (evento) => {
  const requisicao = evento.request;
  if (requisicao.method !== "GET") return;
  if (new URL(requisicao.url).origin !== self.location.origin) return; // API: direto na rede

  if (requisicao.mode === "navigate") {
    evento.respondWith(redePrimeiro(requisicao));
  } else {
    evento.respondWith(cachePrimeiro(requisicao));
  }
});

async function redePrimeiro(requisicao) {
  const cache = await caches.open(VERSAO);
  try {
    const resposta = await Promise.race([
      fetch(requisicao),
      new Promise((_, falhar) => setTimeout(() => falhar(new Error("tempo esgotado")), 3000)),
    ]);
    if (resposta.ok) cache.put("./index.html", resposta.clone());
    return resposta;
  } catch (erro) {
    const salva = await cache.match("./index.html");
    if (salva) return salva;
    return fetch(requisicao);
  }
}

async function cachePrimeiro(requisicao) {
  const cache = await caches.open(VERSAO);
  const salva = await cache.match(requisicao);
  if (salva) return salva;

  const resposta = await fetch(requisicao);
  if (resposta.ok) cache.put(requisicao, resposta.clone());
  return resposta;
}
