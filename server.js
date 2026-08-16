import express from "express";
import {
  InteractionResponseType,
  InteractionType,
  verifyKeyMiddleware
} from "discord-interactions";

const app = express();
const PORT = process.env.PORT || 3000;
const PUBLIC_KEY = process.env.DISCORD_PUBLIC_KEY;

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

      if (name === "ia") {
        const mensaje =
          interaction.data.options?.find((o) => o.name === "mensaje")?.value ||
          "";

        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: `IA: Has dicho "${mensaje}".`
          }
        });
      }

      if (name === "ayuda") {
        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: "Comandos disponibles: /ia, /ayuda, /limpiar, /parar"
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
