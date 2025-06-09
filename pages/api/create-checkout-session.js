import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY); // .env に本番キー

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { diagnosisId } = req.body;

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'jpy',
            product_data: {
              name: '診断応援サポート',
            },
            unit_amount: 100, // ← 100円
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${req.headers.origin}/result/${diagnosisId}?success=true`,
      cancel_url: `${req.headers.origin}/result/${diagnosisId}?canceled=true`,
    });

    res.status(200).json({ url: session.url });
  } catch (err) {
    console.error('Stripe Checkout Error:', err);
    res.status(500).json({ error: 'Stripe Checkout failed' });
  }
}
