const commands = [
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

console.log("Comandos MOED registrados.");
