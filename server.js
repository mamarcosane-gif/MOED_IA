import express from "express";
import {
  Client,
  GatewayIntentBits,
  PermissionFlagsBits,
  ChannelType
} from "discord.js";
import {
  InteractionResponseType,
  InteractionType,
  verifyKeyMiddleware
} from "discord-interactions";

const app = express();

const PORT = process.env.PORT || 3000;
const PUBLIC_KEY = process.env.DISCORD_PUBLIC_KEY;
const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const GUILD_ID = process.env.GUILD_ID;
const SUPPORT_CATEGORY_ID = process.env.SUPPORT_CATEGORY_ID;

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

client.once("ready", () => {
  console.log(`Discord conectado como ${client.user.tag}`);
});

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;
  if (!message.channel?.name?.startsWith("ticket-")) return;

  const text = message.content.trim();
  if (!text) return;

  await message.channel.sendTyping();

  const reply = buildMoedReply(text);

  await message.reply(reply);
});

function buildMoedReply(text) {
  const lower = text.toLowerCase();

  if (lower.includes("precio") || lower.includes("cuesta")) {
    return "Hola, soy la IA de atención al cliente de MOED. Para precios, dime qué producto o servicio quieres y te ayudo.";
  }

  if (lower.includes("error") || lower.includes("problema") || lower.includes("falla")) {
    return "Entiendo. Cuéntame qué error te sale, en qué pantalla ocurre y si puedes manda una captura.";
  }

  if (lower.includes("hola") || lower.includes("buenas")) {
    return "Hola, soy la IA de atención al cliente de MOED. ¿En qué puedo ayudarte?";
  }

  return `Soy la IA de atención al cliente de MOED. He recibido tu mensaje: "${text}". Dime más detalles para poder ayudarte.`;
}

async function createSupportChannel(interaction) {
  const userId = interaction.member?.user?.id || interaction.user?.id;
  const username =
    interaction.member?.user?.username ||
    interaction.user?.username ||
    "cliente";

  const safeName = username
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .slice(0, 20);

  const guild = await client.guilds.fetch(GUILD_ID);

  const channel = await guild.channels.create({
    name: `ticket-${safeName}`,
    type: ChannelType.GuildText,
    parent: SUPPORT_CATEGORY_ID,
    permissionOverwrites: [
      {
        id: GUILD_ID,
        deny: [PermissionFlagsBits.ViewChannel]
      },
      {
        id: userId,
        allow: [
          PermissionFlagsBits.ViewChannel,
          PermissionFlagsBits.SendMessages,
          PermissionFlagsBits.ReadMessageHistory
        ]
      },
      {
        id: client.user.id,
        allow: [
          PermissionFlagsBits.ViewChannel,
          PermissionFlagsBits.SendMessages,
          PermissionFlagsBits.ReadMessageHistory,
          PermissionFlagsBits.ManageChannels
        ]
      }
    ]
  });

  await channel.send(
    `<@${userId}> Hola, soy la IA de atención al cliente de MOED. Escríbeme tu duda aquí.`
  );

  return channel;
}

app.post(
  "/discord/interactions",
  verifyKeyMiddleware(PUBLIC_KEY),
  async (req, res) => {
    const interaction = req.body;

    if (interaction.type === InteractionType.PING) {
      return res.send({ type: InteractionResponseType.PONG });
    }

    if (interaction.type === InteractionType.APPLICATION_COMMAND) {
      const name = interaction.data.name;

      if (name === "soporte") {
        try {
          const channel = await createSupportChannel(interaction);

          return res.send({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
              content: `He creado tu chat privado: <#${channel.id}>`,
              flags: 64
            }
          });
        } catch (error) {
          console.error("Error creando ticket:", error);

          return res.send({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
              content:
                "No he podido crear el ticket. Revisa que el bot tenga permiso de Gestionar canales.",
              flags: 64
            }
          });
        }
      }

      if (name === "ia") {
        const mensaje =
          interaction.data.options?.find((o) => o.name === "mensaje")?.value ||
          "";

        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: buildMoedReply(mensaje)
          }
        });
      }

      if (name === "ayuda") {
        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content:
              "Comandos disponibles: /soporte, /ia, /ayuda, /limpiar, /parar"
          }
        });
      }

      if (name === "limpiar") {
        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: "Conversación limpiada."
          }
        });
      }

      if (name === "parar") {
        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: "IA parada."
          }
        });
      }
    }

    return res.send({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        content: "Comando no reconocido."
      }
    });
  }
);

app.get("/", (req, res) => {
  res.send("Bot de Discord funcionando.");
});

client.login(BOT_TOKEN);

app.listen(PORT, () => {
  console.log(`Bot escuchando en puerto ${PORT}`);
});
