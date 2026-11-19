<script setup>
// Minhas listas: abrir ou excluir (a lista vai embora com todos os itens).
import Icone from "./Icone.vue";
import { ir } from "../composables/useRota.js";
import { useListas } from "../composables/useListas.js";
import { avisar } from "../composables/useAviso.js";

const { listas, excluir } = useListas();

const marcados = (lista) => lista.itens.filter((i) => i.marcado).length;

async function confirmarExclusao(lista) {
  const total = lista.itens.length;
  const detalhe = total ? ` e seus ${total} ${total === 1 ? "item" : "itens"}` : "";
  if (!confirm(`Excluir a lista "${lista.nome}"${detalhe}?`)) return;
  if (await excluir(lista.id)) avisar(`Lista "${lista.nome}" excluída.`);
}
</script>

<template>
  <p v-if="listas === null" class="vazio">Carregando listas…</p>

  <section v-else-if="!listas.length" class="cartao vazio">
    <button class="botao-redondo" aria-label="Criar lista" @click="ir('/nova')">
      <Icone nome="adicionar" />
    </button>
    <p>
      Você ainda não tem listas. Crie a primeira pelo botão acima ou pelo ícone
      <Icone nome="novaLista" class="icone-texto" /> na barra superior.
    </p>
  </section>

  <template v-else>
    <h2 class="subtitulo">Minhas listas</h2>
    <ul class="linhas">
      <li v-for="lista in listas" :key="lista.id" class="linha">
        <button class="linha-principal" @click="ir(`/lista/${encodeURIComponent(lista.id)}`)">
          <span class="reticencias">{{ lista.nome }}</span>
          <span class="contagem" :title="`${marcados(lista)} de ${lista.itens.length} marcados`">
            {{ marcados(lista) }}/{{ lista.itens.length }}
          </span>
        </button>
        <button
          class="botao-icone"
          :aria-label="`Excluir a lista ${lista.nome}`"
          title="Excluir lista"
          @click="confirmarExclusao(lista)"
        >
          <Icone nome="excluir" />
        </button>
      </li>
    </ul>
  </template>
</template>
