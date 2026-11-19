<script setup>
// Entrar ou criar conta. A senha vai para a API por HTTPS e só ela confere o hash;
// o navegador recebe de volta apenas o token.
import { computed, ref } from "vue";
import Icone from "./Icone.vue";
import { cadastrar, entrar } from "../services/api.js";
import { iniciarSessao } from "../composables/useSessao.js";
import { avisar, avisarErro } from "../composables/useAviso.js";

const cadastro = ref(false);
const nome = ref("");
const senha = ref("");
const confirmacao = ref("");
const mostrarSenha = ref(false);
const enviando = ref(false);

const podeEnviar = computed(
  () => nome.value.trim() && senha.value && (!cadastro.value || confirmacao.value) && !enviando.value
);

function alternarModo() {
  cadastro.value = !cadastro.value;
  confirmacao.value = "";
}

async function enviar() {
  if (!podeEnviar.value) return;
  if (cadastro.value && senha.value !== confirmacao.value) {
    avisar("As senhas não conferem.", "erro");
    return;
  }
  enviando.value = true;
  try {
    const resposta = cadastro.value
      ? await cadastrar(nome.value, senha.value)
      : await entrar(nome.value, senha.value);
    if (cadastro.value) avisar("Conta criada. Bem-vindo(a)!");
    iniciarSessao(resposta);
  } catch (erro) {
    avisarErro(erro);
  } finally {
    enviando.value = false;
  }
}
</script>

<template>
  <section class="cartao">
    <h2 class="titulo-cartao">{{ cadastro ? "Criar conta" : "Entrar" }}</h2>

    <form class="formulario" @submit.prevent="enviar">
      <label class="campo">
        <span>Usuário</span>
        <input v-model="nome" type="text" autocomplete="username" autocapitalize="characters" maxlength="40" required />
      </label>

      <label class="campo">
        <span>Senha</span>
        <span class="campo-com-botao">
          <input
            v-model="senha"
            :type="mostrarSenha ? 'text' : 'password'"
            :autocomplete="cadastro ? 'new-password' : 'current-password'"
            maxlength="64"
            required
          />
          <button
            type="button"
            class="botao-icone"
            :aria-label="mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'"
            :aria-pressed="mostrarSenha"
            @click="mostrarSenha = !mostrarSenha"
          >
            <Icone :nome="mostrarSenha ? 'ocultar' : 'mostrar'" />
          </button>
        </span>
      </label>

      <label v-if="cadastro" class="campo">
        <span>Confirmar senha</span>
        <input
          v-model="confirmacao"
          :type="mostrarSenha ? 'text' : 'password'"
          autocomplete="new-password"
          maxlength="64"
          required
        />
      </label>
      <p v-if="cadastro" class="dica">Nome com pelo menos 3 letras e senha com pelo menos 6 caracteres.</p>

      <button type="submit" class="botao-principal" :disabled="!podeEnviar">
        {{ cadastro ? "Criar conta" : "Entrar" }}
      </button>
      <button type="button" class="botao-secundario" @click="alternarModo">
        {{ cadastro ? "Já tenho conta" : "Criar uma conta" }}
      </button>
    </form>
  </section>

  <section class="cartao informativo">
    <Icone nome="logo" class="icone-grande" />
    <p>
      Crie e gerencie <strong>listas de propósito geral</strong>: compras, tarefas, desejos,
      lembretes e muito mais. Tudo em um só lugar, de forma prática e acessível.
    </p>
  </section>
</template>
