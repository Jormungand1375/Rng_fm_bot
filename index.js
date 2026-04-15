const { Client, GatewayIntentBits } = require('discord.js');

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const TOKEN = process.env.TOKEN;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const CHANNEL_ID = process.env.CHANNEL_ID;

async function generate(prompt) {
  try {
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

  } catch (err) {
    console.error("API ERROR:", err);
    return "❌ API error";
  }
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

  if (h === 8 && m < 10) return "PORANEK";
  if (h === 12 && m < 40) return "DZIEŃ";
  if (h === 19 && m < 10) return "WIECZÓR";
  if (h === 22 && m < 10) return weekend ? "CHAOS" : "NOC";

  return null;
}

client.once("clientReady", async () => {
  console.log("🔥 RNG FM FINAL LIVE");

  const channel = await client.channels.fetch(CHANNEL_ID);
  let lastShow = "";
  let lastMini = "";

  console.log("CHANNEL:", channel?.id);

  setInterval(async () => {
    const { h, m, d } = getTime();

    // 🎙️ GŁÓWNA AUDYCJA
    const show = getShow(h, m, d);

    if (show) {
      const key = show + "-" + d;
      if (key !== lastShow) {

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

          "Zrób audycję jako dialog + telefon od słuchacza.\n" +
          "Zakończ pytaniem.\n\n" +

          "Styl: naturalny, jak Discord, chaos i humor";

        const text = await generate(prompt);
        channel.send(text);

        lastShow = key;
      }
    }

    // 🔥 MINI WEJŚCIA CO 15 MIN
    if (m % 15 === 0) {
      const miniKey = h + ":" + m;

      if (miniKey !== lastMini) {
        const miniPrompt =
          "RNG FM MINI WEJŚCIE\n" +
          "Krótka rozmowa Wendiso i Wendisia (2-4 linijki):\n" +
          "- chaos, żart albo szybki komentarz\n" +
          "- może być mini roast albo reakcja\n" +
          "- styl naturalny, jak Discord\n";

        const miniText = await generate(miniPrompt);
        channel.send(miniText);

        lastMini = miniKey;
      }
    }

  }, 60000);
});

client.login(TOKEN);