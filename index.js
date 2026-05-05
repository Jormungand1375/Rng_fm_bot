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

  setInterval(async () => {
    const { h, m, d } = getTime();
    const key = h + ":" + m;

    if (key === last) return;

    const show = getShow(h, m, d);
    if (!show) return;

    const prompt =
      "RNG FM " + show + "\n" +
      "Bjorn i Skald prowadzą śmieszną audycję.\n" +
      "Dodaj: żart, prognozę, drop %, kawę, telefon, pytanie.";

    const text = await generate(prompt);
    channel.send(text);

    last = key;

  }, 60000);
});

client.login(TOKEN);
