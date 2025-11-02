class ZController {
  #zMax = -1;
  #windows = [];

  addWindow(window) {
    this.#windows.push([window, ++this.#zMax]);
    window.zIndex = this.#zMax;
  }

  focus(window) {
    const elem = this.#windows.find(e => e[0] === window);
    const oldZ = elem[1];
    for (let i = 0; i < this.#windows.length; i++) {
      if (oldZ < this.#windows[i][1]) {
        this.#windows[i][0].zIndex = --this.#windows[i][1];
      }
      this.#windows[i][0].isActive = false;
    }

    elem[1] = this.#zMax;

    window.zIndex = this.#zMax;
    window.isActive = true;
  }
}

export class Window {
  #window;
  #title;
  #x = 0;
  #y = 0;
  #z;
  #offsetX;
  #offsetY;
  #isMoving = false;
  #borderSize;
  #zController;
  #isActive = true;
  #closeButton;

  constructor(window, zController, closeButton) {
    this.#window = window;
    this.#title = window.querySelector(".window-title");

    this.#borderSize = 
      this.#title.getBoundingClientRect().top - 
      this.#window.getBoundingClientRect().top;

    this.#title.addEventListener("mousedown", this);
    this.#title.addEventListener("mouseup", this);
    document.addEventListener("mousemove", this);

    this.#zController = zController;
    this.#zController.addWindow(this);

    if (closeButton) {
      this.#closeButton = closeButton;
      this.#closeButton.addEventListener("click", this);
    }
  }

  handleEvent(e) {
    switch (e.type) {
      case "mousedown":
        this.moveStartHandler(e);
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
    this.#window.remove();
  }
}

const windows = document.querySelectorAll(".window");
export const zController = new ZController();
for (let i = 0; i < windows.length; i++) {
  new Window(windows[i], zController);
}
