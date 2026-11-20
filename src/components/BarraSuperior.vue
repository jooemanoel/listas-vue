<script setup>
// Barra superior: título e, com o usuário logado, os três atalhos que antes
// ficavam escondidos no menu lateral (nova lista, minhas listas, sair).
import Icone from "./Icone.vue";
import { ocupado } from "../services/api.js";
import { rota, ir } from "../composables/useRota.js";
import { useListas } from "../composables/useListas.js";

const { conexao } = useListas();

defineProps({
  titulo: { type: String, required: true },
  logado: { type: Boolean, default: false },
});
defineEmits(["sair"]);
</script>

<template>
  <header class="barra">
    <h1 class="titulo reticencias">{{ titulo }}</h1>
    <span v-if="logado && conexao === 'offline'" class="chip-offline" title="Sem conexão: alterações guardadas neste aparelho">
      Offline
    </span>

    <span class="carregando" :class="{ visivel: ocupado }" role="status">
      <span v-if="ocupado" class="oculto">Carregando…</span>
    </span>

    <nav v-if="logado" class="acoes-barra" aria-label="Menu principal">
      <button
        class="botao-icone"
        title="Nova lista"
        aria-label="Nova lista"
        :aria-current="rota.tela === 'nova' ? 'page' : undefined"
        @click="ir('/nova')"
      >
        <Icone nome="novaLista" />
      </button>
      <button
        class="botao-icone"
        title="Minhas listas"
        aria-label="Minhas listas"
        :aria-current="rota.tela === 'listas' ? 'page' : undefined"
        @click="ir('/')"
      >
        <Icone nome="listas" />
      </button>
      <button class="botao-icone" title="Sair" aria-label="Sair" @click="$emit('sair')">
        <Icone nome="sair" />
      </button>
    </nav>
  </header>
</template>
