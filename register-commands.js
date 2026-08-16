const commands = [
  { name: "soporte", description: "Abrir un chat privado con soporte MOED" },
  {
    name: "ia",
    description: "Hablar con la IA de MOED",
    options: [
      {
        name: "mensaje",
        description: "Mensaje para la IA",
        type: 3,
        required: true
      }
    ]
  },
  { name: "ayuda", description: "Ver comandos disponibles" },
  { name: "limpiar", description: "Limpiar la conversación" },
  { name: "parar", description: "Parar la IA" }
];

const response = await fetch(
  `https://discord.com/api/v10/applications/${process.env.CLIENT_ID}/guilds/${process.env.GUILD_ID}/commands`,
  {
    method: "PUT",
    headers: {
      Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(commands)
  }
);

if (!response.ok) {
  throw new Error(await response.text());
}

console.log("Comandos registrados.");
