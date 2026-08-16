import express from "express";
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

const DISCORD_API = "https://discord.com/api/v10";

async function createSupportChannel(interaction) {
  const userId = interaction.member?.user?.id || interaction.user?.id;
  const username =
    interaction.member?.user?.username ||
    interaction.user?.username ||
    "cliente";

  const safeName = username.toLowerCase().replace(/[^a-z0-9-]/g, "-").slice(0, 20);

  const response = await fetch(`${DISCORD_API}/guilds/${GUILD_ID}/channels`, {
    method: "POST",
    headers: {
      Authorization: `Bot ${BOT_TOKEN}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      name: `ticket-${safeName}`,
      type: 0,
      parent_id: SUPPORT_CATEGORY_ID,
      permission_overwrites: [
        {
          id: GUILD_ID,
          type: 0,
          deny: "68608"
        },
        {
          id: userId,
          type: 1,
          allow: "68608"
        },
        {
          id: interaction.application_id,
          type: 1,
          allow: "68608"
        }
      ]
    })
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text);
  }

  return response.json();
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
          return res.send({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
              content: "No he podido crear el ticket. Revisa que el bot tenga permiso de Gestionar canales.",
              flags: 64
            }
          });
        }
      }

      if (name === "ia") {
        const mensaje =
          interaction.data.options?.find((o) => o.name === "mensaje")?.value || "";

        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: `IA MOED: ${mensaje}`
          }
        });
      }

      if (name === "ayuda") {
        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: "Comandos disponibles: /soporte, /ia, /ayuda, /limpiar, /parar"
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

app.listen(PORT, () => {
  console.log(`Bot escuchando en puerto ${PORT}`);
});
