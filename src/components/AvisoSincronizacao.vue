<script setup>
// Cartão no topo das telas enquanto o app está offline (ou com alterações que não
// conseguiram ser enviadas): quantas alterações estão guardadas, o histórico delas
// e o alerta para não mexer nas listas em outro aparelho até sincronizar.
import { computed } from "vue";
import { useListas } from "../composables/useListas.js";
import { formatarData } from "../formatar.js";

const { fila, conexao, sincronizadoEm, atualizar } = useListas();

const offline = computed(() => conexao.value === "offline");
const visivel = computed(() => offline.value || (fila.value.length > 0 && conexao.value !== "sincronizando"));
const total = computed(() => fila.value.length);
const historico = computed(() => [...fila.value].reverse()); // mais recente primeiro
</script>

<template>
  <section v-if="visivel" class="cartao sincronizacao" role="status">
    <h2 class="sincronizacao-titulo">{{ offline ? "Modo offline" : "Alterações não enviadas" }}</h2>

    <p v-if="total">
      {{ total }} {{ total === 1 ? "alteração guardada" : "alterações guardadas" }} neste aparelho.
      {{ offline ? "Serão enviadas quando a conexão voltar." : "O envio será tentado de novo." }}
    </p>
    <p v-else>Você pode continuar usando as listas: as alterações ficam guardadas neste aparelho.</p>

    <p class="sincronizacao-alerta">
      Não altere suas listas em outro aparelho até a sincronização terminar.
    </p>

    <details v-if="total" class="sincronizacao-historico">
      <summary>Ver alterações</summary>
      <ol>
        <li v-for="op in historico" :key="op.id">
          <span class="sincronizacao-hora">{{ formatarData(op.em) }}</span>
          {{ op.rotulo }}
        </li>
      </ol>
    </details>

    <div class="sincronizacao-rodape">
      <span v-if="sincronizadoEm" class="dica">Última sincronização: {{ formatarData(sincronizadoEm) }}</span>
      <button type="button" class="botao-secundario" :disabled="conexao === 'sincronizando'" @click="atualizar">
        Tentar agora
      </button>
    </div>
  </section>
</template>
