// Sessão do usuário: o token (JWT) emitido pela listas-api e o nome para exibir.
//
// Diferente do app antigo, nada sensível fica no aparelho: nem senha, nem dados
// que deem acesso a outra conta. O token é assinado pela API; alterá-lo o invalida.
import { computed, ref } from "vue";

const CHAVE = "sessao";

function ler() {
  try {
    const sessao = JSON.parse(localStorage.getItem(CHAVE));
    return sessao?.token && !expirado(sessao.token) ? sessao : null;
  } catch {
    return null;
  }
}

/** Lê a validade gravada no próprio token (sem conferir a assinatura: isso é papel da API). */
function expirado(token) {
  try {
    const carga = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
    return typeof carga.exp === "number" && carga.exp * 1000 <= Date.now();
  } catch {
    return true;
  }
}

const sessao = ref(ler());

export const token = computed(() => sessao.value?.token ?? null);
export const usuario = computed(() => sessao.value?.usuario ?? null);

export function iniciarSessao({ token, usuario }) {
  sessao.value = { token, usuario };
  try {
    localStorage.setItem(CHAVE, JSON.stringify(sessao.value));
  } catch {}
}

export function encerrarSessao() {
  sessao.value = null;
  try {
    localStorage.removeItem(CHAVE);
  } catch {}
}
