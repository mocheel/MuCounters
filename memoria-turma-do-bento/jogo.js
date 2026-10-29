(() => {
  const $ = (id) => document.getElementById(id);
  const telas = ["menu", "jogo", "fim"];
  let estado = null;
  let relogio = null;

  function mostrar(tela) {
    telas.forEach((t) => $(t).classList.toggle("ativa", t === tela));
  }

  // Avatar provisório desenhado em SVG quando o personagem ainda não tem imagem.
  function avatar(p) {
    const el = document.createElement("div");
    el.className = "avatar";
    if (p.imagem) {
      const img = document.createElement("img");
      img.src = p.imagem;
      img.alt = p.nome;
      el.appendChild(img);
    } else {
      el.innerHTML =
        `<svg viewBox="0 0 100 100" role="img" aria-label="${p.nome}">
          <circle cx="50" cy="50" r="50" fill="${p.cor}"/>
          <circle cx="50" cy="56" r="30" fill="#FFE3C4"/>
          <circle cx="40" cy="52" r="4" fill="#4A3B2A"/>
          <circle cx="60" cy="52" r="4" fill="#4A3B2A"/>
          <path d="M40 66 Q50 74 60 66" stroke="#4A3B2A" stroke-width="3" fill="none" stroke-linecap="round"/>
          <text x="50" y="26" font-size="20" font-weight="bold" fill="#fff" text-anchor="middle" font-family="sans-serif">${p.nome.split(" ").map((w) => w[0]).join("")}</text>
        </svg>`;
    }
    return el;
  }

  function embaralhar(lista) {
    for (let i = lista.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [lista[i], lista[j]] = [lista[j], lista[i]];
    }
    return lista;
  }

  function lerRecorde(pares) {
    try { return JSON.parse(localStorage.getItem("recorde-" + pares)); } catch { return null; }
  }

  function salvarRecorde(pares, r) {
    try { localStorage.setItem("recorde-" + pares, JSON.stringify(r)); } catch {}
  }

  function formatarTempo(s) {
    return Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0");
  }

  function atualizarMenu() {
    document.querySelectorAll("[data-recorde]").forEach((el) => {
      const r = lerRecorde(el.dataset.recorde);
      el.textContent = r ? `Recorde: ${r.jogadas} jogadas · ${formatarTempo(r.tempo)}` : "";
    });
  }

  function vibrar(ms) {
    if (navigator.vibrate) navigator.vibrate(ms);
  }

  function iniciar(pares) {
    clearInterval(relogio);
    document.querySelectorAll(".confete").forEach((c) => c.remove());
    const escolhidos = embaralhar([...PERSONAGENS]).slice(0, pares);
    const cartas = embaralhar([...escolhidos, ...escolhidos]);
    estado = { pares, achados: 0, jogadas: 0, tempo: 0, abertas: [], travado: false, comecou: false };

    const tab = $("tabuleiro");
    tab.innerHTML = "";

    cartas.forEach((p) => {
      const carta = document.createElement("div");
      carta.className = "carta";
      carta.dataset.id = p.id;
      carta.innerHTML = `<div class="interior"><div class="face verso"><span>B</span></div><div class="face frente"></div></div>`;
      const frente = carta.querySelector(".frente");
      frente.appendChild(avatar(p));
      const nome = document.createElement("div");
      nome.className = "nome";
      nome.textContent = p.nome;
      frente.appendChild(nome);
      carta.addEventListener("click", () => virar(carta));
      tab.appendChild(carta);
    });

    atualizarPlacar();
    mostrar("jogo");
  }

  function atualizarPlacar() {
    $("jogadas").textContent = estado.jogadas;
    $("pares").textContent = `${estado.achados}/${estado.pares}`;
    $("tempo").textContent = formatarTempo(estado.tempo);
  }

  function virar(carta) {
    if (estado.travado || carta.classList.contains("virada") || carta.classList.contains("par")) return;
    if (!estado.comecou) {
      estado.comecou = true;
      relogio = setInterval(() => { estado.tempo++; atualizarPlacar(); }, 1000);
    }
    carta.classList.add("virada");
    estado.abertas.push(carta);
    if (estado.abertas.length < 2) return;

    estado.jogadas++;
    const [a, b] = estado.abertas;
    estado.abertas = [];
    if (a.dataset.id === b.dataset.id) {
      a.classList.add("par");
      b.classList.add("par");
      estado.achados++;
      vibrar(40);
      atualizarPlacar();
      if (estado.achados === estado.pares) setTimeout(vencer, 600);
    } else {
      estado.travado = true;
      atualizarPlacar();
      setTimeout(() => { a.classList.add("erro"); b.classList.add("erro"); }, 350);
      setTimeout(() => {
        a.classList.remove("virada", "erro");
        b.classList.remove("virada", "erro");
        estado.travado = false;
      }, 1000);
    }
  }

  function vencer() {
    clearInterval(relogio);
    const { pares, jogadas, tempo } = estado;
    // 3 estrelas jogando perfeito ou quase; perde estrelas conforme sobram jogadas.
    const estrelas = jogadas <= pares * 1.5 ? 3 : jogadas <= pares * 2.2 ? 2 : 1;
    $("estrelas").innerHTML = [1, 2, 3].map((i) => `<span class="${i > estrelas ? "apagada" : ""}">⭐</span>`).join("");
    $("resumo").textContent = `Você achou os ${pares} pares em ${jogadas} jogadas e ${formatarTempo(tempo)}.`;

    const r = lerRecorde(pares);
    const melhor = !r || jogadas < r.jogadas || (jogadas === r.jogadas && tempo < r.tempo);
    if (melhor) salvarRecorde(pares, { jogadas, tempo });
    $("novoRecorde").textContent = melhor ? "Novo recorde!" : "";

    confete();
    vibrar([60, 60, 120]);
    mostrar("fim");
  }

  function confete() {
    const cores = PERSONAGENS.map((p) => p.cor);
    for (let i = 0; i < 60; i++) {
      const c = document.createElement("div");
      c.className = "confete";
      c.style.left = Math.random() * 100 + "vw";
      c.style.background = cores[i % cores.length];
      c.style.animationDuration = 1.5 + Math.random() * 2 + "s";
      c.style.animationDelay = Math.random() * 0.5 + "s";
      document.body.appendChild(c);
      setTimeout(() => c.remove(), 4500);
    }
  }

  function voltarMenu() {
    clearInterval(relogio);
    atualizarMenu();
    mostrar("menu");
  }

  PERSONAGENS.forEach((p) => $("turma").appendChild(avatar(p)));
  document.querySelectorAll("[data-pares]").forEach((b) => b.addEventListener("click", () => iniciar(+b.dataset.pares)));
  $("voltar").addEventListener("click", voltarMenu);
  $("menuFim").addEventListener("click", voltarMenu);
  $("denovo").addEventListener("click", () => iniciar(estado.pares));
  atualizarMenu();

  if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
    navigator.serviceWorker.register("sw.js");
  }
})();
