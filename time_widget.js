class TimeWidget {
  #timeMe
  #timeUser
  #clockCanvasMe
  #clockCtxMe
  #clockCanvasUser
  #clockCtxUser

  constructor(timeMe, timeUser) {
    this.#timeMe = timeMe.querySelector("p");
    this.#timeUser = timeUser.querySelector("p");

    this.#clockCanvasMe = timeMe.querySelector("canvas");
    this.#clockCanvasUser = timeUser.querySelector("canvas");
    this.#clockCtxMe = this.#clockCanvasMe.getContext("2d");
    this.#clockCtxUser = this.#clockCanvasUser.getContext("2d");
  }

  renderClock(time, canvas, ctx) {
    const timeSplit = time.split(":");
    const hour = parseInt(timeSplit[0]) % 12;
    const minute = parseInt(timeSplit[1]);
    const second = parseInt(timeSplit[2]);

    const center = [canvas.width / 2, canvas.height / 2];
    const radius = canvas.width / 2;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "black";
    
    // Circle
    ctx.beginPath();
    ctx.arc(
      center[0],
      center[1],
      radius,
      0,
      Math.PI * 2
    );
    ctx.closePath();
    ctx.stroke();

    // Bigger lines
    for (let i = 0; i < 12; i++) {
      const angle = 30 * i * (Math.PI / 180);

      const xStart = center[0] + radius * Math.cos(angle);
      const yStart = center[1] + radius * Math.sin(angle);
      const xEnd = center[0] + (radius * 3 / 4) * Math.cos(angle);
      const yEnd = center[1] + (radius * 3 / 4) * Math.sin(angle);

      ctx.beginPath();
      ctx.moveTo(xStart, yStart);
      ctx.lineTo(xEnd, yEnd);
      ctx.closePath();
      ctx.stroke();
    }

    // Smaller lines
    for (let i = 0; i < 60; i++) {
      const angle = 6 * i * (Math.PI / 180);

      const xStart = center[0] + radius * Math.cos(angle);
      const yStart = center[1] + radius * Math.sin(angle);
      const xEnd = center[0] + (radius * 7 / 8) * Math.cos(angle);
      const yEnd = center[1] + (radius * 7 / 8) * Math.sin(angle);

      ctx.beginPath();
      ctx.moveTo(xStart, yStart);
      ctx.lineTo(xEnd, yEnd);
      ctx.closePath();
      ctx.stroke();
    }

    // Clock hands
    const fullCircle = 2 * Math.PI;

    const hourAngle = fullCircle * hour / 12 - fullCircle / 4;
    const hourHandStartX = center[0] + (radius / 16) * Math.cos(hourAngle - Math.PI);
    const hourHandStartY = center[1] + (radius / 16) * Math.sin(hourAngle - Math.PI);
    const hourHandEndX = center[0] + (radius / 4) * Math.cos(hourAngle);
    const hourHandEndY = center[1] + (radius / 4) * Math.sin(hourAngle);

    const minuteAngle = fullCircle * minute / 60 - fullCircle / 4;
    const minuteHandStartX = center[0] + (radius / 16) * Math.cos(minuteAngle - Math.PI);
    const minuteHandStartY = center[1] + (radius / 16) * Math.sin(minuteAngle - Math.PI);
    const minuteHandEndX = center[0] + (radius / 2) * Math.cos(minuteAngle);
    const minuteHandEndY = center[1] + (radius / 2) * Math.sin(minuteAngle);

    const secondAngle = fullCircle * second / 60 - fullCircle / 4;
    const secondHandStartX = center[0] + (radius / 16) * Math.cos(secondAngle - Math.PI);
    const secondHandStartY = center[1] + (radius / 16) * Math.sin(secondAngle - Math.PI);
    const secondHandEndX = center[0] + radius * Math.cos(secondAngle);
    const secondHandEndY = center[1] + radius * Math.sin(secondAngle);

    ctx.beginPath();
    ctx.moveTo(minuteHandStartX, minuteHandStartY);
    ctx.lineTo(minuteHandEndX, minuteHandEndY);
    ctx.closePath();
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(secondHandStartX, secondHandStartY);
    ctx.lineTo(secondHandEndX, secondHandEndY);
    ctx.closePath();
    ctx.stroke();

    ctx.strokeStyle = "red";
    ctx.beginPath();
    ctx.moveTo(hourHandStartX, hourHandStartY);
    ctx.lineTo(hourHandEndX, hourHandEndY);
    ctx.closePath();
    ctx.stroke();
  }

  update() {
    const currentTime = new Date();
    const timeMe = currentTime.toLocaleTimeString("pl-PL", { timeZone: "Europe/Warsaw" });
    this.#timeMe.innerText = timeMe;
    const timeUser = currentTime.toLocaleTimeString("pl-PL")
    this.#timeUser.innerText = timeUser;

    this.renderClock(timeMe, this.#clockCanvasMe, this.#clockCtxMe);
    this.renderClock(timeUser, this.#clockCanvasUser, this.#clockCtxUser);

    setTimeout(() => this.update(), 1e3);
  }
}

const elemTimeMe = document.querySelector("#time2");
const elemTimeUser = document.querySelector("#time1");

const timeWidget = new TimeWidget(elemTimeMe, elemTimeUser);
timeWidget.update();
