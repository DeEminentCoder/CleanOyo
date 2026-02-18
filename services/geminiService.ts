
import { WasteType } from "../types";

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
    const response = await fetch('/api/ai/waste-tips', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ wasteType })
    });
    const data = await response.json();
    if (data.tip) {
      tipCache[wasteType] = data.tip;
      return data.tip;
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
    const response = await fetch('/api/ai/analyze-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ image: base64Image.split(',')[1] || base64Image })
    });
    return await response.json();
  } catch (error) {
    console.error("AI Analysis failed:", error);
    throw error;
  }
};

export const generateSmsContent = async (type: 'REMINDER' | 'STATUS_UPDATE' | 'CONFIRMATION', data: any) => {
  try {
    const response = await fetch('/api/ai/generate-sms', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ type, data })
    });
    const result = await response.json();
    return result.content || `Waste Up Ibadan: Your ${data.wasteType || 'pickup'} status is now ${data.status}. Thank you!`;
  } catch (error) {
    const status = data.status || 'updated';
    return `Waste Up Ibadan: Your pickup status has been ${status.toLowerCase()}. Thank you for helping us keep Oyo clean.`;
  }
};

export const generateEmailContent = async (type: 'PASSWORD_RESET' | 'PICKUP_CONFIRMATION', data: any) => {
  try {
    const response = await fetch('/api/ai/generate-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ type, data })
    });
    const result = await response.json();
    return result.content || (type === 'PASSWORD_RESET' ? "Hello, please use the link in the app to reset your password." : "Your pickup request has been received. Thank you!");
  } catch (error) {
    if (type === 'PASSWORD_RESET') {
      return `Hello ${data.name || 'Citizen'}, you requested a password reset for your Waste Up Ibadan account. Please visit the portal to continue.`;
    }
    return `Hello ${data.name || 'Citizen'}, your ${data.wasteType || 'waste'} pickup at ${data.location || 'your address'} has been confirmed. Clean Oyo!`;
  }
};