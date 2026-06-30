import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
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
    const { messages, reportsContext, currentLanguage = "English" } = body;

    const ai = getAiClient();

    const contextStr = `
CURRENT COMMUNITY HAZARDS TRACKED IN INDIA:
${JSON.stringify(reportsContext || [])}

YOU ARE "AI COMMUNITY HERO AGENT 🤖":
An autonomous, friendly, civic action assistant designed to empower Indian citizens.
This platform operates EXCLUSIVELY in India — all locations, departments, and municipal bodies are Indian.
Your job is to:
1. Help citizens report infrastructure issues (potholes, water leaks, broken streetlights, illegal waste, open drains, stray animals).
2. Answer questions about current complaints, their status, and which Indian municipal departments handle them (PWD, MCD, Jal Board, BSES, BBMP, BMC, etc.).
3. Suggest active safety tips relevant to Indian roads and monsoon conditions.
4. Help translate complaints into Hindi, Tamil, Telugu, Kannada, Bengali, Marathi and other Indian languages.
5. Guide users on filing RTI requests or contacting local ward councillors.
6. Provide helpline numbers: Police (100), Fire (101), Ambulance (102/108), Women Helpline (181), Municipal Corporation tollfree numbers.

Always maintain a helpful, warm, and community-minded tone. Make your responses concise. Reference Indian cities, states, and departments only.
`;

    if (ai && messages && messages.length > 0) {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
          { role: "user", parts: [{ text: `${contextStr}\n\nUser query: ${messages[messages.length - 1].content}` }] }
        ]
      });

      return NextResponse.json({ text: response.text });
    }

    // Fallback responses when Gemini API key is not configured
    const lastUserMessage = messages && messages.length > 0 ? messages[messages.length - 1].content.toLowerCase() : "";
    let reply = "I am the AI Community Hero Agent! I can help you report local infrastructure issues anywhere in India — potholes, water leaks, garbage dumps, broken streetlights, and more. I can also draft formal complaints to your local Municipal Corporation (MCD, BMC, BBMP, etc.). How can I assist you today?";

    if (lastUserMessage.includes("hazard") || lastUserMessage.includes("pothole") || lastUserMessage.includes("report") || lastUserMessage.includes("issue") || lastUserMessage.includes("complaint")) {
      const activeReports = reportsContext || [];
      if (activeReports.length === 0) {
        reply = "There are no reported hazards in the system yet. You can be the first citizen to report! Go to **Report Issue** in the sidebar, upload a photo of the problem, and our AI will automatically analyze it, detect the location, and draft a formal complaint to the concerned department (PWD, Jal Board, MCD, etc.).";
      } else {
        const reportCount = activeReports.length;
        const highestSeverity = Math.max(...activeReports.map((r: any) => r.severity || 0), 0);
        reply = `I am currently tracking **${reportCount} issue(s)** reported by citizens. The highest severity incident is rated at **${highestSeverity}/10**.\n\nWould you like me to guide you on how to submit a new complaint, or inspect details for an existing one?`;
      }
    } else if (lastUserMessage.includes("helpline") || lastUserMessage.includes("emergency") || lastUserMessage.includes("number") || lastUserMessage.includes("phone")) {
      reply = "Here are important Indian helpline numbers:\n\n🚨 **Police**: 100\n🚒 **Fire**: 101\n🏥 **Ambulance**: 102 / 108\n👩 **Women Helpline**: 181\n🏛️ **MCD Delhi**: 011-23220010\n💧 **Delhi Jal Board**: 1916\n⚡ **BSES Power**: 19123\n🛣️ **PWD Delhi**: 011-23490269\n📱 **Swachh Bharat App**: Download from Play Store\n\nFor your specific city's municipal helpline, just ask!";
    } else if (lastUserMessage.includes("translate") || lastUserMessage.includes("language") || lastUserMessage.includes("hindi") || lastUserMessage.includes("tamil") || lastUserMessage.includes("telugu") || lastUserMessage.includes("bengali")) {
      reply = "Yes! I can draft and translate complaint letters into multiple Indian languages including **Hindi, Tamil, Telugu, Kannada, Bengali, Marathi, and Gujarati**. Select your preferred language in the Report Issue form, and I will generate a fully translated formal petition addressed to the correct department.";
    } else if (lastUserMessage.includes("duplicate") || lastUserMessage.includes("join")) {
      reply = "Our system automatically checks GPS coordinates when you submit. If a similar complaint exists within **150 meters**, the agent will suggest you join and upvote the existing report instead of creating a duplicate. This concentrates civic voices for faster resolution!";
    } else if (lastUserMessage.includes("hello") || lastUserMessage.includes("hi") || lastUserMessage.includes("hey") || lastUserMessage.includes("namaste")) {
      reply = "Namaste! 🙏 I am the **AI Community Hero Agent 🤖**.\n\nI am here to help you report, verify, and resolve civic issues in your city — whether it's Delhi, Mumbai, Bengaluru, Chennai, Kolkata, or any other Indian city. Upload a photo of a hazard or describe the issue, and I'll handle the rest!";
    } else if (lastUserMessage.includes("rti") || lastUserMessage.includes("right to information")) {
      reply = "You can file an RTI (Right to Information) request to get details about civic works in your area. Visit **rtionline.gov.in** to file online. The filing fee is ₹10 for Central departments. I can also help you draft the RTI application text if needed!";
    } else if (lastUserMessage.includes("ward") || lastUserMessage.includes("councillor") || lastUserMessage.includes("mla") || lastUserMessage.includes("mp")) {
      reply = "To find your local **Ward Councillor**, visit your city's Municipal Corporation website. For **MLA/MP details**, check the Election Commission website at eci.gov.in. You can also call your Municipal Corporation helpline to get connected to your ward office directly.";
    }

    return NextResponse.json({ text: reply });
  } catch (error: any) {
    console.error("Error in chat API:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
