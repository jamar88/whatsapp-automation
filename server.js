const { WAConnection } = require('@adiwajshing/baileys');
const express = require('express');
const fs = require('fs');

const app = express();
app.use(express.json());

let conn = new WAConnection();

async function initializeWhatsApp() {
  conn.on('open', () => {
    const authInfo = conn.base64EncodedAuthInfo();
    fs.writeFileSync('./auth_info.json', JSON.stringify(authInfo, null, '\t'));
    console.log('WhatsApp připojen.');
  });

  fs.existsSync('./auth_info.json') && conn.loadAuthInfo('./auth_info.json');
  await conn.connect();
}

app.post('/sendMessage', async (req, res) => {
  const { type, message } = req.body;

  try {
    if (type === 'Sypané') {
      const groupId = 'XXXX-XXXX@g.us'; // Nahraďte ID skupiny
      await conn.sendMessage(groupId, message, 'conversation');
    } else if (type === 'Rovnané') {
      const contact = '420774900229@s.whatsapp.net'; // Formát čísla
      await conn.sendMessage(contact, message, 'conversation');
    }
    res.send('Zpráva byla odeslána!');
  } catch (error) {
    console.error(error);
    res.status(500).send('Chyba při odesílání zprávy.');
  }
});

initializeWhatsApp();

app.listen(3000, () => console.log('Server běží na portu 3000'));
