function getCookie(cname) {
    let name = cname + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    for(let i = 0; i <ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) == ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
      }
    }
    return "";
  }

const n = (getCookie('n') === '') ? 0 : parseInt(getCookie('n'));
let contents = document.getElementById('contents');

const innerHTML = [
    '<img src="img/ltg⚡⚡.gif">',
    '<p>You are a worthless, bitch ass nigga.</p>',
    '<p>Your life literally is as valuable as a summer ant.</p>',
    "<p>I'm just gonna stomp you and you're gonna keep coming back, imma seal up all my cracks, you're gonna keep coming back.</p>",
    "<p>Why? Cause you smellin the syrup.</p>",
    "<p>You worthless bitch ass nigga.</p>",
    "<p>You gonna stay on my dick until you die.</p>",
    "<p>You serve no purpose in life.</p>",
    "<p>Your purpose in life is to be on my stream sucking on my dick daily.</p>",
    "<p>Your purpose in life is to be in that chat blowing the dick daily.</p>",
    "<p>Your life is nothing, you serve zero purpose.</p>",
    '<p class="kys">You should kill yourself, NOW.</p>'
]

if (n === innerHTML.length) {
    $.getJSON("https://api.ipify.org?format=json", (data) => {
        contents.innerHTML = `<p class="kys">${data.ip}</p>`;
    });
} else {
    contents.innerHTML = innerHTML[n];
    document.cookie = `n=${n+1}`;
}

if (n < 11) {
  document.getElementById('jumpscare').remove();
} else {
  document.getElementsByTagName('body')[0].classList.add('lightning');
}