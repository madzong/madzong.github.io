class DotGrid {
  #canvas;
  #ctx;
  #x = 0;
  #y = 0;
  #distance;
  #speed;
  #radius;
  #lastFrame;
  #edgeDistance;
  #dotMaxSpace;

  constructor(canvas, distance, speed, radius, edgeDistance) {
    this.#canvas = canvas;
    this.#ctx = canvas.getContext("2d");
    
    this.#distance = distance;
    this.#speed = speed;
    this.#radius = radius;
    this.#edgeDistance = edgeDistance;
    this.#dotMaxSpace = this.#radius * 2 + this.#distance * 2;

    this.resize();

    window.addEventListener("resize", () => this.resize());
  }

  resize() {
    this.#canvas.height = window.innerHeight +
      (this.#dotMaxSpace - window.innerHeight % this.#dotMaxSpace);
    this.#canvas.width = window.innerWidth +
      (this.#dotMaxSpace - window.innerWidth % this.#dotMaxSpace);
  }

  deltaTime() {
    const timestamp = document.timeline.currentTime;
    const delta = timestamp - this.#lastFrame;
    this.#lastFrame = timestamp;

    return delta / 1e3;
  }

  dotAmounts() {
    return [
      Math.ceil(this.#canvas.height / (this.#radius * 2 + this.#distance * 2)) * 2,
      Math.ceil(this.#canvas.width / (this.#radius * 2 + this.#distance * 2)) * 2
    ];
  }

  distanceToEdge(x, y) {
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    const left = x;
    const right = vw - x;
    const top = y;
    const bottom = vh - y;

    return Math.min(left, right, top, bottom);
  }

  dotRadius(x, y) {
    const distance = this.distanceToEdge(x, y);

    if (distance > this.#edgeDistance) {
      return this.#radius;
    }

    if (distance < 0) {
      return 0;
    }

    return this.#radius * (distance / this.#edgeDistance);
  }

  render() {
    const deltaTime = this.deltaTime();

    this.#ctx.clearRect(0, 0, this.#canvas.width, this.#canvas.height);
    this.#ctx.fillStyle = "rgb(200, 200, 255)";

    const amounts = this.dotAmounts();
    for (let y = 0; y < amounts[0]; y++) {
      for (let x = 0; x < amounts[1]; x++) {
        const xcoord = (x * this.#dotMaxSpace) - this.#canvas.width + this.#x;
        const ycoord = (y * this.#dotMaxSpace) - this.#canvas.height + this.#y;

        this.#ctx.beginPath();
        this.#ctx.arc(
          xcoord,
          ycoord,
          this.dotRadius(xcoord, ycoord),
          0,
          Math.PI * 2,
        );
        this.#ctx.fill();
        this.#ctx.closePath();
      }
    }

    const ratioX = this.#canvas.width / this.#canvas.height;
    const ratioY = this.#canvas.height / this.#canvas.width;

    if (!Number.isNaN(deltaTime)) {
      this.#x += this.#speed * ratioX * deltaTime;
      this.#y += this.#speed * ratioY * deltaTime;

      if (this.#x > this.#canvas.width) {
        this.#x = 0;
      }
      if (this.#y > this.#canvas.height) {
        this.#y = 0;
      }
    }

    requestAnimationFrame(() => this.render());
  }
}

const canvas = document.getElementById("bg");
const dots = new DotGrid(canvas, 10, 10, 10, 100);
requestAnimationFrame(() => dots.render());
