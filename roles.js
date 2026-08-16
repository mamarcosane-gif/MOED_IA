const userModes = new Map();

export async function listGuildRoles(client, guildId) {
  const guild = await client.guilds.fetch(guildId);
  const roles = await guild.roles.fetch();

  return roles
    .filter((role) => role.name !== "@everyone")
    .sort((a, b) => b.position - a.position)
    .map((role) => `${role.name}: ${role.id}`)
    .join("\n");
}

export async function setMode(interaction) {
  const userId = interaction.member?.user?.id || interaction.user?.id;
  const memberRoles = interaction.member?.roles || [];
  const selectedRole = interaction.data.options?.find((o) => o.name === "rol")?.value;
  const pin = interaction.data.options?.find((o) => o.name === "pin")?.value;

  if (selectedRole === "visitante") {
    userModes.set(userId, "visitante");
    return "Modo visitante activado. No necesita verificación.";
  }

  if (selectedRole === "trabajador") {
    if (!process.env.WORKER_PIN) {
      return "Falta configurar WORKER_PIN en Render.";
    }

    if (pin !== process.env.WORKER_PIN) {
      return "PIN de trabajador incorrecto.";
    }

    userModes.set(userId, "trabajador");
    return "Modo trabajador activado.";
  }

  if (selectedRole === "moderador") {
    if (!process.env.MODERATOR_ROLE_ID) {
      return "Falta configurar MODERATOR_ROLE_ID en Render. Usa /roles para ver el ID del rol Moderador.";
    }

    const hasRole = Array.isArray(memberRoles)
      ? memberRoles.includes(process.env.MODERATOR_ROLE_ID)
      : memberRoles.cache?.has(process.env.MODERATOR_ROLE_ID);

    if (!hasRole) {
      return "No tienes el rol Moderador.";
    }

    userModes.set(userId, "moderador");
    return "Modo moderador activado.";
  }

  return "Rol no reconocido.";
}

export function getUserMode(userId) {
  return userModes.get(userId) || "visitante";
}

export function clearUserMode(userId) {
  userModes.set(userId, "visitante");
}
