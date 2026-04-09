const { Client, GatewayIntentBits } = require('discord.js');

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});
const fetch = require('node-fetch');
// 🔐 ENV (Railway)
const TOKEN = process.env.TOKEN ;
const OPENAI_API_KEY = process.env.OPENI_API_KEY;
const CHANNEL_ID = process.env.CHANNEL_ID;

// ===== AI =====
async function generateAudycja(prompt) {
  const response = await fetch("https://api.openai.com/v1/responses", {
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

  const data = await response.json();

  return data.output_text 
    || (data.output?.[0]?.content?.[0]?.text) 
    || "❌ RNG FM: brak odpowiedzi z AI";
}

// ===== READY =====
client.on("clientReady", () => {
  console.log("🔥 RNG FM RADIO LIVE!");
});

// ===== KOMENDA =====
client.on("messageCreate", async (message) => {
  if (!message.content.startsWith("!rng") || message.author.bot) return;

  const args = message.content.split(" ").slice(1);
  const godzina = args[0] || "??:??";
  const vibe = args.slice(1).join(" ") || "chaos";

  const prompt = `
RNG FM – Bjornheim

Godzina: ${godzina}
Vibe: ${vibe}

Styl:
- radio samochodowe
- Bjorn + Skald
- humor

Zawrzyj:
- raport
- prognozę dnia
- prognozę dropa
- kawę
- suchar
- pytanie
`;

  const text = await generateAudycja(prompt);
  message.channel.send(text);
});

// ===== AUTO RADIO =====
let lastRun = "";

setInterval(async () => {
  const now = new Date();
  const godz = now.getHours();
  const min = now.getMinutes();
  const key = godz + ":" + min;

  if (lastRun === key) return;

  const channel = client.channels.cache.get(CHANNEL_ID);
  if (!channel) return;

  let typ = null;

  if (godz === 8 && min === 0) typ = "poranek";
  if (godz === 12 && min === 30) typ = "środek dnia";
  if (godz === 19 && min === 0) typ = "luźne wejście";
  if (godz === 22 && min === 0) typ = "noc";

  if (!typ) return;

  const godzinaText = now.toLocaleTimeString("pl-PL", {
    hour: "2-digit",
    minute: "2-digit"
  });

  const prompt = `
RNG FM – ${godzinaText}

Typ audycji: ${typ}

Styl:
- radio samochodowe
- Bjorn + Skald
- humor

Zawrzyj:
- raport
- prognozę dnia
- prognozę dropa
- kawę
- suchar
- pytanie
`;

  const text = await generateAudycja(prompt);
  channel.send(text);

  lastRun = key;

}, 60000);

// ===== START =====
client.login(TOKEN);