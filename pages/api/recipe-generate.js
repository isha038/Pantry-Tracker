import { OpenAI } from "openai";

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const data = req.body;
  

    // Format ingredient list with correct property names
    let ingredientList = "No ingredients provided";
    if (Array.isArray(data)) {
      ingredientList = data.map(item => {
        // Check for the presence of name and count
        if (item.name && item.count) {
          return `${item.count}x ${item.name}`;
        } else {
          console.warn("Unexpected item format:", item);
          return ""; // Handle unexpected formats gracefully
        }
      }).filter(item => item).join(", ");
    }

    // Log the formatted ingredient list to verify it
    
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4", // Confirm the model name; use gpt-4 or gpt-4-turbo if applicable
        messages: [
          {
            role: "system",
            content: "You are a culinary expert and recipe generator. Create a recipe based on the ingredients provided.",
          },
          {
            role: "user",
            content: `Here are the ingredients from my pantry: ${ingredientList}.Please create a recipe using these ingredients.`, // Directly stringify the data without wrapping it in an array
          },
        ],
        max_tokens: 1000,
      });

      if (!response.choices || response.choices.length === 0) {
        throw new Error('No choices found in the response from OpenAI API');
      }

      const content = response.choices[0].message.content;
      

      // If the content is expected to be JSON, try to parse it.
      // Otherwise, you can directly send it as a plain text response.
      let result;
      try {
        result = JSON.parse(content); // Only parse if you expect JSON
      } catch (parseError) {
       
        result = { text: content.trim() }; // Fallback to plain text
      }

      res.status(200).json(result);
    } catch (error) {
      console.error("Error creating completion:", error);
      res.status(500).json({ error: "Failed to generate recipe", details: error.message });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).json({ error: "Method not allowed" });
  }
}
