import { zController, Window } from './windows.js';

document.querySelector("#socials-github").addEventListener(
  "click", 
  () => window.open("https://github.com/madzong", "_blank").focus()
);

document.querySelector("#socials-discord").addEventListener("click", () => {
  const windowMessage = document.createElement("p");
  windowMessage.innerHTML = "My username is @madzong, you have to add me manually,<br /> I can't do that for you. Sorry.";

  Window.createWindow(
    "Add me",
    windowMessage,
    zController,
    true,
    "assets/icons/info.png"
  );
});

document.querySelector("#socials-instagram").addEventListener(
  "click", 
  () => window.open("https://www.instagram.com/meowdzong", "_blank").focus()
);

document.querySelector("#socials-steam").addEventListener(
  "click",
  () => window.open("https://steamcommunity.com/id/madzong", "_blank").focus()
)
