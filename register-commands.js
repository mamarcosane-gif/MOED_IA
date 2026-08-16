const moedCommands = [
  { name: "moed-soporte", description: "Abrir un chat privado con soporte MOED" },
  { name: "moed-roles", description: "Ver los roles del servidor y sus IDs" },
  {
    name: "moed-modo",
    description: "Elegir el rol de la IA MOED",
    options: [
      {
        name: "rol",
        description: "Rol para hablar con la IA",
        type: 3,
        required: true,
        choices: [
          { name: "visitante", value: "visitante" },
          { name: "trabajador", value: "trabajador" },
          { name: "moderador", value: "moderador" }
        ]
      },
      {
        name: "pin",
        description: "PIN solo para trabajador",
        type: 3,
        required: false
      }
    ]
  },
  {
    name: "moed-ia",
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
  { name: "moed-ayuda", description: "Ver comandos disponibles de MOED" },
  { name: "moed-limpiar", description: "Limpiar la conversación MOED" },
  { name: "moed-parar", description: "Parar la IA de MOED" }
];

const headers = {
  Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`,
  "Content-Type": "application/json"
};

async function putCommands(url, body) {
  const response = await fetch(url, {
    method: "PUT",
    headers,
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return response.json();
}

const appId = process.env.CLIENT_ID;
const guildId = process.env.GUILD_ID;

await putCommands(
  `https://discord.com/api/v10/applications/${appId}/commands`,
  []
);

console.log("Comandos globales antiguos borrados.");

await putCommands(
  `https://discord.com/api/v10/applications/${appId}/guilds/${guildId}/commands`,
  moedCommands
);

console.log("Comandos MOED registrados.");
