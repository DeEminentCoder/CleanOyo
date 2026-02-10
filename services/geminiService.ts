import { GoogleGenAI, Type } from "@google/genai";
import { WasteType } from "../types";

// Fix: Use process.env.API_KEY directly and ensure named parameter initialization
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Local Knowledge Base for Ibadan Waste Management
const LOCAL_TIPS: Record<string, string[]> = {
  [WasteType.GENERAL]: [
    "Ensure your bin is tightly covered to prevent scavengers from scattering waste into gutters.",
    "Bag your household waste properly before placing it in the PSP container to speed up collection.",
    "Avoid keeping waste bins near electrical poles or transformers for safety during rainstorms."
  ],
  [WasteType.RECYCLABLE]: [
    "Separate 'Pure Water' sachets and PET bottles; many local collectors in areas like Dugbe and Challenge buy these.",
    "Flatten cardboard boxes to save space in your recycling bin and prevent them from blowing into drains.",
    "Clean plastic containers before disposal to prevent odors and pests in your storage area."
  ],
  [WasteType.ORGANIC]: [
    "Yam and plantain peels make excellent compost for backyard gardens in Ibadan—don't let them clog the drains!",
    "Keep food waste in a separate, sealed container to reduce the weight and smell of your main trash bin.",
    "Consider community composting if you live in residential estates like Bodija or Akobo."
  ],
  [WasteType.HAZARDOUS]: [
    "Never pour old engine oil or chemicals into the gutter; it poisons the soil and ruins Ibadan's local water table.",
    "Keep expired medicines and batteries separate from regular trash; call OYWMA for specialized disposal advice.",
    "Wrap broken glass in old newspapers or cardboard before disposal to protect our PSP workers' hands."
  ],
  [WasteType.CONSTRUCTION]: [
    "Construction debris should never be left on the roadside, as heavy rain washes it into drainage culverts.",
    "Hire specialized PSP trucks for bulky waste like old furniture or roofing sheets—don't dump them in the bush.",
    "Reuse broken bricks for filling potholes in your street instead of disposing of them as waste."
  ]
};

const tipCache: Record<string, string> = {};

export const getWasteManagementTips = async (wasteType: string) => {
  if (tipCache[wasteType]) return tipCache[wasteType];

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Provide 1 short, actionable tip for residents in Ibadan, Nigeria to better manage ${wasteType} waste to prevent drainage blockage and flooding. Keep it friendly and localized. (Limit: 30 words)`,
      config: {
        temperature: 0.7,
      },
    });
    
    // Fix: Access response.text property directly
    const text = response.text?.trim();
    if (text) {
      tipCache[wasteType] = text;
      return text;
    }
    throw new Error("Empty response");
  } catch (error: any) {
    const fallbacks = LOCAL_TIPS[wasteType] || [
      "Keep Ibadan clean by disposing of waste only in designated PSP containers to prevent flash floods.",
      "Blocked drains cause flooding in Ibadan; ensure no waste enters the gutters near your home.",
      "Cooperate with your assigned PSP operator for a cleaner and safer Oyo State."
    ];
    return fallbacks[Math.floor(Math.random() * fallbacks.length)];
  }
};

export const analyzeWasteImage = async (base64Image: string) => {
  try {
    // Fix: Use contents: { parts: [...] } structure for sending images and text together
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: base64Image.split(',')[1] || base64Image,
            },
          },
          {
            text: `Identify the waste in this image. Provide:
            1. Waste Category (General, Recyclable, Organic, Hazardous, Construction).
            2. Specific disposal advice for a resident in Ibadan.
            3. Environmental impact if dumped illegally in a gutter.
            Return in JSON format.`,
          },
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            category: { type: Type.STRING },
            advice: { type: Type.STRING },
            impact: { type: Type.STRING }
          },
          required: ["category", "advice", "impact"]
        }
      }
    });

    // Fix: Access text property directly
    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("AI Analysis failed:", error);
    throw error;
  }
};

export const generateSmsContent = async (type: 'REMINDER' | 'STATUS_UPDATE' | 'CONFIRMATION', data: any) => {
  try {
    const prompt = `Generate a short, professional SMS notification (max 140 chars) for a waste management app in Ibadan. 
    Context: ${type}. Details: ${JSON.stringify(data)}. 
    Include 'Waste Up Ibadan'.`;
    
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: { temperature: 0.5 }
    });
    // Fix: Access text property directly
    return response.text?.trim() || `Waste Up Ibadan: Your ${data.wasteType || 'pickup'} status is now ${data.status}. Thank you!`;
  } catch (error) {
    const status = data.status || 'updated';
    return `Waste Up Ibadan: Your pickup status has been ${status.toLowerCase()}. Thank you for helping us keep Oyo clean.`;
  }
};

export const generateEmailContent = async (type: 'PASSWORD_RESET', data: any) => {
  try {
    const prompt = `Generate a warm email for a password reset for Waste Up Ibadan. Recipient: ${data.name}.`;
    
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: { temperature: 0.6 }
    });
    // Fix: Access text property directly
    return response.text || "Hello, please use the link in the app to reset your Waste Up Ibadan password.";
  } catch (error) {
    return `Hello ${data.name || 'Citizen'}, you requested a password reset for your Waste Up Ibadan account. Please visit the portal to continue.`;
  }
};

export interface RouteOptimizationResult {
  optimizedOrder: number[];
  justification: string;
}

export const getRouteOptimizationAdvice = async (locations: string[]): Promise<RouteOptimizationResult> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Suggest an efficient waste collection route for the following locations in Ibadan, Nigeria: ${locations.map((l, i) => `${i}: ${l}`).join(', ')}. 
      Consider traffic patterns in areas like Challenge, Dugbe, and Iwo Road. 
      Return the optimized order by their original index.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            optimizedOrder: {
              type: Type.ARRAY,
              items: { type: Type.INTEGER },
              description: "The sequence of original indices representing the most efficient path."
            },
            justification: {
              type: Type.STRING,
              description: "A short explanation of why this route was chosen (e.g. avoiding Dugbe traffic)."
            }
          },
          required: ["optimizedOrder", "justification"]
        }
      }
    });
    
    // Fix: Access text property directly
    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("AI Route Optimization failed, using simple sequential fallback", error);
    return {
      optimizedOrder: locations.map((_, i) => i),
      justification: "Standard sequential route. (AI optimization currently limited or unavailable)"
    };
  }
};