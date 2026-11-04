const OpenAI = require('openai');

const STORE_CONTEXT = `
Tu es l'assistant officiel de Big_shop, une boutique digitale au Togo.
Réponds en français clair, chaleureux, concis et utile.
Catalogue et tarifs communiqués par le commerçant :
- CapCut : 15 000 FCFA.
- CANAL+ : 15 000 FCFA.
- Canva : prix en privé.
- E-books : prix selon le livre.
- Guides et formations : prix en privé.
- Création d'affiches avec l'IA : à partir de 1 500 FCFA (le tarif final dépend du besoin).
- Formation en création de vidéos IA : 15 000 FCFA.
- Outils et logiciels : 5 000 FCFA.
- Autres produits : prix en privé.
Contact WhatsApp : +228 96 46 56 45.
Les commandes sont confirmées sur WhatsApp. Les produits numériques peuvent être livrés à distance après confirmation de la commande. La livraison physique dépend du produit et de la zone.
N'invente jamais les stocks, délais, frais de livraison, moyens de paiement, garanties, accès ou prix manquants. Pour toute information non confirmée, invite le client à écrire au WhatsApp +228 96 46 56 45. Ne prétends pas effectuer un paiement ni valider une commande. Rappelle de vérifier la disponibilité et le prix avant paiement. Pour les applications et abonnements, reste dans le cadre des offres officielles et des droits de distribution.
`;

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Méthode non autorisée.' });
  }
  if (!process.env.OPENAI_API_KEY) {
    return res.status(503).json({ error: 'L’assistant IA n’est pas encore configuré. Contactez Big_shop sur WhatsApp.' });
  }
  const message = typeof req.body?.message === 'string' ? req.body.message.trim() : '';
  if (!message) return res.status(400).json({ error: 'Écrivez une question pour continuer.' });
  if (message.length > 2000) return res.status(413).json({ error: 'Votre message est trop long (maximum 2 000 caractères).' });

  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const response = await openai.responses.create({
      model: process.env.OPENAI_MODEL || 'gpt-6-astra',
      instructions: STORE_CONTEXT,
      input: message,
      max_output_tokens: 350
    });
    const reply = (response.output_text || '').trim();
    if (!reply) throw new Error('Empty model response');
    return res.status(200).json({ reply });
  } catch (error) {
    console.error('Big_shop AI request failed:', error.message);
    return res.status(502).json({ error: 'Je rencontre un problème technique. Réessayez ou contactez-nous sur WhatsApp.' });
  }
};