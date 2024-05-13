import { NextRequest, NextResponse } from 'next/server';
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// Stripe POST 
export async function POST(request: NextRequest, response: NextResponse) {

  const payload = await request.text();
  const responseParsed = JSON.parse(payload);
  const stripeSignature = request.headers.get("Stripe-Signature");

  let stripeResult = "Stripe Webhook called;";
  let stripeEvent;

  try {
    stripeEvent = stripe.webhooks.constructEvent(
      payload,
      stripeSignature!,
      // need web hook secret key not stripe secret key
      process.env.STRIPE_WEBHOOK_SECRET!,
    )
    console.log('inside try event.type === ', stripeEvent.type );
  } catch(e){
    console.log("error e === ", e);
    return NextResponse.json({ error: e }, { status: 400 });
  }

  switch (stripeEvent.type) {
    case "payment_intent.succeeded": 
      const paymentIntentSucceeded = stripeEvent.data.object as {
        id: string;
        receipt_email: string;
      }
      console.log('paymentIntentSucceeded === ', paymentIntentSucceeded);
      // NEED TO add db insert here;
      break;
    default: 
      console.warn('unhandled event type ${event.type}');
  }

  return NextResponse.json({ status:"success", message: 'stripe post successful', event: stripeEvent.type });
  // return NextResponse.json ({ received: true, status: stripeResult});

}
