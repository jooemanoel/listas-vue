<script setup>
// Componente raiz: escolhe a tela pela sessão e pela rota (#/...).
import { computed, ref, watch } from "vue";
import BarraSuperior from "./components/BarraSuperior.vue";
import TelaLogin from "./components/TelaLogin.vue";
import TelaListas from "./components/TelaListas.vue";
import TelaNovaLista from "./components/TelaNovaLista.vue";
import TelaLista from "./components/TelaLista.vue";
import AvisoSincronizacao from "./components/AvisoSincronizacao.vue";
import { encerrarSessao, usuario } from "./composables/useSessao.js";
import { rota } from "./composables/useRota.js";
import { useListas } from "./composables/useListas.js";
import { aviso } from "./composables/useAviso.js";

const { carregar, descarregar, apagarDoAparelho, fila } = useListas();
const tituloLista = ref("");

const titulo = computed(() => {
  if (!usuario.value) return "Listas";
  if (rota.value.tela === "nova") return "Nova lista";
  if (rota.value.tela === "lista") return tituloLista.value || "Lista";
  return usuario.value.nome;
});

// Ao entrar (ou abrir o app já logado), carrega as listas: primeiro a cópia guardada
// no aparelho, depois o servidor. Se a sessão expirar, esquece da memória, mas o que
// está guardado no aparelho fica (para sincronizar quando entrar de novo).
watch(
  usuario,
  (atual, anterior) => {
    if (atual?.id === anterior?.id) return;
    descarregar();
    if (atual) carregar(atual.id);
  },
  { immediate: true }
);

watch(titulo, (t) => (document.title = t === "Listas" ? "Listas" : `${t} · Listas`), { immediate: true });

function sair() {
  const n = fila.value.length;
  if (
    n &&
    !confirm(
      `${n} ${n === 1 ? "alteração ainda não foi enviada" : "alterações ainda não foram enviadas"} ao servidor. ` +
        "Se sair agora, elas serão perdidas. Sair mesmo assim?"
    )
  ) {
    return;
  }
  // Em aparelho compartilhado, ninguém que entrar depois vê as listas guardadas.
  apagarDoAparelho();
  encerrarSessao();
  location.hash = "";
}
</script>

<template>
  <BarraSuperior :titulo="titulo" :logado="!!usuario" @sair="sair" />

  <main class="conteudo">
    <AvisoSincronizacao v-if="usuario" />
    <TelaLogin v-if="!usuario" />
    <TelaNovaLista v-else-if="rota.tela === 'nova'" />
    <TelaLista v-else-if="rota.tela === 'lista'" :id="rota.id" :key="rota.id" @titulo="tituloLista = $event" />
    <TelaListas v-else />
  </main>

  <Transition name="aviso">
    <p v-if="aviso" class="aviso" :class="aviso.tipo" role="status" aria-live="polite">{{ aviso.texto }}</p>
  </Transition>
</template>
