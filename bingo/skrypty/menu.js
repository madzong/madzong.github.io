const menuContainer = document.getElementById("menu");
const pliki = ["boduch.json"];

async function wyswietl() {
  let size = 0;
  for (const plik of pliki) {
    const response = await fetch("data/" + plik);
    const responseJSON = await response.json();
    
    const element = document.createElement("a");
    element.classList.add("menu-entry");
    element.href = "gra.html?nazwa=" + plik; 
    element.innerText = responseJSON.nazwa;

    menuContainer.appendChild(element);
    if (size < element.clientWidth) {
      size = element.clientWidth;
    }
  }

  const custom_button = document.createElement("div");
  custom_button.innerText = "Custom";
  custom_button.classList.add("menu-entry");
  custom_button.addEventListener("click", () => {
    const dialog = document.createElement("dialog");
    const cont = document.createElement("div");
    dialog.appendChild(cont);
    
    const xhr = new XMLHttpRequest();
    xhr.open("GET", "https://motionvid.pl/Bingo/list_games.php");
    xhr.addEventListener("load", function() {
      const json = JSON.parse(this.responseText);

      sessionStorage.setItem("games", json['games']);
      for (let i = 0; i < json['games'].length; i++) {
        const game_data = JSON.parse(atob(json['games'][i]));
        
        const btn = document.createElement("a");
        btn.classList.add('menu-entry');
        btn.innerText = game_data.name;
        btn.href = 'game_custom.html?id=' + i;

        cont.appendChild(btn);
      }
    });
    xhr.send();

    document.body.appendChild(dialog);
    dialog.showModal();
    dialog.addEventListener('mousedown', function(e) { !e.target.closest('div') && this.remove() });
  });
  menuContainer.appendChild(custom_button);

  for (const elem of document.getElementsByClassName("menu-entry")) {
    elem.style.width = size + "px";
    elem.style.height = size + "px";
  }
}

wyswietl();
