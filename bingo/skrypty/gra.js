const rx = /nazwa=(.*)/g;
const gra = rx.exec(document.location.href)[1];
const tekstGlowny = document.getElementById("tekst-glowny");
const poleGry = document.getElementById("kontener-gry");
const fields = new Array();

function sprawdzWygrana(elem, size) {
  const idx = parseInt(elem.id);
  const row = Math.floor(idx / size);
  const col = idx % size;

  // row check 
  let wonRow = true;
  for (let i = 0; i < size; i++) {
    const elemIdx = row * size + i;
    if (!fields[elemIdx].classList.contains("checked")) {
      wonRow = false;
      break;
    }
  }

  // col check
  let wonCol = true;
  for (let i = 0; i < size; i++) {
    const elemIdx = i * size + col;
    if (!fields[elemIdx].classList.contains("checked")) {
      wonCol = false;
      break;
    }
  }

  console.log(wonCol);

  return wonRow || wonCol;
}

function klikniecie(e, size) {
  if (!e.target.classList.contains("checked"))
    e.target.classList.add("checked");
  else
    e.target.classList.remove("checked");
  
  if (sprawdzWygrana(e.target, size)) {
    document.location.href = "wygrana.html";
  }
}

async function getData() {
  if (!gra.startsWith("{")) {
    const response = await fetch("data/" + gra);
    const json = await response.json();
    render(json);
  } else {
    render(JSON.parse(decodeURIComponent(gra)));
  }
}

function render(daneGry) {
  tekstGlowny.innerText += daneGry.nazwa;
  size = (window.innerWidth > window.innerHeight) ? window.innerWidth : window.innerHeight;
  poleGry.style.height = size + "px";
  poleGry.style.width = size + "px";
  poleGry.style.maxHeight = "800px";
  poleGry.style.maxWidth = "800px";
  poleGry.style.borderColor = "black";
  poleGry.style.borderStyle = "solid";

  const wielkoscPola = poleGry.clientWidth / daneGry.wielkosc;
  const listaPol = daneGry.pola;
  for (let i = 0; i < Math.pow(daneGry.wielkosc, 2); i++) {
    const wyborLosowy = Math.floor(Math.random() * 1000 % listaPol.length);
    const pole = listaPol[wyborLosowy];
    listaPol.splice(listaPol.indexOf(pole), 1);

    const element = document.createElement("p");
    element.style.width = wielkoscPola + "px";
    element.style.height = wielkoscPola +  "px";
    element.innerText = pole;
    element.id = i.toString();
    element.addEventListener("click", e => klikniecie(e, daneGry.wielkosc));
    poleGry.appendChild(element);
    fields.push(element);
  }
}

getData();
