import express from 'express';
import { processEvents } from './pointsOfInterest'

const app = express();
const port = 3000;

app.use(express.json());

app.post('/points-of-interest', async (req, res) => {
  try {
    const results = await processEvents();
    res.json(results);
  } catch (error) {
    console.error('Une erreur s\'est produite :', error);
    res.status(500).json({ error: 'Une erreur s\'est produite lors du traitement des événements.' });
  }
});

app.listen(port, () => {
  console.log(`Serveur démarré sur le port ${port}`);
});