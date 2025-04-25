export default async function handler(req: Request) {
  const webhook = process.env.DISCORD_WEBHOOK;

  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  const body = await req.json();
  const eventType = body.type;
  const payload = body.payload;

  const siteUrl = payload?.url || 'https://vercel.com';
  const siteName = payload?.name || 'Unknown Project';
  const timestamp = new Date().toLocaleString('bg-BG');

  if (eventType === 'deployment.error' || payload?.state === 'ERROR') {
    const errorMessage = {
      username: 'Vercel Build Bot',
      avatar_url: 'https://i.imgur.com/yW2W9SC.png',
      embeds: [
        {
          title: '❌ Билдът е неуспешен!',
          description: `Проектът **${siteName}** не успя да се билдне.`,
          color: 0xff4d4f,
          fields: [
            { name: 'Дата', value: timestamp, inline: true },
            { name: 'Статус', value: '❌ ERROR', inline: true }
          ],
          footer: { text: 'Vercel → Discord' }
        }
      ]
    };

    await fetch(webhook!, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(errorMessage),
    });

    return new Response('❌ Error embed sent');
  }

  if (eventType === 'deployment.succeeded' || payload?.state === 'READY') {
    const successMessage = {
      username: 'Vercel Build Bot',
      avatar_url: 'https://i.imgur.com/M8JHkXe.png',
      embeds: [
        {
          title: '✅ Успешен билд!',
          description: `Проектът **${siteName}** е успешно деплойнат!`,
          color: 0x57f287,
          fields: [
            { name: 'Дата', value: timestamp, inline: true },
            { name: 'Статус', value: '✅ READY', inline: true }
          ],
          footer: { text: 'Vercel → Discord' }
        }
      ],
      components: [
        {
          type: 1,
          components: [
            {
              type: 2,
              style: 5,
              label: '🔗 Open Site',
              url: `https://${siteUrl}`
            }
          ]
        }
      ]
    };

    await fetch(webhook!, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(successMessage),
    });

    return new Response('✅ Success embed sent');
  }

  return new Response('Ignored event', { status: 200 });
}
