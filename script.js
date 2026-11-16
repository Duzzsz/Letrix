const MAX_TENTATIVAS = 6;
const TAMANHO_PALAVRA = 5;
const tabuleiro = document.querySelector("#tabuleiro");
const teclado = document.querySelector("#teclado");
const botaoNovaRodada = document.querySelector("#nr");
const botaoReiniciar = document.querySelector("#vdr");
const palavras = [
  "ABRIL", "AMIGO", "AREIA", "ARARA", "ASTRO",
  "AVIAO", "BAILE", "BANCO", "BARCO", "BARRO",
  "BICHO", "BOLDO", "BOLSA", "BRAVO", "BREJO",
  "BRISA", "CABRA", "CAIXA", "CALOR", "CAMPO",
  "CANTO", "CARRO", "CEDRO", "CENAS", "CERVO",
  "CHUVA", "CINZA", "CLARO", "CLIMA", "CORES",
  "CORPO", "CRAVO", "DANCA", "DEDOS", "DENTE",
  "DOCES", "ERVAS", "FASES", "FESTA", "FLORA",
  "FOGAO", "FOLHA", "FONTE", "FORNO", "FRADE",
  "FRUTO", "FURTO", "GALHO", "GATOS", "GELOS",
  "GRAMA", "GRUPO", "HOTEL", "HORTA", "JANTA",
  "JOGOS", "LAGOA", "LENHA", "LIVRO", "LUAIS",
  "LUZES", "MANGA", "MATAS", "MATOS", "METRO",
  "MONTE", "MUDAS", "NAVIO", "NEVOA", "NINHO",
  "NOITE", "NORTE", "NUVEM", "OASIS", "OLHAR",
  "ONDAS", "OUROS", "PASTA", "PEDRA", "PEIXE",
  "PICOS", "PRADO", "PRAIA", "QUASE", "RAMOS",
  "RADIO", "ROCHA", "SEIVA", "SELVA", "SERRA",
  "SOLAR", "SONHO", "TERRA", "TIGRE", "VENTO",
  "VERDE", "VIGOR", "VIRUS", "ZEBRA", "ZELAR"
];

let linhaAtual = 0;
let colunaAtual = 0;

let jogoFinalizado = false;
let reinicioUtilizado = false;
let validandoPalavra = false;


function sortearPalavra() {
    return palavras[
        Math.floor(Math.random() * palavras.length)
    ];
}

let palavraSecreta = sortearPalavra();

console.log("Palavra secreta:", palavraSecreta);


for (let linha = 0; linha < MAX_TENTATIVAS; linha++) {

    const linhaElemento = document.createElement("div");
    linhaElemento.classList.add("linha");

    for (let coluna = 0; coluna < TAMANHO_PALAVRA; coluna++) {

        const celula = document.createElement("div");
        celula.classList.add("celula");

        linhaElemento.appendChild(celula);
    }

    tabuleiro.appendChild(linhaElemento);
}


const teclas = [
    ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
    ["A", "S", "D", "F", "G", "H", "J", "K", "L", "⌫"],
    ["Z", "X", "C", "V", "B", "N", "M", "ENTER"]
];

for (const fileira of teclas) {

    const fileiraElemento = document.createElement("div");
    fileiraElemento.classList.add("fileira");

    for (const tecla of fileira) {

        const botao = document.createElement("button");

        botao.classList.add("tecla");
        botao.textContent = tecla;

        if (tecla === "⌫") {
            botao.classList.add("tecla-apagar");
        }

        if (tecla === "ENTER") {
            botao.classList.add("tecla-enter");
        }

        botao.addEventListener("click", () => aoClicarTecla(tecla));

        fileiraElemento.appendChild(botao);
    }

    teclado.appendChild(fileiraElemento);
}


function aoClicarTecla(tecla) {

    if (jogoFinalizado || validandoPalavra) return;

    const linha = tabuleiro.children[linhaAtual];

    if (tecla === "⌫") {

        if (colunaAtual > 0) {

            colunaAtual--;

            linha.children[colunaAtual].textContent = "";
        }

    } else if (tecla === "ENTER") {

        if (colunaAtual === TAMANHO_PALAVRA) {
            verificarPalavra();
        }

    } else if (colunaAtual < TAMANHO_PALAVRA) {

        linha.children[colunaAtual].textContent = tecla;

        colunaAtual++;
    }
}

async function consultarDicionario(palavra) {

    try {

        const palavraFormatada = palavra.toLowerCase();

        const resposta = await fetch(
            `https://api.dicionario-aberto.net/word/${encodeURIComponent(palavraFormatada)}`
        );

        if (!resposta.ok) {
            return false;
        }

        const dados = await resposta.json();

        return Array.isArray(dados) && dados.some(
            item => item && item.deleted !== 1
        );

    } catch (erro) {

        console.error("Erro ao consultar dicionário:", erro);

        return null;
    }
}


async function verificarPalavra() {

    if (jogoFinalizado || validandoPalavra) return;

    const linha = tabuleiro.children[linhaAtual];

    let tentativa = "";

    for (let i = 0; i < TAMANHO_PALAVRA; i++) {
        tentativa += linha.children[i].textContent;
    }

    validandoPalavra = true;

    const palavraExiste = await consultarDicionario(tentativa);

    validandoPalavra = false;

    if (jogoFinalizado) return;

    
    if (palavraExiste === null) {

        alert("Não foi possível consultar o dicionário. Verifique sua conexão e tente novamente.");

        return;
    }

    
    if (!palavraExiste) {

        alert("Essa palavra não foi encontrada no dicionário português!");

        return;
    }
    
    const letrasSecretas = palavraSecreta.split("");
    const letrasTentativa = tentativa.split("");

    const disponiveis = [...letrasSecretas];

    
    for (let i = 0; i < TAMANHO_PALAVRA; i++) {

        if (letrasTentativa[i] === letrasSecretas[i]) {

            linha.children[i].classList.add("verde");

            disponiveis[i] = null;

            letrasTentativa[i] = null;
        }
    }

    
    for (let i = 0; i < TAMANHO_PALAVRA; i++) {

        if (letrasTentativa[i] === null) continue;

        const indice = disponiveis.indexOf(letrasTentativa[i]);

        if (indice !== -1) {

    
    linha.children[i].classList.add("amarelo");

    disponiveis[indice] = null;

} else {

    
    linha.children[i].classList.add("vinho");

}
    }

    
    if (tentativa === palavraSecreta) {

        jogoFinalizado = true;

        setTimeout(() => {
            alert("PARABÉNS! Você acertou a palavra!");
        }, 200);

        return;
    }

    
    if (linhaAtual === MAX_TENTATIVAS - 1) {

        jogoFinalizado = true;

        setTimeout(() => {
            alert("Fim de jogo! A palavra era: " + palavraSecreta);
        }, 200);

        return;
    }

    
    linhaAtual++;
    colunaAtual = 0;
}

function limparTabuleiro() {

    for (const linha of tabuleiro.children) {

        for (const celula of linha.children) {

            celula.textContent = "";

            celula.classList.remove("verde", "amarelo", "vinho");
        }
    }
}

function reiniciarJogo() {

    if (reinicioUtilizado) {

        alert("Você já utilizou o Reiniciar nesta rodada!");

        return;
    }

    const confirmar = confirm(
        "Deseja reiniciar? Você perderá suas tentativas anteriores."
    );

    if (!confirmar) return;

    reinicioUtilizado = true;

    linhaAtual = 0;
    colunaAtual = 0;

    jogoFinalizado = false;
    validandoPalavra = false;

    limparTabuleiro();

    alert("Jogo reiniciado! Você tem mais uma chance.");
}

function novaRodada() {

    let novaPalavra;

    do {

        novaPalavra = sortearPalavra();

    } while (novaPalavra === palavraSecreta);

    palavraSecreta = novaPalavra;

    linhaAtual = 0;
    colunaAtual = 0;

    jogoFinalizado = false;
    validandoPalavra = false;

    reinicioUtilizado = false;

    limparTabuleiro();

    console.log("Nova palavra:", palavraSecreta);
}
botaoNovaRodada.addEventListener("click", novaRodada);
botaoReiniciar.addEventListener("click", reiniciarJogo);

document.addEventListener("keydown", function(event) {

    if (jogoFinalizado || validandoPalavra) return;

    if (event.key === "Enter") {

        event.preventDefault();
        aoClicarTecla("ENTER");

    }
  
    else if (event.key === "Backspace") {

        event.preventDefault();
        aoClicarTecla("⌫");

    }

    else if (/^[a-zA-Z]$/.test(event.key)) {

        const letra = event.key.toUpperCase();

        aoClicarTecla(letra);

    }

});
