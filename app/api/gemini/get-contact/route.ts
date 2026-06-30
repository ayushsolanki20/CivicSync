import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    console.warn("GEMINI_API_KEY is not configured for dynamic municipal contact lookup.");
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { locationName, department } = body;

    const ai = getAiClient();
    if (ai && locationName && department) {
      const prompt = `You are a municipal dispatch and routing assistant.
Based on the civic issue location: "${locationName}" and the assigned department: "${department}", identify the nearest real-world municipal corporation office, zone office, ward office, or utility dispatch center that handles complaints in this location.

Provide the exact real-world office details (no generic placeholders like "Indore Municipal Corporation Shivaji Market" if there is a more specific zone/ward office, and use the correct official local support email, local helpline, and operational hours).

You MUST respond strictly in JSON format matching this schema:
{
  "name": "string (the name of the specific office, e.g. Indore Municipal Corporation Zone 14 Office)",
  "address": "string (the physical address of this specific office)",
  "phone": "string (the specific hotline number or local contact number for this office/department)",
  "email": "string (the official complaint/support email address)",
  "hours": "string (operational hours, e.g., Mon-Sat: 9:00 AM - 5:00 PM, or 24/7 Water emergency)"
}`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        }
      });

      const responseText = response.text;
      if (responseText) {
        const parsed = JSON.parse(responseText.trim());
        return NextResponse.json(parsed);
      }
    }
  } catch (error) {
    console.error("Error in get-contact API:", error);
  }

  // Generic fallback if AI call fails
  const city = locationName && locationName.toLowerCase().includes("mumbai") ? "Mumbai" 
             : locationName && locationName.toLowerCase().includes("bengaluru") ? "Bengaluru" 
             : locationName && locationName.toLowerCase().includes("indore") ? "Indore" 
             : "Delhi";

  if (city === "Mumbai") {
    return NextResponse.json({
      name: "BMC Ward Office",
      address: `Brihanmumbai Municipal Corporation (BMC) Office near ${locationName || "Mumbai"}`,
      phone: "1916",
      email: "swm.clean@mcgm.gov.in",
      hours: "Mon-Sat: 9:30 AM - 6:00 PM"
    });
  } else if (city === "Bengaluru") {
    return NextResponse.json({
      name: "BBMP Zone Office",
      address: `Bruhat Bengaluru Mahanagara Palike (BBMP) Office near ${locationName || "Bengaluru"}`,
      phone: "080-22660000",
      email: "swm.cleanup@bbmp.gov.in",
      hours: "Mon-Sat: 9:00 AM - 5:30 PM"
    });
  } else if (city === "Indore") {
    return NextResponse.json({
      name: "Indore Municipal Corporation Zone Office",
      address: `IMC Zone Office near ${locationName || "Indore"}`,
      phone: "0731-2535555",
      email: "imcindia11@gmail.com",
      hours: "Mon-Sat: 10:00 AM - 5:00 PM"
    });
  }

  return NextResponse.json({
    name: "Municipal Secretariat Office",
    address: `Municipal Corporation Office near ${locationName || "Location"}`,
    phone: "1800-11-0093",
    email: "civic.helpline@delhi.gov.in",
    hours: "Mon-Fri: 9:30 AM - 6:00 PM"
  });
}
