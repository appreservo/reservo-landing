# Changelog

## 2026-06-11
- Aggiunta registrazione account (`login.html`): nuova opzione "Registrati" con scelta del ruolo (gestore di un'attività o cliente).
- Per i gestori: la registrazione crea il profilo attività e lo aggiunge alla directory pubblica (`businesses/{uid}` su Firestore).
- Nuova area cliente (`area.html`): ricerca/elenco delle attività registrate su Reservo e sezione "Le mie prenotazioni" (in arrivo).
- Login e ripristino sessione ora reindirizzano in base al ruolo (gestore → gestionale, cliente → area cliente).
- `impostazioni.html`: il salvataggio del profilo attività sincronizza ora la directory pubblica su Firestore.

## Precedente
- Recupero password nel login (`login.html`) tramite link "Password dimenticata?".
- Sito pubblico (`sito.html`): wizard di prenotazione a 4 step (servizio/persone, data/orario, dati cliente, conferma con codice prenotazione `RZ-YYYYMMDD-NNNN`).
