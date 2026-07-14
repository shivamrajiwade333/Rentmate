const supportController = {};

supportController.chat = async (req, res, next) => {
  try {
    const { message, history } = req.body;
    
    if (!message) {
      return res.status(400).json({ success: false, message: 'Message is required' });
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      // Fallback Mock AI if no API key is provided
      const q = message.toLowerCase();
      let reply = "That's a great question! As an AI, I specialize in RentMate features like Zero Brokerage, AI matching, and listings. Could you rephrase that slightly so I can better assist you?";
      
      const contains = (words) => words.some(w => q.includes(w));

      if (contains(['broker', 'fee', 'pay', 'cost', 'commission', 'charge'])) {
        reply = "RentMate is absolutely 100% Zero Brokerage! You connect directly with owners and tenants without any hidden fees or middlemen taking a cut.";
      } else if (contains(['pg', 'paying guest'])) {
        reply = "PG stands for 'Paying Guest'. It's a popular accommodation style where you rent a portion of a house (often shared) and get amenities like food, laundry, and utilities included!";
      } else if (contains(['flatmate', 'roommate', 'partner', 'friend'])) {
        reply = "Looking for a flatmate? Our AI Compatibility Engine will pair you up with people who have similar lifestyles, budgets, and habits. Just complete your profile to start matching!";
      } else if (contains(['list', 'add', 'create', 'property', 'room', 'upload'])) {
        reply = "To list your property or find a room, just complete the steps on your dashboard! Be sure to add clear photos and details to attract the best matches.";
      } else if (contains(['ai', 'match', 'score', 'algorithm', 'engine'])) {
        reply = "Our custom AI Engine analyzes your lifestyle preferences, budget, and location to calculate a 'Compatibility Score'. This ensures you find the perfect roommate or tenant automatically!";
      } else if (contains(['rent', 'price', 'budget', 'expensive', 'cheap'])) {
        reply = "You can set your exact budget preferences in your Profile! Our AI will only show you properties and flatmates that comfortably fit within your financial range.";
      } else if (contains(['deposit', 'security', 'advance'])) {
        reply = "Security deposits are handled directly between the owner and tenant. RentMate does not hold your deposit, ensuring full transparency.";
      } else if (/\b(hi|hello|hey|hii)\b/.test(q)) {
        reply = "Hello there! How can I assist you with your RentMate journey today?";
      } else if (contains(['contact', 'help', 'support', 'issue', 'problem', 'error'])) {
        reply = "You can contact our human support team anytime at support@rentmate.com or call +91 85309 10486.";
      } else if (contains(['thank', 'ok', 'good', 'nice', 'awesome', 'great'])) {
        reply = "You're very welcome! Let me know if you need help with anything else.";
      }

      // Simulate a small network delay so it feels like an AI is "typing"
      await new Promise(resolve => setTimeout(resolve, 800));

      return res.status(200).json({ success: true, reply });
    }

    // Prepare history format for Groq (OpenAI-compatible) API
    // Groq requires role to be 'system', 'user', or 'assistant'.
    let validHistory = history || [];
    
    // We map 'model' from frontend to 'assistant' for Groq
    const formattedHistory = validHistory.map(msg => ({
      role: msg.role === 'model' ? 'assistant' : 'user',
      content: msg.text
    }));

    // System prompt
    const systemPrompt = `
You are the official Support AI for "RentMate", a modern real-estate platform.
CRITICAL RULES:
1. RentMate connects tenants and property owners directly using an AI compatibility matching engine.
2. RentMate guarantees ZERO BROKERAGE FEES.
3. You must ONLY answer questions related to RentMate, renting, finding flatmates, property listings, and platform features.
4. If a user asks about anything unrelated to RentMate or real estate (e.g., coding, weather, politics, general trivia), you MUST politely decline and steer them back to RentMate.
5. Keep your answers extremely concise, friendly, and professional (max 2-3 sentences).
`;

    // Prepend the system message to the history
    formattedHistory.unshift({
      role: 'system',
      content: systemPrompt
    });

    // Append the user's latest message
    formattedHistory.push({
      role: 'user',
      content: message
    });

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: formattedHistory,
        temperature: 0.2, // Keep it deterministic and strict
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(200).json({ 
        success: true, 
        reply: `I'm sorry, the AI API rejected the request. Reason: ${response.status} ${response.statusText}. Please ensure your Groq API key in .env is correct!` 
      });
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || "I'm sorry, I couldn't process that. Please contact support@rentmate.com.";

    res.status(200).json({
      success: true,
      reply
    });

  } catch (error) {
    console.error('Support AI Error:', error);
    next(error);
  }
};

module.exports = supportController;
