const { GoogleGenAI } = require("@google/genai");

function extractJSON(text) {
  try {
    return JSON.parse(text);
  } catch (e) {
    const startObj = text.indexOf('{');
    const startArr = text.indexOf('[');
    let startIdx = -1;
    let endChar = '';

    if (startObj !== -1 && (startArr === -1 || startObj < startArr)) {
      startIdx = startObj;
      endChar = '}';
    } else if (startArr !== -1) {
      startIdx = startArr;
      endChar = ']';
    }

    if (startIdx !== -1) {
      let searchIdx = text.lastIndexOf(endChar);
      while (searchIdx > startIdx) {
        const candidate = text.substring(startIdx, searchIdx + 1);
        try {
          return JSON.parse(candidate);
        } catch (innerError) {
          searchIdx = text.lastIndexOf(endChar, searchIdx - 1);
        }
      }
    }
    throw new Error("Could not find or parse valid JSON in model response");
  }
}

exports.handler = async (event, context) => {
  try {
    console.log(`[Netlify] Received ${event.httpMethod} request to /simulate`);
    console.log("Headers received:", JSON.stringify(event.headers));
    
    if (event.httpMethod !== "POST") {
      return { 
        statusCode: 405, 
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "Method Not Allowed" }) 
      };
    }

    if (!event.body) {
      throw new Error("Missing request body");
    }

    const body = JSON.parse(event.body);
    const { prompt, context: simulationContext, systemInstruction, model: requestedModel } = body;
    
    // Model selection logic
    const modelToUse = requestedModel || "gemini-2.0-flash";
    
    // Netlify lowercases all headers
    const userKey = event.headers['x-gemini-key'];
    
    let apiKey = userKey?.trim();
    if (!apiKey || apiKey === "null" || apiKey === "undefined") {
      apiKey = process.env.GEMINI_API_KEY?.trim();
    }

    if (!apiKey) {
      console.error("[Netlify] No API key found");
      return {
        statusCode: 401,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          error: "INVALID_API_KEY",
          message: "Gemini API key is not provided or configured." 
        })
      };
    }

    console.log(`[Netlify] Initializing Gemini with model ${modelToUse}`);
    const ai = new GoogleGenAI({ 
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
    
    const result = await ai.models.generateContent({
      model: modelToUse,
      contents: [{ 
        role: "user", 
        parts: [{ text: `Digital Twin Context: ${JSON.stringify(simulationContext)}\n\nAction/Trigger: ${prompt}` }] 
      }],
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json"
      }
    });

    const text = result.text;
    
    if (!text) {
      throw new Error("Empty response from Gemini");
    }

    console.log(`[Netlify] Successfully received Gemini response`);
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(extractJSON(text))
    };
  } catch (error) {
    console.error("[Netlify Function Fatal Error]", error);
    
    const isApiKeyError = error.message?.includes('API key not valid') || error.status === 403;
    
    return {
      statusCode: isApiKeyError ? 401 : 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        error: isApiKeyError ? "INVALID_API_KEY" : "SERVER_ERROR",
        message: error.message || "Internal Server Error",
        details: error.toString()
      })
    };
  }
};
