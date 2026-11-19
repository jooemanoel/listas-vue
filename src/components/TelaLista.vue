<script setup>
// Itens de uma lista: adicionar, marcar/desmarcar e remover.
import { computed, nextTick, ref, watch } from "vue";
import Icone from "./Icone.vue";
import { ir } from "../composables/useRota.js";
import { useListas } from "../composables/useListas.js";
import { avisar, avisarErro } from "../composables/useAviso.js";

const props = defineProps({ id: { type: String, required: true } });
const emit = defineEmits(["titulo"]);

const { encontrar, abrir, adicionarItem, marcarItem, removerItem } = useListas();

const lista = computed(() => encontrar(props.id));
const novo = ref("");
const campo = ref(null);
const enviando = ref(false);

// Não marcados primeiro; marcados vão para o fim (ordem de inclusão mantida em cada grupo).
const itens = computed(() => {
  const todos = lista.value?.itens ?? [];
  return [...todos.filter((i) => !i.marcado), ...todos.filter((i) => i.marcado)];
});
const totalMarcados = computed(() => itens.value.filter((i) => i.marcado).length);

watch(lista, (l) => emit("titulo", l?.nome ?? ""), { immediate: true });

// Sempre busca a versão do servidor ao abrir (pode ter mudado em outro aparelho).
watch(
  () => props.id,
  async (id) => {
    try {
      await abrir(id);
    } catch (erro) {
      if (erro.status === 404) avisar("Esta lista não existe mais.", "erro");
      else avisarErro(erro);
      if (erro.status !== 401) ir("/");
    }
  },
  { immediate: true }
);

async function adicionar() {
  const nome = novo.value.trim();
  if (!nome || enviando.value) return;
  enviando.value = true;
  try {
    await adicionarItem(props.id, nome);
    novo.value = "";
  } catch (erro) {
    avisarErro(erro);
  } finally {
    enviando.value = false;
    await nextTick();
    campo.value?.focus(); // pronto para digitar o próximo item
  }
}
</script>

<template>
  <p v-if="!lista" class="vazio">Carregando lista…</p>

  <template v-else>
    <form class="adicionar-item" @submit.prevent="adicionar">
      <label class="oculto" for="novo-item">Novo item</label>
      <input
        id="novo-item"
        ref="campo"
        v-model="novo"
        type="text"
        placeholder="Adicionar item"
        maxlength="100"
        autocapitalize="characters"
        enterkeyhint="done"
      />
      <button type="submit" class="botao-icone destaque" aria-label="Adicionar item" :disabled="!novo.trim() || enviando">
        <Icone nome="adicionar" />
      </button>
    </form>

    <section v-if="!itens.length" class="cartao vazio">
      <Icone nome="logo" class="icone-grande" />
      <p>Lista vazia. Digite o nome de um item no campo acima e toque em <strong>+</strong> (ou Enter).</p>
    </section>

    <template v-else>
      <p class="resumo">{{ totalMarcados }} de {{ itens.length }} marcados</p>
      <TransitionGroup tag="ul" name="item" class="linhas">
        <li v-for="item in itens" :key="item.id" class="linha" :class="{ feito: item.marcado }">
          <label class="linha-principal">
            <input
              type="checkbox"
              class="oculto"
              :checked="item.marcado"
              @change="marcarItem(id, item, $event.target.checked)"
            />
            <Icone :nome="item.marcado ? 'marcado' : 'desmarcado'" class="caixa" />
            <span class="nome-item">{{ item.nome }}</span>
          </label>
          <button
            class="botao-icone"
            :aria-label="`Remover ${item.nome}`"
            title="Remover item"
            @click="removerItem(id, item.id)"
          >
            <Icone nome="excluir" />
          </button>
        </li>
      </TransitionGroup>
    </template>
  </template>
</template>
