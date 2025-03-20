const gameName = document.getElementById("tekst-glowny");
const gameField = document.getElementById("kontener-gry");
const fields = new Array();

function checkIfWon(elem, size, diag) {
  const idx = parseInt(elem.id);
  const row = Math.floor(idx / size);
  const col = idx % size;
  let won = true;

  // row check 
  for (let i = 0; i < size; i++) {
    const elemIdx = row * size + i;
    if (!fields[elemIdx].classList.contains("checked")) {
      won = false;
      break;
    }
  }
  if (won) return true;
  else won = true;

  // col check
  for (let i = 0; i < size; i++) {
    const elemIdx = i * size + col;
    if (!fields[elemIdx].classList.contains("checked")) {
      won = false;
      break;
    }
  }
  if (won) return true;
  else won = true;

  if (!diag) return false;
  // diag check 1
  for (let i = 0; i < size; i++) {
    const elemIdx = size * i + i;
    
    if (!fields[elemIdx].classList.contains('checked')) {
      won = false;
      break;
    }
  }
  if (won) return true;
  else won = true;

  // diag check 2
  for (let i = 0; i < size; i++) {
    const elemIdx = (size - 1) * (i + 1);

    if (!fields[elemIdx].classList.contains('checked')) {
      won = false;
      break;
    }
  }
  if (won) return true;
  else won = true;
}

function fieldClicked(e, size, diag) {
  if (!e.target.classList.contains("checked"))
    e.target.classList.add("checked");
  else
    e.target.classList.remove("checked");
  
  if (checkIfWon(e.target, size, diag)) {
    document.location.href = "wygrana.html";
  }
}

async function getData() {
  const rx = /id=(.*)/g;
  const game_id = rx.exec(document.location.href)[1];

  const game = sessionStorage.getItem('games').split(';')[game_id];
  render(JSON.parse(atob(game)));
}

function render(gameData) {
  gameName.innerText += gameData.name;
  size = (window.innerWidth > window.innerHeight) ? window.innerWidth : window.innerHeight;
  gameField.style.height = size + "px";
  gameField.style.width = size + "px";
  gameField.style.maxHeight = "800px";
  gameField.style.maxWidth = "800px";
  gameField.style.borderColor = "black";
  gameField.style.borderStyle = "solid";

  const fieldSize = gameField.clientWidth / gameData.size;
  const fieldList = gameData.fields;
  for (let i = 0; i < Math.pow(gameData.size, 2); i++) {
    const randomChoice = Math.floor(Math.random() * 1000 % fieldList.length);
    const field = fieldList[randomChoice];
    fieldList.splice(fieldList.indexOf(field), 1);

    const element = document.createElement("p");
    element.style.width = fieldSize + "px";
    element.style.height = fieldSize +  "px";
    element.innerText = field;
    element.id = i.toString();
    element.addEventListener("click", e => fieldClicked(e, gameData.size, gameData.diagonal));
    gameField.appendChild(element);
    fields.push(element);
  }
}

getData();
