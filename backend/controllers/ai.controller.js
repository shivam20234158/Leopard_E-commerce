import ai from "../ai/gemini.js";
import Product from "../models/product.model.js";

export const chatWithAI = async (req, res) => {
    try {
        const { message } = req.body;

        if (!message) {
            return res.status(400).json({
                message: "Message is required",
            });
        }

        // ---------- Gemini extracts category + price ----------

        const prompt = `
You are an AI shopping assistant.

Your task is to extract product category and price filters.

Return ONLY valid JSON.

Schema:

{
    "category":"",
    "minPrice":0,
    "maxPrice":0
}

Examples

User:
Show shoes under 3000

Response:
{
    "category":"shoes",
    "minPrice":0,
    "maxPrice":3000
}

User:
Recommend jackets above 5000

Response:
{
    "category":"jackets",
    "minPrice":5000,
    "maxPrice":0
}

User:
Show bags between 1000 and 3000

Response:
{
    "category":"bags",
    "minPrice":1000,
    "maxPrice":3000
}

User:

${message}
`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
        });

        const cleaned = response.text
            .replace(/```json/g, "")
            .replace(/```/g, "")
            .trim();

        let filters;

        try {
            filters = JSON.parse(cleaned);
        } catch {
            return res.json({
                reply: "Sorry, I couldn't understand your request.",
            });
        }

        const query = {};

        if (filters.category) {
            query.category = new RegExp(filters.category, "i");
        }

        if (filters.minPrice || filters.maxPrice) {
            query.price = {};

            if (filters.minPrice > 0) {
                query.price.$gte = filters.minPrice;
            }

            if (filters.maxPrice > 0) {
                query.price.$lte = filters.maxPrice;
            }
        }

        const products = await Product.find(query)
            .select("name price description image category")
            .limit(5);

        if (products.length === 0) {
            return res.json({
                reply:
                    "😔 Sorry, I couldn't find any products matching your budget.",
            });
        }

        const reply = products
            .map(
                (product, index) => `
${index + 1}. ${product.name}

💰 Price: ₹${product.price}

📝 ${product.description}
`
            )
            .join("\n-------------------------\n");

        return res.json({
            reply: `🎯 I found these products for you:\n\n${reply}`,
        });
    } catch (error) {
        console.log("AI Error:", error);

        res.status(500).json({
            message: "Internal Server Error",
        });
    }
};