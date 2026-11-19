// Estado das listas do usuário e as ações sobre elas.
// Marcar e remover itens atualizam a tela na hora e desfazem se a API recusar.
import { ref } from "vue";
import * as api from "../services/api.js";
import { avisarErro } from "./useAviso.js";

/** Listas do usuário (null = ainda não carregadas). */
const listas = ref(null);

function guardar(lista) {
  if (!listas.value) return;
  const i = listas.value.findIndex((l) => l.id === lista.id);
  if (i >= 0) listas.value[i] = lista;
  else listas.value = [...listas.value, lista].sort((a, b) => a.nome.localeCompare(b.nome));
}

function encontrar(id) {
  return listas.value?.find((l) => l.id === id) ?? null;
}

export function useListas() {
  return {
    listas,
    encontrar,

    async carregar() {
      try {
        listas.value = await api.buscarListas();
      } catch (erro) {
        avisarErro(erro);
      }
    },

    /** Busca uma lista (do servidor, para pegar alterações feitas em outro aparelho). */
    async abrir(id) {
      const lista = await api.buscarLista(id);
      guardar(lista);
      return lista;
    },

    async criar(nome) {
      const lista = await api.criarLista(nome);
      guardar(lista);
      return lista;
    },

    async excluir(id) {
      try {
        await api.excluirLista(id);
        listas.value = listas.value?.filter((l) => l.id !== id) ?? null;
        return true;
      } catch (erro) {
        avisarErro(erro);
        return false;
      }
    },

    async adicionarItem(listaId, nome) {
      guardar(await api.adicionarItem(listaId, nome));
    },

    async marcarItem(listaId, item, marcado) {
      item.marcado = marcado; // resposta imediata na tela
      try {
        guardar(await api.marcarItem(listaId, item.id, marcado));
      } catch (erro) {
        item.marcado = !marcado;
        avisarErro(erro);
      }
    },

    async removerItem(listaId, itemId) {
      const lista = encontrar(listaId);
      const antes = lista?.itens;
      if (lista) lista.itens = lista.itens.filter((i) => i.id !== itemId);
      try {
        guardar(await api.removerItem(listaId, itemId));
      } catch (erro) {
        if (lista) lista.itens = antes;
        avisarErro(erro);
      }
    },

    /** Ao sair, nada do usuário anterior fica na memória. */
    limpar() {
      listas.value = null;
    },
  };
}
