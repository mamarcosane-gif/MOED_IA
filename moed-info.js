export const moedInfo = {
  visitante: `
MOED es un proyecto educativo digital.
Tiene web, contenidos, archivos, vídeos, PDFs, periódico MOED, mural, store, chat, tareas, colecciones, salas de intercambio, tokens y herramientas educativas.
Un visitante puede pedir información general, ayuda básica y orientación para usar MOED.
`,

  trabajador: `
Información para trabajador MOED.
Puede recibir ayuda sobre gestión de tareas, archivos, contenido educativo, organización de materiales, atención a usuarios y funcionamiento interno básico.
Esta información requiere PIN de trabajador.
`,

  moderador: `
Información de moderador MOED.
Puede recibir ayuda sobre revisión de usuarios, moderación de contenido, panel de moderador, control de incidencias, soporte avanzado y gestión del entorno.
Esta información requiere tener el rol Moderador en Discord.
`
};

export function buildMoedReply(text, mode) {
  const lower = text.toLowerCase();
  const base = moedInfo[mode] || moedInfo.visitante;

  if (lower.includes("hola") || lower.includes("buenas")) {
    return `Hola, soy la IA de atención al cliente de MOED. Estás en modo ${mode}. ¿En qué puedo ayudarte?`;
  }

  if (lower.includes("precio") || lower.includes("cuesta")) {
    return `Modo ${mode}: MOED puede tener servicios, contenidos o herramientas. Dime exactamente qué parte quieres consultar y te ayudo.`;
  }

  if (lower.includes("error") || lower.includes("problema") || lower.includes("falla")) {
    return `Modo ${mode}: cuéntame qué error aparece, en qué pantalla ocurre y qué estabas intentando hacer. Si puedes, manda una captura.`;
  }

  if (lower.includes("qué es moed") || lower.includes("que es moed")) {
    return base.trim();
  }

  return `Modo ${mode}. Según la información de MOED:\n\n${base.trim()}\n\nTu mensaje: "${text}"`;
}
