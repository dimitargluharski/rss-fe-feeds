import https from 'https';
import dotenv from 'dotenv';

dotenv.config();

const webhookUrl = process.env.DISCORD_WEBHOOK;

if (!webhookUrl) {
  console.error('❌ DISCORD_WEBHOOK не е дефиниран в .env файла!');
  process.exit(1);
}

const timestamp = new Date().toLocaleString('bg-BG', {
  dateStyle: 'medium',
  timeStyle: 'short',
});

const data = JSON.stringify({
  content: `📦 RSS Feeder проектът беше билднат успешно! ✅\n🕒 ${timestamp}`,
  username: 'RSS Build Bot',
});

const url = new URL(webhookUrl);

const options = {
  hostname: url.hostname,
  path: url.pathname + url.search,
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data),
  },
};

const req = https.request(options, res => {
  console.log(`✅ Discord отговор: ${res.statusCode}`);
  if (res.statusCode !== 204) {
    console.error('⚠️ Очакван статус 204, но получен:', res.statusCode);
  }
});

req.on('error', error => {
  console.error('❌ Грешка при изпращане към Discord:', error);
});

req.write(data);
req.end();
