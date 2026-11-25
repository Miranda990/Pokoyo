
const carrinho = [];

let resumoAtual = { subtotal: 0, percentualDesconto: 0, valorDesconto: 0, totalFinal: 0 };

const formProduto = document.getElementById("formProduto");
const inputNome = document.getElementById("nome");
const selectCategoria = document.getElementById("categoria");
const inputValor = document.getElementById("valorUnitario");
const inputQuantidade = document.getElementById("quantidade");
const btnExportar = document.getElementById("btnExportar");
const mensagem = document.getElementById("mensagem");
const listaItens = document.getElementById("listaItens");
const resumo = document.getElementById("resumo");
const saidaJson = document.getElementById("saidaJson");

function formatarMoeda(valor) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function arredondar(valor) {
  return Math.round(valor * 100) / 100;
}

function mostrarMensagem(texto, ehErro) {
  mensagem.textContent = texto;
  mensagem.className = ehErro ? "erro" : "sucesso";
}


function obterPercentualDesconto(subtotal) {
  let percentual;

  if (subtotal >= 1000) {
    percentual = 12;
  } else if (subtotal >= 500) {
    percentual = 5;
  } else {
    percentual = 0;
  }

  return percentual;
}

function calcularResumo(subtotal) {
  const percentualDesconto = obterPercentualDesconto(subtotal);
  const valorDesconto = arredondar(subtotal * (percentualDesconto / 100));
  const totalFinal = arredondar(subtotal - valorDesconto);

  return { subtotal, percentualDesconto, valorDesconto, totalFinal };
}


function criarCelula(texto, classe) {
  const td = document.createElement("td");
  td.textContent = texto;
  if (classe) {
    td.className = classe;
  }
  return td;
}

function atualizarTela() {
  listaItens.innerHTML = "";
  let subtotal = 0;

  if (carrinho.length === 0) {
    const linhaVazia = document.createElement("tr");
    linhaVazia.className = "linha-vazia";
    const celula = criarCelula("Nenhum produto no carrinho. Preencha o formulário para adicionar.");
    celula.colSpan = 6;
    linhaVazia.appendChild(celula);
    listaItens.appendChild(linhaVazia);
  }

  for (let i = 0; i < carrinho.length; i++) {
    const item = carrinho[i];
    const linha = document.createElement("tr");

    linha.appendChild(criarCelula(item.nome));
    linha.appendChild(criarCelula(item.categoria));
    linha.appendChild(criarCelula(formatarMoeda(item.valorUnitario), "num"));
    linha.appendChild(criarCelula(item.quantidade, "num"));
    linha.appendChild(criarCelula(formatarMoeda(item.subtotalItem), "num"));

    const celulaAcao = document.createElement("td");
    const btnRemover = document.createElement("button");
    btnRemover.type = "button";
    btnRemover.className = "btn-remover";
    btnRemover.textContent = "Remover";
    btnRemover.dataset.indice = i;
    btnRemover.setAttribute("aria-label", "Remover " + item.nome);
    celulaAcao.appendChild(btnRemover);
    linha.appendChild(celulaAcao);

    listaItens.appendChild(linha);

    subtotal += item.subtotalItem;
  }

  subtotal = arredondar(subtotal);
  resumoAtual = calcularResumo(subtotal);

  resumo.innerHTML =
    "<p><span>Subtotal</span><strong>" + formatarMoeda(resumoAtual.subtotal) + "</strong></p>" +
    "<p><span>Desconto (" + resumoAtual.percentualDesconto + "%)</span><strong>- " +
      formatarMoeda(resumoAtual.valorDesconto) + "</strong></p>" +
    '<p class="total"><span>Total Final</span><span>' + formatarMoeda(resumoAtual.totalFinal) + "</span></p>";

  saidaJson.textContent = "";
}

function adicionarItem(evento) {
  evento.preventDefault();

  const nome = inputNome.value.trim();
  const categoria = selectCategoria.value;
  const valorUnitario = parseFloat(inputValor.value);
  const quantidade = Number(inputQuantidade.value);

  if (nome === "") {
    mostrarMensagem("Informe o nome do produto.", true);
    inputNome.focus();
  } else if (isNaN(valorUnitario) || valorUnitario <= 0) {
    mostrarMensagem("Informe um valor unitário maior que zero.", true);
    inputValor.focus();
  } else if (!Number.isInteger(quantidade) || quantidade < 1) {
    mostrarMensagem("Informe uma quantidade inteira maior ou igual a 1.", true);
    inputQuantidade.focus();
  } else {
    const produto = {
      nome: nome,
      categoria: categoria,
      valorUnitario: valorUnitario,
      quantidade: quantidade,
      subtotalItem: arredondar(valorUnitario * quantidade)
    };

    carrinho.push(produto);
    atualizarTela();

    mostrarMensagem('"' + nome + '" adicionado ao carrinho.', false);
    formProduto.reset();
    inputNome.focus();
  }
}

function removerItem(evento) {
  const botao = evento.target.closest("button[data-indice]");

  if (botao) {
    const indice = Number(botao.dataset.indice);
    const removido = carrinho.splice(indice, 1)[0];
    atualizarTela();
    mostrarMensagem('"' + removido.nome + '" removido do carrinho.', false);
  }
}

function exportarPedido() {
  if (carrinho.length === 0) {
    mostrarMensagem("Adicione ao menos um produto antes de exportar o pedido.", true);
    saidaJson.textContent = "";
    return;
  }

  const pedido = {
    dataHora: new Date().toLocaleString("pt-BR"),
    itens: carrinho,
    subtotal: resumoAtual.subtotal,
    percentualDesconto: resumoAtual.percentualDesconto,
    valorDesconto: resumoAtual.valorDesconto,
    totalFinal: resumoAtual.totalFinal
  };

  saidaJson.textContent = JSON.stringify(pedido, null, 2);
  mostrarMensagem("Pedido exportado com sucesso.", false);
}


formProduto.addEventListener("submit", adicionarItem);
listaItens.addEventListener("click", removerItem);
btnExportar.addEventListener("click", exportarPedido);

atualizarTela();