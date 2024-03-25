const acheronDate = new Date('March 27, 2024 04:00:00');

const image = {
    x: 0,
    y: 0,
    direction: {
        x: 1,
        y: 1,
    },
    element: document.getElementById("acheron"),
    height: undefined,
    width: undefined,
}

image.height = image.element.clientHeight;
image.width = image.element.clientWidth;

const screen = {
    height: window.innerHeight,
    width: window.innerWidth,
}

const speed = 2;
;
const animate = () => {
    if (image.y + image.height >= screen.height || image.y < 0) 
        image.direction.y *= -1;
    if (image.x + image.width >= screen.width || image.x < 0)
        image.direction.x *= -1;

    image.x += image.direction.x * speed;
    image.y += image.direction.y * speed;

    image.element.style.top = image.y + "px";
    image.element.style.left = image.x + "px";

    window.requestAnimationFrame(animate);
}

const updateTime = () => {
    const timeNow = new Date();
    const difference = Math.floor((acheronDate - timeNow) / 1000);
    const timerElement = document.getElementById('timer');

    if (difference <= 0) {
        timerElement.innerHTML = "UOGHHHH MOMMY";
    }

    const timer = {
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
    }

    timer.days = Math.floor(difference / 86400);
    timer.hours = Math.floor((difference - timer.days * 86400) / 3600);
    timer.minutes = Math.floor((difference - (timer.days * 86400 + timer.hours * 3600)) / 60);
    timer.seconds = Math.floor((difference - (timer.days * 86400 + timer.hours * 3600 + timer.minutes * 60)));

    timerElement.children[0].innerHTML = timer.days.toString().padStart(2, '0');
    timerElement.children[1].innerHTML = timer.hours.toString().padStart(2, '0');
    timerElement.children[2].innerHTML = timer.minutes.toString().padStart(2, '0');
    timerElement.children[3].innerHTML = timer.seconds.toString().padStart(2, '0');
}

addEventListener("resize", (e) => {
    screen.height = window.innerHeight;
    screen.width = window.innerWidth;

    image.x = 0;
    image.y = 0;
    image.direction.x = 1;
    image.direction.y = 1;
    image.height = image.element.clientHeight;
    image.width = image.element.clientWidth;
});

setInterval(updateTime, 500);

window.requestAnimationFrame(animate);
