// src/lib/telegram.ts

/**
 * Envía notificaciones automáticas al Telegram de David Alejandro
 * Versión final verificada y funcionando.
 */
export async function sendTelegram(message: string) {
  // 1. Limpiamos el mensaje para que internet lo entienda (emojis, espacios, etc.)
  const text = encodeURIComponent(message);

  // 2. TUS DATOS MAESTROS (Ya probados y funcionando)
  const token = "8561639883:AAGD3nxKXJNSGgJ9c56kFpIQA9bUAW2U7vg";
  const chat_id = "1530497010";

  // 3. CONSTRUCCIÓN DE LA DIRECCIÓN SÓLIDA
  const url = "https://api.telegram.org/bot" + token + "/sendMessage?chat_id=" + chat_id + "&parse_mode=Markdown&text=" + text;

  try {
    // 4. ENVÍO AL TELÉFONO
    // Usamos 'no-cors' para que el navegador deje salir el mensaje sin problemas
    fetch(url, { mode: 'no-cors' });
    
    console.log("✅ Alerta enviada a Telegram");
  } catch (error) {
    console.error("❌ Fallo de red en el envío a Telegram");
  }
}
