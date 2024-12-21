const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@adiwajshing/baileys');
const express = require('express');
const fs = require('fs');

const app = express();
app.use(express.json());

let sock;

async function initializeWhatsApp() {
    const { state, saveCreds } = await useMultiFileAuthState('./auth_info'); // Správa autentizačního stavu

    sock = makeWASocket({
        auth: state, // Předání autentizačního stavu do Baileys
    });

    sock.ev.on('creds.update', saveCreds); // Ukládání přihlašovacích údajů

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;

        if (connection === 'close') {
            const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log('Připojení zavřeno, pokus o opětovné připojení:', shouldReconnect);
            if (shouldReconnect) {
                initializeWhatsApp();
            }
        } else if (connection === 'open') {
            console.log('WhatsApp připojen.');
        }
    });
}

app.post('/sendMessage', async (req, res) => {
    const { type, message } = req.body;

    try {
        if (type === 'Sypané') {
            const groupId = 'XXXX-XXXX@g.us'; // Nahraďte ID skupiny
            await sock.sendMessage(groupId, { text: message });
        } else if (type === 'Rovnané') {
            const contact = '420774900229@s.whatsapp.net'; // Formát čísla
            await sock.sendMessage(contact, { text: message });
        }
        res.send('Zpráva byla odeslána!');
    } catch (error) {
        console.error('Chyba při odesílání zprávy:', error);
        res.status(500).send('Chyba při odesílání zprávy.');
    }
});

initializeWhatsApp();

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server běží na portu ${PORT}`));
