const canvas = document.getElementById("bg");
const ctx = canvas.getContext("2d");
canvas.height = window.innerHeight;
canvas.width = window.innerWidth;

const MAX_RADIUS = 10;
const PADDING = 10;
const SPEED = 10;
const dots = [];

function genDots() {
  dots.splice(0, dots.length);
  for (let x = 0; x < canvas.width; x += (MAX_RADIUS + PADDING) * 2) {
    for (let y = 0; y < canvas.height; y += (MAX_RADIUS + PADDING) * 2) {
      dots.push({
        x: x,
        y: y,
      });
    }
  }
}

genDots();

window.addEventListener("resize", () => {
  canvas.height = window.innerHeight;
  canvas.width = window.innerWidth;

  genDots();
});

function edge_distance(x, y) {
  return Math.min(
    x / (canvas.width / 2),
    y / (canvas.height / 2),
    (canvas.width - x) / (canvas.width / 2),
    (canvas.height - y) / (canvas.height / 2),
  );
}

function clamp(m, min, max) {
  if (min > m) return min;
  else if (max < m) return max;
  else return m;
}

let lastFrame = document.timeline.currentTime;
function render(timestamp) {
  const delta = (timestamp - lastFrame) / 1e3;
  lastFrame = timestamp;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "rgb(200, 200, 255)";
  for (const dot of dots) {
    ctx.beginPath();
    ctx.arc(
      dot.x,
      dot.y,
      MAX_RADIUS * clamp(edge_distance(dot.x, dot.y) * 4, 0, 1),
      0,
      Math.PI * 2,
    );
    ctx.fill();
    ctx.closePath();

    dot.x += SPEED * delta;
    dot.y += SPEED * delta;

    if (dot.x > canvas.width) {
      dot.x = 0;
      dot.y = canvas.height - dot.y;
    }
    if (dot.y > canvas.height) {
      dot.x = canvas.width - dot.x;
      dot.y = 0;
    }
  }

  requestAnimationFrame(render);
}

requestAnimationFrame(render);
