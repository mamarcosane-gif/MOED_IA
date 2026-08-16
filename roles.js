export async function listGuildRoles(client, guildId) {
  const guild = await client.guilds.fetch(guildId);
  const roles = await guild.roles.fetch();

  return roles
    .filter((role) => role.name !== "@everyone")
    .sort((a, b) => b.position - a.position)
    .map((role) => `${role.name}: ${role.id}`)
    .join("\n");
}

function hasRole(memberRoles, roleId) {
  if (!roleId) return false;

  if (Array.isArray(memberRoles)) {
    return memberRoles.includes(roleId);
  }

  if (memberRoles?.cache) {
    return memberRoles.cache.has(roleId);
  }

  return false;
}

export function detectUserModeFromInteraction(interaction) {
  const roles = interaction.member?.roles || [];

  if (hasRole(roles, process.env.MODERATOR_ROLE_ID)) {
    return "moderador";
  }

  if (hasRole(roles, process.env.WORKER_ROLE_ID)) {
    return "trabajador";
  }

  return "visitante";
}

export function detectUserModeFromMessage(message) {
  const roles = message.member?.roles;

  if (hasRole(roles, process.env.MODERATOR_ROLE_ID)) {
    return "moderador";
  }

  if (hasRole(roles, process.env.WORKER_ROLE_ID)) {
    return "trabajador";
  }

  return "visitante";
}

export async function setMode(interaction) {
  const mode = detectUserModeFromInteraction(interaction);
  return `Tu modo se detecta automaticamente por tus roles. Ahora estas en modo ${mode}.`;
}

export function clearUserMode() {
  return;
}
