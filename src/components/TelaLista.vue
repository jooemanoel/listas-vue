<script setup>
// Itens de uma lista: adicionar, marcar/desmarcar e remover.
// Tudo responde na hora (também offline); o servidor recebe na sincronização.
import { computed, nextTick, ref, watch } from "vue";
import Icone from "./Icone.vue";
import { ir } from "../composables/useRota.js";
import { useListas } from "../composables/useListas.js";
import { avisar } from "../composables/useAviso.js";
import { formatarData, listaParaTexto } from "../formatar.js";

const props = defineProps({ id: { type: String, required: true } });
const emit = defineEmits(["titulo"]);

const { listas, encontrar, abrir, adicionarItem, marcarItem, removerItem, conexao } = useListas();

const lista = computed(() => encontrar(props.id));
const novo = ref("");
const campo = ref(null);

// Não marcados primeiro; marcados vão para o fim (ordem de inclusão mantida em cada grupo).
const itens = computed(() => {
  const todos = lista.value?.itens ?? [];
  return [...todos.filter((i) => !i.marcado), ...todos.filter((i) => i.marcado)];
});
const totalMarcados = computed(() => itens.value.filter((i) => i.marcado).length);

watch(lista, (l) => emit("titulo", l?.nome ?? ""), { immediate: true });

// Ao abrir, busca a versão do servidor (pode ter mudado em outro aparelho).
watch(() => props.id, (id) => abrir(id), { immediate: true });

// Listas carregadas e esta não está entre elas: foi excluída (aqui ou em outro aparelho).
watch(
  [listas, lista],
  ([todas, atual]) => {
    if (todas && !atual) {
      avisar("Esta lista não existe mais.", "erro");
      ir("/");
    }
  },
  { immediate: true }
);

async function copiar() {
  const texto = listaParaTexto(lista.value.nome, itens.value);
  try {
    await navigator.clipboard.writeText(texto);
  } catch {
    // Sem a API de área de transferência (ex.: página fora de HTTPS): recurso antigo.
    const area = document.createElement("textarea");
    area.value = texto;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.opacity = "0";
    document.body.appendChild(area);
    area.select();
    const ok = document.execCommand("copy");
    area.remove();
    if (!ok) return avisar("Não foi possível copiar a lista.", "erro");
  }
  avisar("Lista copiada. É só colar no WhatsApp.");
}

async function adicionar() {
  const nome = novo.value.trim();
  if (!nome) return;
  if (adicionarItem(props.id, nome)) novo.value = "";
  await nextTick();
  campo.value?.focus(); // pronto para digitar o próximo item
}
</script>

<template>
  <p v-if="!lista" class="vazio">
    {{ conexao === "offline" ? "Lista não disponível offline neste aparelho." : "Carregando lista…" }}
  </p>

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
      <button type="submit" class="botao-icone destaque" aria-label="Adicionar item" :disabled="!novo.trim()">
        <Icone nome="adicionar" />
      </button>
    </form>

    <!-- Contagem e o atualizadoEm da lista (no servidor, ou a hora da última alteração feita aqui). -->
    <div class="resumo">
      <p>
        <template v-if="itens.length">{{ totalMarcados }} de {{ itens.length }} marcados · </template>
        <template v-if="lista.pendente">
          alterada {{ formatarData(lista.atualizadoEm) }} · <span class="pendente">não sincronizada</span>
        </template>
        <template v-else>atualizada {{ formatarData(lista.atualizadoEm) }}</template>
      </p>
      <button
        v-if="itens.length"
        class="botao-icone"
        title="Copiar lista"
        aria-label="Copiar lista para colar no WhatsApp"
        @click="copiar"
      >
        <Icone nome="copiar" />
      </button>
    </div>

    <section v-if="!itens.length" class="cartao vazio">
      <Icone nome="logo" class="icone-grande" />
      <p>Lista vazia. Digite o nome de um item no campo acima e toque em <strong>+</strong> (ou Enter).</p>
    </section>

    <template v-else>
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
            @click="removerItem(id, item)"
          >
            <Icone nome="excluir" />
          </button>
        </li>
      </TransitionGroup>
    </template>
  </template>
</template>
