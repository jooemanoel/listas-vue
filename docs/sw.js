// Service worker: permite instalar o app e abri-lo sem internet.
//
// Só arquivos do próprio app passam por este cache. As respostas da API não passam
// por aqui: a cópia das listas para o modo offline fica no localStorage, por usuário,
// e é apagada ao sair (veja src/composables/useListas.js).
//
// Estratégias:
//   - Navegação: REDE PRIMEIRO (com limite de 3 s), cache como reserva.
//     Online, você sempre recebe a versão mais recente do app.
//   - Demais arquivos: CACHE PRIMEIRO. O Vite põe hash no nome dos arquivos
//     (index-Bx12.js), então um arquivo com o mesmo nome nunca muda.
//
// Ao mudar este arquivo de forma relevante, troque a VERSAO: o cache antigo é apagado.

const VERSAO = "listas-app-v2";

const ARQUIVOS_INICIAIS = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./favicon.svg",
  "./icones/icone-192.png",
  "./icones/icone-512.png",
];

self.addEventListener("install", (evento) => {
  evento.waitUntil(guardarApp());
  self.skipWaiting();
});

/**
 * Guarda a página e também o JS e o CSS que ela usa (assets/index-<hash>.js...).
 * Sem isso, na primeira visita esses arquivos só entrariam no cache numa próxima
 * abertura, e o app aberto offline logo depois ficaria em branco.
 */
async function guardarApp() {
  const cache = await caches.open(VERSAO);
  await cache.addAll(ARQUIVOS_INICIAIS);
  const pagina = await cache.match("./index.html");
  const html = pagina ? await pagina.text() : "";
  const arquivos = [...html.matchAll(/(?:src|href)="\.?\/?(assets\/[^"]+)"/g)].map((m) => "./" + m[1]);
  if (arquivos.length) await cache.addAll(arquivos);
}

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
