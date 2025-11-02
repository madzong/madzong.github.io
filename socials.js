import { zController, Window } from './windows.js';

document.querySelector("#socials-github").addEventListener(
  "click", 
  () => window.open("https://github.com/madzong", "_blank").focus()
);

document.querySelector("#socials-discord").addEventListener("click", () => {
  const window = document.createElement("section");
  window.classList.add("window");

  const windowFrame = document.createElement("div");
  windowFrame.classList.add("window-frame");
  window.appendChild(windowFrame);

  const windowTitle = document.createElement("div");
  windowTitle.classList.add("window-title");
  windowFrame.appendChild(windowTitle);

  const titleImage = document.createElement("img");
  titleImage.src = "assets/icons/info.png";
  windowTitle.appendChild(titleImage);

  const titleText = document.createElement("h1");
  titleText.innerText = "Add me";
  windowTitle.appendChild(titleText);
  
  const exitButton = document.createElement("button");
  exitButton.innerText = "X";
  windowTitle.appendChild(exitButton);

  const windowInner = document.createElement("div");
  windowInner.classList.add("window-inner");
  windowFrame.appendChild(windowInner);

  const windowMessage = document.createElement("p");
  windowMessage.innerText = "My username is @madzong, you have to add me manually, I can't do that for you. Sorry.";
  windowInner.appendChild(windowMessage);

  new Window(window, zController, exitButton);
});

document.querySelector("#socials-instagram").addEventListener(
  "click", 
  () => window.open("https://www.instagram.com/meowdzong", "_blank").focus()
);

document.querySelector("#socials-steam").addEventListener(
  "click",
  () => window.open("https://steamcommunity.com/id/madzong", "_blank").focus()
)
