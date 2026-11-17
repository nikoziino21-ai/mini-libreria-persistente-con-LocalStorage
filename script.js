class Libro {
  letto = false;

  constructor(titolo, autore, anno) {
    this.id = crypto.randomUUID();
    this.titolo = titolo;
    this.autore = autore;
    this.anno = anno;
  }

  segnaComeLetto() {
    this.letto = true;
  }

  formato() {
    return "cartaceo";
  }

  static fromJSON(d) {
    return Object.assign(new this(d.titolo, d.autore, d.anno), d);
  }
}

class LibroDigitale extends Libro {
  constructor(titolo, autore, anno, dimensioneMb) {
    super(titolo, autore, anno);
    this.dimensioneMb = dimensioneMb;
  }

  formato() {
    return `digitale (${this.dimensioneMb} MB)`;
  }
}

const STORAGE_KEY = "libri";

function salvaLibri() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(libri));
}

function caricaLibri() {
  const dati = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
  return dati.map(d => d.dimensioneMb !== undefined ? LibroDigitale.fromJSON(d) : Libro.fromJSON(d));
}

let libri = caricaLibri();


function renderLibri() {
  const lista = document.getElementById("lista-libri");
  const contatore = document.getElementById("contatore-titolo");
  
  const righe = libri.map(l => {
    const li = document.createElement("li");
    li.dataset.id = l.id;
    if (l.letto) {
      li.classList.add("letto");
    }

    const divInfo = document.createElement("div");
    divInfo.className = "info";

    const divTitolo = document.createElement("div");
    divTitolo.className = "info-titolo";
    divTitolo.textContent = l.titolo;

    const badge = document.createElement("span");
    badge.className = "badge";
    badge.textContent = l.formato();
    divTitolo.appendChild(badge);

    const divMeta = document.createElement("div");
    divMeta.className = "meta";
    divMeta.textContent = `${l.autore} — ${l.anno}`;

    divInfo.appendChild(divTitolo);
    divInfo.appendChild(divMeta);

    const divAzioni = document.createElement("div");
    divAzioni.className = "azioni";

    if (l.letto) {
      const spanLetto = document.createElement("span");
      spanLetto.className = "testo-letto";
      spanLetto.textContent = "✓ letto";
      divAzioni.appendChild(spanLetto);
    } else {
      const btnLeggi = document.createElement("button");
      btnLeggi.className = "btn-azione";
      btnLeggi.dataset.azione = "leggi";
      btnLeggi.textContent = "Segna come letto";
      divAzioni.appendChild(btnLeggi);
    }

    const btnRimuovi = document.createElement("button");
    btnRimuovi.className = "btn-azione";
    btnRimuovi.dataset.azione = "rimuovi";
    btnRimuovi.textContent = "Rimuovi";
    divAzioni.appendChild(btnRimuovi);

    li.appendChild(divInfo);
    li.appendChild(divAzioni);

    return li;
  });

  lista.replaceChildren(...righe);
  contatore.textContent = `I tuoi libri (${libri.length})`;
}

const selectFormato = document.getElementById("formato");
const campoDimensione = document.getElementById("campo-dimensione");

selectFormato.addEventListener("change", (e) => {
  campoDimensione.hidden = e.target.value !== "digitale";
});

const formAggiungi = document.getElementById("aggiungi-libro");

formAggiungi.addEventListener("submit", (e) => {
  e.preventDefault();
  
  const dati = Object.fromEntries(new FormData(e.target));
  const anno = Number(dati.anno);
  
  let nuovoLibro;
  if (dati.formato === "digitale") {
    const dimensioneMb = Number(dati.dimensioneMb);
    nuovoLibro = new LibroDigitale(dati.titolo, dati.autore, anno, dimensioneMb);
  } else {
    nuovoLibro = new Libro(dati.titolo, dati.autore, anno);
  }

  libri.push(nuovoLibro);
  salvaLibri();
  renderLibri();
  
  e.target.reset();
  campoDimensione.hidden = true;
});

const listaLibri = document.getElementById("lista-libri");

listaLibri.addEventListener("click", (e) => {
  const bottone = e.target.closest("[data-azione]");
  if (!bottone) return;

  const azione = bottone.dataset.azione;
  const id = bottone.closest("li").dataset.id;

  if (azione === "leggi") {
    const libroTrovato = libri.find(l => l.id === id);
    if (libroTrovato) {
      libroTrovato.segnaComeLetto();
      salvaLibri();
      renderLibri();
    }
  } else if (azione === "rimuovi") {
    libri = libri.filter(l => l.id !== id);
    salvaLibri();
    renderLibri();
  }
});

document.getElementById("svuota-tutto").addEventListener("click", () => {
  libri = [];
  localStorage.removeItem(STORAGE_KEY);
  renderLibri();
});

// Render iniziale
renderLibri();
