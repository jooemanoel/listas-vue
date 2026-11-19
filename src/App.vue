<script setup>
// Componente raiz: escolhe a tela pela sessão e pela rota (#/...).
import { computed, ref, watch } from "vue";
import BarraSuperior from "./components/BarraSuperior.vue";
import TelaLogin from "./components/TelaLogin.vue";
import TelaListas from "./components/TelaListas.vue";
import TelaNovaLista from "./components/TelaNovaLista.vue";
import TelaLista from "./components/TelaLista.vue";
import { encerrarSessao, usuario } from "./composables/useSessao.js";
import { rota } from "./composables/useRota.js";
import { useListas } from "./composables/useListas.js";
import { aviso } from "./composables/useAviso.js";

const { carregar, limpar } = useListas();
const tituloLista = ref("");

const titulo = computed(() => {
  if (!usuario.value) return "Listas";
  if (rota.value.tela === "nova") return "Nova lista";
  if (rota.value.tela === "lista") return tituloLista.value || "Lista";
  return usuario.value.nome;
});

// Ao entrar (ou abrir o app já logado), carrega as listas; ao sair, apaga da memória.
watch(
  usuario,
  (atual, anterior) => {
    if (atual?.id === anterior?.id) return;
    limpar();
    if (atual) carregar();
  },
  { immediate: true }
);

watch(titulo, (t) => (document.title = t === "Listas" ? "Listas" : `${t} · Listas`), { immediate: true });

function sair() {
  encerrarSessao();
  location.hash = "";
}
</script>

<template>
  <BarraSuperior :titulo="titulo" :logado="!!usuario" @sair="sair" />

  <main class="conteudo">
    <TelaLogin v-if="!usuario" />
    <TelaNovaLista v-else-if="rota.tela === 'nova'" />
    <TelaLista v-else-if="rota.tela === 'lista'" :id="rota.id" :key="rota.id" @titulo="tituloLista = $event" />
    <TelaListas v-else />
  </main>

  <Transition name="aviso">
    <p v-if="aviso" class="aviso" :class="aviso.tipo" role="status" aria-live="polite">{{ aviso.texto }}</p>
  </Transition>
</template>
