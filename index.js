const { Client, GatewayIntentBits } = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

const TOKEN = process.env.TOKEN;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const CHANNEL_ID = process.env.CHANNEL_ID;

async function generateAudycja(prompt) {
  try {
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

    return data.output?.[0]?.content?.[0]?.text || "❌ Brak odpowiedzi AI";

  } catch (err) {
    console.error(err);
    return "❌ Błąd AI";
  }
}

function getAudycjaType(h, m) {
  if (h === 8 && m === 0) return "poranek";
  if (h === 12 && m === 30) return "środek dnia";
  if (h === 19 && m === 0) return "wieczór";
  if (h === 22 && m === 0) return "noc";
  return null;
}

client.on("clientReady", async () => {
  console.log("🔥 RNG FM LIVE");

  const channel = await client.channels.fetch(CHANNEL_ID);
  let lastRun = "";

  setInterval(async () => {
    const now = new Date();
    const h = (now.getHours() + 2) %24;
    const m = now.getMinutes();
    const key = `${h}:${m}`;

    if (lastRun === key) return;

    const typ = getAudycjaType(h, m);
   // if (!typ) return;

    const day = now.getDay();
    const isWeekend = (day === 0 || day === 6);
    const isNight = (h >= 22 || h < 3);

    let prompt;

    if (isWeekend && isNight) {
      prompt = "WEEKEND NIGHT CHAOS RADIO";
    } else if (isWeekend) {
      prompt = "WEEKEND FUN RADIO";
    } else {
      prompt = `NORMAL RADIO ${typ}`;
    }

    const text = await generateAudycja(prompt);
    await channel.send(text);

    lastRun = key;

  }, 60000);
});

client.login(TOKEN);

