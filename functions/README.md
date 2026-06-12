# Reservo - Cloud Functions (email)

Funzioni Firebase per le notifiche email e le comunicazioni broadcast.
Lo stato attuale è uno **stub funzionante**: se la secret `RESEND_API_KEY`
non è configurata (o lascia il valore placeholder), le email vengono solo
loggate in console e non inviate, in modo che tutto il resto dell'app
funzioni normalmente senza un account email configurato.

## Funzioni incluse

- `onBookingCreated` - email di ricevuta al cliente quando crea una prenotazione
- `onBookingStatusChanged` - email quando una prenotazione viene confermata o rifiutata
- `sendBookingReminders` - promemoria giornaliero (ore 18:00, Europe/Rome) per le prenotazioni del giorno dopo
- `onBroadcastCreated` - invia una comunicazione (collezione `broadcasts`) a tutti i clienti dell'attività

## Setup

1. Installa le dipendenze:
   ```
   cd functions
   npm install
   ```

2. Crea un account su [Resend](https://resend.com) (o un altro provider, adattando `sendEmail` in `index.js`) e ottieni una API key.

3. Configura la secret su Firebase:
   ```
   firebase functions:secrets:set RESEND_API_KEY
   ```
   Inserisci la API key quando richiesto. Senza questo passaggio le funzioni
   restano attive ma le email non vengono inviate (solo loggate).

4. Deploy:
   ```
   firebase deploy --only functions
   ```

## Mittente

L'indirizzo del mittente è definito in `FROM_EMAIL` in `index.js`
(`Reservo <notifiche@reservo.app>`). Va sostituito con un dominio verificato
sul proprio account Resend prima dell'uso in produzione.
