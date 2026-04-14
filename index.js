

const { Client, GatewayIntentBits } = require('discord.js');

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const TOKEN = process.env.TOKEN;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const CHANNEL_ID = process.env.CHANNEL_ID;

async function generate(prompt) {
  const res = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "gpt-4.1-mini",
      input: prompt
    })
  });

  const data = await res.json();
  return data.output?.[0]?.content?.[0]?.text || "Brak odpowiedzi AI";
}

function getTime() {
  const now = new Date();
  return {
    h: (now.getUTCHours() + 2) % 24,
    m: now.getUTCMinutes(),
    d: now.getUTCDay()
  };
}

function getShow(h, m, d) {
  const weekend = (d === 0 || d === 6);

  if (h === 8 && m === 0) return "PORANEK";
  if (h === 12 && m === 30) return "DZIEŃ";
  if (h === 19 && m === 0) return "WIECZÓR";
  if (h === 22 && m === 0) return weekend ? "CHAOS" : "NOC";

  return null;
}

client.once("ready", async () => {
  console.log("🔥 RNG FM FINAL LIVE");

  const channel = await client.channels.fetch(CHANNEL_ID);
  let last = "";

console.log("CHANNEL:", channel?.id);

  setInterval(async () => {
    const { h, m, d } = getTime();
    const key = h + ":" + m;

    if (key === last) return;

const show = "NA ŻYWO 🔥 RNG FM";
    if (!show) return;

    const prompt =
       "RNG FM " + show + "\n" +
  "Prowadzący:\n" +
  "Wendiso - luźny DJ, robi chaos i żarty.\n" +
  "Wendisia - poważna, inteligentna, ogarnia sytuację.\n\n" +

  "Relacja:\n" +
"- Wendiso robi chaos, myli fakty i gada głupoty\n" +
"- Wendisia jest poważna i często się irytuje\n" +
"- częste docinki i lekkie spięcia\n" +
"- Wendisia mówi czasem: 'czy ty jesteś poważny?'\n" +
"- Wendiso czasem psuje audycję\n\n" +

  "Legenda RNG FM:\n" +
  "- Madziala i 8000 jajek\n" +
  "- ktoś zawsze nie ma dropa\n\n" +

  "LEGENDY TYGODNIA:\n" +
  "- nawiązuj do wydarzeń jakby trwały cały tydzień\n" +
  "- możesz tworzyć nowe 'legendy'\n\n" +

  "EVENT DNIA:\n" +
  "- jedno wydarzenie dnia\n\n" +

  "BREAKING NEWS (czasami):\n" +
  "- nagłe wydarzenie 🚨\n\n" +

  "Zrób audycję jako dialog:\n" +
  "- rozpocznij jak radio\n" +
  "- rozmowa\n" +
  "- raport\n" +
  "- prognoza\n" +
  "- drop %\n" +
  "- kawa ☕\n" +
  "- suchar\n\n" +

  "Telefon od słuchacza 📞:\n" +
"- imię słuchacza\n" +
"- reakcja na audycję (śmiech, wkurzenie, wtrącenie)\n" +
"- krótka rozmowa (naturalna, jak w radiu)\n" +
"- Wendiso może go rozbawić lub zirytować\n" +
"- Wendisia trzyma poziom\n\n" +

  "Zakończ pytaniem do słuchaczy.\n\n" +

"Zasady stylu:\n" +
"- dynamiczny dialog\n" +
"- krótkie wypowiedzi\n" +
"- energia i chaos\n" +
"- realistyczne zachowanie ludzi\n\n" +

  "Styl: radio DJ, humor, chaos\n" +
  "Format: Discord";
    const text = await generate(prompt);
    channel.send(text);

    last = key;

  }, 60000);
});

client.login(TOKEN);

