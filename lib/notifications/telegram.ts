import axios from 'axios';

/**
 * Fail-safe Telegram message notifier.
 * Sends system alerts to a configured Telegram channel or chat.
 */
export async function sendTelegramAlert(message: string): Promise<boolean> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    console.warn('[TelegramAlert] TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID not configured. Skipping alert.');
    return false;
  }

  try {
    const url = `https://api.telegram.org/bot${token}/sendMessage`;
    const response = await axios.post(url, {
      chat_id: chatId,
      text: message,
      parse_mode: 'HTML'
    });

    return response.data.ok === true;
  } catch (error: any) {
    console.error('[TelegramAlert] Failed to send Telegram alert:', error.response?.data || error.message);
    return false;
  }
}
