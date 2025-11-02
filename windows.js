class ZController {
  #zMax = -1;
  #windows = [];

  addWindow(window) {
    this.#windows.push(window);
    window.zIndex = ++this.#zMax;
    this.focus(window);
  }

  focus(window) {
    const oldZ = window.zIndex;
    for (let i = 0; i < this.#windows.length; i++) {
      if (oldZ < this.#windows[i].zIndex) {
        this.#windows[i].zIndex = --this.#windows[i].zIndex;
      }
      this.#windows[i].isActive = false;
    }

    window.zIndex = this.#zMax;
    window.isActive = true;
  }

  removeWindow(window) {
    this.#windows = this.#windows.filter(w => w !== window);
    this.#zMax--;
    this.focus(this.#windows.find(w => w.zIndex == this.#zMax));
  }
}

function randRange(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

export class Window {
  #window;
  #title;
  #x;
  #y;
  #z;
  #offsetX;
  #offsetY;
  #isMoving = false;
  #borderSize;
  #zController;
  #isActive = true;
  #closeButton;

  constructor(windowElem, zController, closeButton) {
    this.#window = windowElem;
    this.#title = this.#window.querySelector(".window-title");

    this.#borderSize = 
      this.#title.getBoundingClientRect().top - 
      this.#window.getBoundingClientRect().top;

    this.#title.addEventListener("mousedown", this);
    this.#title.addEventListener("mouseup", this);
    document.addEventListener("mousemove", this);
    this.#window.addEventListener("mousedown", this);

    this.#zController = zController;
    this.#zController.addWindow(this);

    if (closeButton) {
      this.#closeButton = closeButton;
      this.#closeButton.addEventListener("click", this);
    }

    const style = getComputedStyle(this.#window);
    
    this.#x = randRange(0, window.innerWidth - parseInt(style.width));
    this.#y = randRange(0, window.innerHeight - parseInt(style.height));

    this.#window.style.left = `${this.#x}px`;
    this.#window.style.top = `${this.#y}px`;
  }

  handleEvent(e) {
    switch (e.type) {
      case "mousedown":
        if (e.target === this.#title) {
          this.moveStartHandler(e);
        } else {
          this.#zController.focus(this);
        }
        break;
      case "mouseup":
        this.moveEndHandler();
        break;
      case "mousemove":
        this.moveHandler(e);
        break;
      case "click":
        if (e.target === this.#closeButton) {
          this.close();
        }
        break;
    }
  }

  moveHandler(e) {
    if (this.#isMoving) {
      this.#x = e.x - this.#offsetX;
      this.#y = e.y - this.#offsetY;

      this.#window.style.left = `${this.#x}px`;
      this.#window.style.top = `${this.#y}px`;
      const style = getComputedStyle(this.#window);

      if (parseInt(style.left) < 0) {
        this.#x = 0;
        this.#window.style.left = `${this.#x}px`;
      }
      if (parseInt(style.top) < 0) {
        this.#y = 0;
        this.#window.style.top = `${this.#y}px`;
      }
      if (parseInt(style.right) < 0) {
        this.#x = window.innerWidth - parseInt(style.width);
        this.#window.style.left = `${this.#x}px`;
      }
      if (parseInt(style.bottom) < 0) {
        this.#y = window.innerHeight - parseInt(style.height);
        this.#window.style.top = `${this.#y}px`;
      }
    }
  }

  moveStartHandler(e) {
    this.#offsetX = e.offsetX + this.#borderSize;
    this.#offsetY = e.offsetY + this.#borderSize;

    this.#isMoving = true;

    this.#window.classList.add("unselectable");

    this.#zController.focus(this);
  }

  moveEndHandler() {
    this.#isMoving = false;
    this.#window.classList.remove("unselectable");
  }

  get zIndex() {
    return this.#z;
  }

  set zIndex(z) {
    this.#z = z;
    this.#window.style.zIndex = this.#z;
  }

  set isActive(active) {
    this.#isActive = active;

    if (this.#isActive) {
      this.#window.classList.remove("inactive");
    } else {
      this.#window.classList.add("inactive");
    }
  }

  get isActive() {
    return this.#isActive;
  }

  close() {
    this.#zController.removeWindow(this);
    this.#window.remove();
  }

  static createWindow(title, content, zController, hasCloseButton, icon) {
    const window = document.createElement("section");
    window.classList.add("window");

    const windowFrame = document.createElement("div");
    windowFrame.classList.add("window-frame");
    window.appendChild(windowFrame);

    const windowTitle = document.createElement("div");
    windowTitle.classList.add("window-title");
    windowFrame.appendChild(windowTitle);

    if (icon) {
      const titleImage = document.createElement("img");
      titleImage.src = icon;
      windowTitle.appendChild(titleImage);
    }

    const titleText = document.createElement("h1");
    titleText.innerText = title;
    windowTitle.appendChild(titleText);
    
    let exitButton = undefined;
    if (hasCloseButton) {
      exitButton = document.createElement("button");
      exitButton.innerText = "X";
      windowTitle.appendChild(exitButton);
    }

    const windowInner = document.createElement("div");
    windowInner.classList.add("window-inner");
    windowFrame.appendChild(windowInner);

    windowInner.appendChild(content);

    document.querySelector("main").appendChild(window);

    new Window(window, zController, exitButton);
  }
}

const windows = document.querySelectorAll(".window");
export const zController = new ZController();
for (let i = 0; i < windows.length; i++) {
  new Window(windows[i], zController);
}
