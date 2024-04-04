setTimeout(() => {
    const szymon = document.getElementById("szymon");
    szymon.remove();
}, 2.5e3);

let json = {};
(async function() {
    json = await fetch('data.json').then(async (data) => data.json());
})();

const input = document.getElementById("wyszukiwarka");
const output = document.getElementById("rezultaty");

input.addEventListener('change', async () => {
    const customer_data = json['customers'];
    const value = input.value;

    const split_value = value.split(" ");

    if (split_value.length != 2) {
        output.innerHTML = '<p style="color: red; font-weight: bold;">Brak wyników</p>';
        return;
    }

    let hits = customer_data.filter(v => {
        return v['imie'].toLowerCase().trim() == split_value[0].toLowerCase() && v['nazwisko'].toLowerCase().trim() == split_value[1].toLowerCase()
    });

    console.log(hits);

    if (hits.length < 1) {
        output.innerHTML = '<p style="color: red; font-weight: bold;">Brak wyników</p>';
        return;
    }

    let outputHTML = "<h2>Wyniki:</h2>";

    for (let c of hits) {
        outputHTML += '<div class="wynik">' +
            '<ul>' +
                '<li>Imię: ' + c['imie'] + '</li>' + 
                '<li>Nazwisko: ' + c['nazwisko'] + '</li>' +
                '<li>Miasto: ' + c['miasto'] + '</li>' + 
                '<li>Kod pocztowy: ' + c['kod_pocztowy'] + '</li>' +
                '<li>Adres: ' + c['adres'] + '</li>' +
                '<li>Numer telefonu: ' + '<a href="tel:' + c['numer_telefonu'] + '">' + c['numer_telefonu'] + '</a></li>' +
            '</ul>' +
        '</div>' +
        '<hr>';
    }

    output.innerHTML = outputHTML;
});

const randomButton = document.getElementById("random");
randomButton.addEventListener("click", () => {
    const len = json['customers'].length;

    const selectedIndex = Math.floor(Math.random() * (len - 1));
    const c = json['customers'][selectedIndex];

    output.innerHTML = '<div class="wynik">' +
        '<ul>' +
            '<li>Imię: ' + c['imie'] + '</li>' + 
            '<li>Nazwisko: ' + c['nazwisko'] + '</li>' +
            '<li>Miasto: ' + c['miasto'] + '</li>' + 
            '<li>Kod pocztowy: ' + c['kod_pocztowy'] + '</li>' +
            '<li>Adres: ' + c['adres'] + '</li>' +
            '<li>Numer telefonu: ' + '<a href="tel:' + c['numer_telefonu'] + '">' + c['numer_telefonu'] + '</a></li>' +
        '</ul>' +
    '</div>' +
    '<hr>';
});