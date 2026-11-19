// Camada de acesso à listas-api.
// Os componentes não chamam fetch diretamente: pedem os dados a estas funções.
import { computed, ref } from "vue";
import { encerrarSessao, token } from "../composables/useSessao.js";

const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:3000").replace(/\/$/, "");

export class ErroApi extends Error {
  constructor(status, mensagem) {
    super(mensagem);
    this.status = status;
  }
}

/** Requisições em andamento: alimenta o indicador de carregamento da barra superior. */
const pendentes = ref(0);
export const ocupado = computed(() => pendentes.value > 0);

async function chamar(metodo, caminho, corpo) {
  const headers = {};
  if (corpo !== undefined) headers["Content-Type"] = "application/json";
  if (token.value) headers.Authorization = `Bearer ${token.value}`;

  pendentes.value++;
  try {
    let resposta;
    try {
      resposta = await fetch(API_URL + caminho, {
        method: metodo,
        headers,
        body: corpo === undefined ? undefined : JSON.stringify(corpo),
      });
    } catch {
      throw new ErroApi(0, "Sem conexão com o servidor. Verifique a internet.");
    }

    if (resposta.status === 204) return null;
    const dados = await resposta.json().catch(() => null);

    if (!resposta.ok) {
      // Token vencido ou inválido: volta para a tela de login.
      if (resposta.status === 401 && headers.Authorization) encerrarSessao();
      throw new ErroApi(resposta.status, dados?.erro || `Erro inesperado (HTTP ${resposta.status})`);
    }
    return dados;
  } finally {
    pendentes.value--;
  }
}

const id = encodeURIComponent;

export const entrar = (nome, senha) => chamar("POST", "/auth/login", { nome, senha });
export const cadastrar = (nome, senha) => chamar("POST", "/auth/cadastro", { nome, senha });

export const buscarListas = () => chamar("GET", "/listas");
export const buscarLista = (listaId) => chamar("GET", `/listas/${id(listaId)}`);
export const criarLista = (nome) => chamar("POST", "/listas", { nome });
export const excluirLista = (listaId) => chamar("DELETE", `/listas/${id(listaId)}`);

export const adicionarItem = (listaId, nome) =>
  chamar("POST", `/listas/${id(listaId)}/itens`, { nome });
export const marcarItem = (listaId, itemId, marcado) =>
  chamar("PATCH", `/listas/${id(listaId)}/itens/${id(itemId)}`, { marcado });
export const removerItem = (listaId, itemId) =>
  chamar("DELETE", `/listas/${id(listaId)}/itens/${id(itemId)}`);
