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
import { buildMoedReply } from "./moed-info.js";
import { listGuildRoles, setMode, getUserMode, clearUserMode } from "./roles.js";

const app = express();

const PORT = process.env.PORT || 3000;
const PUBLIC_KEY = process.env.DISCORD_PUBLIC_KEY;
const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const GUILD_ID = process.env.GUILD_ID;

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

  const mode = getUserMode(message.author.id);

  await message.channel.sendTyping();
  await message.reply(buildMoedReply(text, mode));
});

async function createSupportChannel(interaction) {
  const userId = interaction.member?.user?.id || interaction.user?.id;

  if (!userId) {
    throw new Error("No pude detectar el usuario que abrió el ticket.");
  }

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
    permissionOverwrites: [
      {
        id: guild.roles.everyone.id,
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
    `<@${userId}> Hola, soy la IA de atención al cliente de MOED.\n\nUsa /moed-modo para elegir visitante, trabajador o moderador. Si no eliges nada, estarás en visitante.`
  );

  return channel;
}

function interactionReply(content, ephemeral = true) {
  return {
    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    data: {
      content,
      flags: ephemeral ? 64 : undefined
    }
  };
}

app.post(
  "/discord/interactions",
  verifyKeyMiddleware(PUBLIC_KEY),
  async (req, res) => {
    const interaction = req.body;

    if (interaction.type === InteractionType.PING) {
      return res.send({ type: InteractionResponseType.PONG });
    }

    if (interaction.type !== InteractionType.APPLICATION_COMMAND) {
      return res.send(interactionReply("Interacción no reconocida."));
    }

    const name = interaction.data.name;

    try {
      if (name === "moed-soporte") {
        const channel = await createSupportChannel(interaction);
        return res.send(
          interactionReply(`He creado tu chat privado: <#${channel.id}>`)
        );
      }

      if (name === "moed-roles") {
        const rolesText = await listGuildRoles(client, GUILD_ID);
        return res.send(
          interactionReply(
            `Roles del servidor:\n\n${rolesText || "No encontré roles."}`
          )
        );
      }

      if (name === "moed-modo") {
        const result = await setMode(interaction);
        return res.send(interactionReply(result));
      }

      if (name === "moed-ia") {
        const userId = interaction.member?.user?.id || interaction.user?.id;
        const mode = getUserMode(userId);
        const mensaje =
          interaction.data.options?.find((o) => o.name === "mensaje")?.value ||
          "";

        return res.send(interactionReply(buildMoedReply(mensaje, mode), false));
      }

      if (name === "moed-ayuda") {
        return res.send(
          interactionReply(
            "Comandos: /moed-soporte, /moed-roles, /moed-modo, /moed-ia, /moed-ayuda, /moed-limpiar, /moed-parar"
          )
        );
      }

      if (name === "moed-limpiar") {
        const userId = interaction.member?.user?.id || interaction.user?.id;
        clearUserMode(userId);
        return res.send(
          interactionReply("Conversación limpiada. Modo visitante activado.")
        );
      }

      if (name === "moed-parar") {
        return res.send(interactionReply("IA parada para esta conversación."));
      }

      return res.send(interactionReply("Comando no reconocido."));
    
    } catch (error) {
  console.error("ERROR MOED:", error);

  const details =
    error?.message ||
    error?.rawError?.message ||
    JSON.stringify(error);

  return res.send(
    interactionReply(`Error real del bot: ${details.slice(0, 1500)}`)
  );
}
  }
);

app.get("/", (req, res) => {
  res.send("Bot de Discord funcionando.");
});

client.login(BOT_TOKEN);

app.listen(PORT, () => {
  console.log(`Bot escuchando en puerto ${PORT}`);
});
