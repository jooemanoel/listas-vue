<script setup>
import { ref } from "vue";
import { substituir } from "../composables/useRota.js";
import { useListas } from "../composables/useListas.js";
import { avisarErro } from "../composables/useAviso.js";

const { criar } = useListas();
const nome = ref("");
const enviando = ref(false);

async function enviar() {
  if (!nome.value.trim() || enviando.value) return;
  enviando.value = true;
  try {
    const lista = await criar(nome.value);
    // Abre a lista criada (já pronta para receber itens), sem empilhar no histórico.
    substituir(`/lista/${encodeURIComponent(lista.id)}`);
  } catch (erro) {
    avisarErro(erro);
  } finally {
    enviando.value = false;
  }
}
</script>

<template>
  <section class="cartao">
    <h2 class="titulo-cartao">Nova lista</h2>
    <form class="formulario" @submit.prevent="enviar">
      <label class="campo">
        <span>Nome da lista</span>
        <input v-model="nome" type="text" maxlength="60" autocapitalize="characters" autofocus required />
      </label>
      <button type="submit" class="botao-principal" :disabled="!nome.trim() || enviando">Criar lista</button>
    </form>
  </section>
</template>
