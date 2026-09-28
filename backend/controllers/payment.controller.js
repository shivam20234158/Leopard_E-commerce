import Coupon from "../models/coupon.model.js";
import Order from "../models/order.model.js";
import User from "../models/user.model.js";
import { stripe } from "../lib/stripe.js";

export const createCheckoutSession = async (req, res) => {
	try {
		const { products, couponCode } = req.body;

		if (!Array.isArray(products) || products.length === 0) {
			return res.status(400).json({ error: "Invalid or empty products array" });
		}

		let totalAmount = 0;

		const lineItems = products.map((product) => {
			const amount = Math.round(product.price * 100); // stripe wants u to send in the format of cents
			totalAmount += amount * product.quantity;

			return {
				price_data: {
					currency: "usd",
					product_data: {
						name: product.name,
						images: [product.image],
					},
					unit_amount: amount,
				},
				quantity: product.quantity || 1,
			};
		});

		let coupon = null;
		if (couponCode) {
			coupon = await Coupon.findOne({ code: couponCode, userId: req.user._id, isActive: true });
			if (coupon) {
				totalAmount -= Math.round((totalAmount * coupon.discountPercentage) / 100);
			}
		}

		//session for the stripe
		const session = await stripe.checkout.sessions.create({
			payment_method_types: ["card"],
			line_items: lineItems,
			mode: "payment",
			success_url: `${process.env.CLIENT_URL}/purchase-success?session_id={CHECKOUT_SESSION_ID}`,
			cancel_url: `${process.env.CLIENT_URL}/purchase-cancel`,
			discounts: coupon
				? [
					{
						coupon: await createStripeCoupon(coupon.discountPercentage),
					},
				]
				: [],
			//data to extract later
			metadata: {
				userId: req.user._id.toString(),
				couponCode: couponCode || "",
				products: JSON.stringify(
					products.map((p) => ({
						id: p._id,
						quantity: p.quantity,
						price: p.price,
					}))
				),
			},
		});
		//200*100 cents(200 dollars)
		if (totalAmount >= 20000) {
			await createNewCoupon(req.user._id);
		}
		//link given now
		res.status(200).json({
			id: session.id,
			url: session.url,
			totalAmount: totalAmount / 100
		});
	} catch (error) {
		console.error("Error processing checkout:", error);
		res.status(500).json({ message: "Error processing checkout", error: error.message });
	}
};

export const checkoutSuccess = async (req, res) => {
	try {
		const { sessionId } = req.body;
		if (!sessionId) {
			return res.status(400).json({ message: "Session ID is required" });
		}

		// Check if order was already created by webhook
		const existingOrder = await Order.findOne({ stripeSessionId: sessionId });
		if (existingOrder) {
			return res.status(200).json({
				success: true,
				message: "Order already processed.",
				orderId: existingOrder._id,
			});
		}

		const session = await stripe.checkout.sessions.retrieve(sessionId);

		if (session.payment_status === "paid") {
			if (session.metadata.couponCode) {
				await Coupon.findOneAndUpdate(
					{
						code: session.metadata.couponCode,
						userId: session.metadata.userId,
					},
					{
						isActive: false,
					}
				);
			}

			// create a new Order
			const products = JSON.parse(session.metadata.products);
			const newOrder = new Order({
				user: session.metadata.userId,
				products: products.map((product) => ({
					product: product.id,
					quantity: product.quantity,
					price: product.price,
				})),
				totalAmount: session.amount_total / 100, // convert from cents to dollars,
				stripeSessionId: sessionId,
			});

			await newOrder.save();
			const user = await User.findById(session.metadata.userId);
			user.cartItems = []; // Clear the cart items array
			await user.save();

			res.status(200).json({
				success: true,
				message: "Payment successful, order created, and coupon deactivated if used.",
				orderId: newOrder._id,
			});
		}
	} catch (error) {
		console.error("Error processing successful checkout:", error);
		res.status(500).json({ message: "Error processing successful checkout", error: error.message });
	}
};

export const handleStripeWebhook = async (req, res) => {
	const sig = req.headers["stripe-signature"];
	const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

	if (!webhookSecret) {
		console.error("STRIPE_WEBHOOK_SECRET is not configured in environment variables.");
		return res.status(500).json({ error: "Webhook secret is not configured" });
	}

	if (!sig) {
		console.error("Missing stripe-signature header.");
		return res.status(400).json({ error: "Missing stripe-signature header" });
	}

	let event;
	try {
		event = stripe.webhooks.constructEvent(req.rawBody, sig, webhookSecret);
	} catch (err) {
		console.error(`Webhook signature verification failed: ${err.message}`);
		return res.status(400).send(`Webhook Error: ${err.message}`);
	}

	try {
		if (event.type === "checkout.session.completed") {
			const session = event.data.object;

			if (session.payment_status === "paid") {
				// 1. Idempotency Check: check if order already exists
				const existingOrder = await Order.findOne({ stripeSessionId: session.id });
				if (existingOrder) {
					console.log(`Order already fulfilled for session: ${session.id}`);
					return res.status(200).json({ received: true, message: "Order already processed" });
				}

				// 2. Deactivate coupon if used
				if (session.metadata?.couponCode) {
					await Coupon.findOneAndUpdate(
						{
							code: session.metadata.couponCode,
							userId: session.metadata.userId,
						},
						{
							isActive: false,
						}
					);
				}

				// 3. Create the order
				const products = session.metadata?.products
					? JSON.parse(session.metadata.products)
					: [];

				const newOrder = new Order({
					user: session.metadata.userId,
					products: products.map((product) => ({
						product: product.id,
						quantity: product.quantity,
						price: product.price,
					})),
					totalAmount: session.amount_total / 100, // convert from cents to dollars
					stripeSessionId: session.id,
				});

				await newOrder.save();

				// 4. Clear the user's cart
				if (session.metadata?.userId) {
					const user = await User.findById(session.metadata.userId);
					if (user) {
						user.cartItems = [];
						await user.save();
					}
				}

				console.log(`Order ${newOrder._id} created successfully via Stripe webhook.`);
			}
		}

		res.status(200).json({ received: true });
	} catch (error) {
		console.error("Error handling Stripe webhook event:", error);
		res.status(500).json({ error: "Webhook event processing failed" });
	}
};

async function createStripeCoupon(discountPercentage) {
	const coupon = await stripe.coupons.create({
		percent_off: discountPercentage,
		duration: "once",
	});

	return coupon.id;
}

async function createNewCoupon(userId) {
	await Coupon.findOneAndDelete({ userId });

	const newCoupon = new Coupon({
		code: "GIFT" + Math.random().toString(36).substring(2, 8).toUpperCase(),
		discountPercentage: 10,
		expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
		userId: userId,
	});

	await newCoupon.save();

	return newCoupon;
}