import { OpenAI } from "openai";

const openai = new OpenAI({apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,});

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const imageUrl  = req.body.imageUrl;

    if (!imageUrl) {
      res.status(400).json({ error: "Image URL is required" });
      return;
    }

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are a computer program helping a user identify items in an image.",
          },
          {
            role: "user",
            content: [
              { type: "text", text: "Identify the item(s) in the image and return them in a JSON format. Each item should have the following properties: name (the name of the item), category (the category of the item, chosen from the following options: Fruit, Vegetable, Dairy, Meat, Grain, Snack, Flour, Seeds, Spices, Beverages, Canned Goods, Condiments, Frozen, Baking Supplies, Nuts, Oils, Pasta, Rice, Sauces, Seafood), quantity (the estimated quantity of the item), and unit (the unit of measurement, chosen from the following options: kg, lb, piece, cup, g, m, l).The name of the item should be moe than one word." },
              { type: "image_url",
                image_url: {
                  url: imageUrl
                }
              }
            ],
          },
        ],
        max_tokens: 1000,
      });

      if (!response.choices || response.choices.length === 0) {
        throw new Error('No choices found in the response from OpenAI API');
      }

      const content = response.choices[0].message.content;
      

      const cleanedContent = content.replace(/```json|```/g, '').trim();
      console.log("Cleaned OpenAI response:", cleanedContent);

      let items;
      try {
        items = JSON.parse(cleanedContent); // Assuming the response content is valid JSON
      } catch (parseError) {
        console.error("Error parsing OpenAI response:", parseError);
        res.status(500).json({ error: "Error parsing OpenAI response", details: parseError.message });
        return;
      }

      res.status(200).json(items);
    } catch (error) {
      console.error("Error creating completion:", error);
      res.status(500).json({ error: "Failed to analyze image", details: error.message });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).json({ error: "Method not allowed" });
  }
}