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

  const custom_button = document.createElement("a");
  custom_button.classList.add("menu-entry");
  custom_button.addEventListener("click", () => {
    const dialog = document.createElement("dialog");
    const form = document.createElement("form");
    form.method = "GET";
    form.action = "gra.html";
    const label = document.createElement("label");
    label.innerText = "Wpisz URL danych gry: ";
    form.appendChild(label);
    const input = document.createElement("input");
    input.name = "nazwa";
    input.type = "text";
    form.appendChild(input);
    const submit = document.createElement("input");
    submit.type = "submit";
    submit.value = "Ok";
    form.appendChild(submit);

    dialog.appendChild(form);
    dialog.appendChild(document.createElement("hr"));

    const opis = document.createElement("p");
    opis.id = "opis";
    opis.innerText = "URL danych gry, to znaczy link do wygenerowanych wcześniej danych planszy, najłatwiej taki link można zrobyć wysyłając plik z danymi do gry na Discordzie i kopiując jego link.";
    dialog.appendChild(opis);

    dialog.open = "open";
    document.body.appendChild(dialog);
  });
  menuContainer.appendChild(custom_button);

  for (const elem of document.getElementsByClassName("menu-entry")) {
    elem.style.width = size + "px";
    elem.style.height = size + "px";
  }
}

wyswietl();
