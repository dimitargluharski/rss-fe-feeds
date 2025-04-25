import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const webhook = process.env.DISCORD_WEBHOOK;

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Only POST allowed' });
  }

  const { payload } = req.body;

  if (!payload || payload.state !== 'READY') {
    return res.status(200).json({ message: 'Ignored non-ready state' });
  }

  const siteName = payload.name;
  const url = payload.url;
  const timestamp = new Date(payload.createdAt || Date.now()).toLocaleString('bg-BG');

  const embed = {
    username: '🚀 Vercel Bot',
    embeds: [
      {
        title: `✅ Билдът на ${siteName} е успешен!`,
        description: `[🔗 Виж сайта](${url})`,
        color: 0x57f287,
        fields: [
          {
            name: 'Дата',
            value: timestamp,
            inline: true,
          },
          {
            name: 'Линк',
            value: url,
            inline: true,
          },
        ],
        footer: {
          text: 'Vercel → Discord Notification',
        },
      },
    ],
  };

  await fetch(webhook!, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(embed),
  });

  res.status(200).json({ message: '✅ Discord notified' });
}
