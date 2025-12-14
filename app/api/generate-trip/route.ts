import { NextResponse } from "next/server";
import OpenAI from "openai";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: Request) {
  try {
    const { destinations, daysCount, lang } = await req.json();

    if (
      !destinations ||
      !Array.isArray(destinations) ||
      destinations.length === 0
    ) {
      return NextResponse.json(
        { error: "destinations is required" },
        { status: 400 }
      );
    }
    if (!daysCount || typeof daysCount !== "number") {
      return NextResponse.json(
        { error: "daysCount is required" },
        { status: 400 }
      );
    }

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });
    const destString = destinations.join(", ");

    // ------------------ PROMPT ------------------
    const prompt = `
Create a ${daysCount}-day travel itinerary for a trip covering these destinations: ${destString}.

Output language MUST be: ${lang}.
All text (tripName, activity titles, descriptions, startTime words, duration notes, location names, tags)
must be written in ${lang}.
Do NOT translate JSON keys — only translate textual content.
All activities MUST use real, specific, and searchable place names (POI).
The location field must contain an exact place name that can be found directly on Google Maps.
Do NOT use vague or generic locations such as city center, downtown, local market, seaside, or mountain area.

Each activity title MUST include the exact place name being visited.

Provide concrete activity descriptions that clearly explain what the traveler will do at that specific place.

All activities within the same day must be geographically close and logically connected.

Each day should focus on a single town or neighboring areas only.
Do NOT plan routes that require backtracking or long-distance travel within the same day.

Activities must be ordered to minimize travel distance, following a realistic travel route.
If a destination requires special transportation (such as a ferry or mountain road),
the entire day should primarily focus on that area.

Duration must be in minutes.
Return a structured JSON:
{
  "tripName": string,
  "days": [
    {
      "dayOffset": number,
      "activities": [
        {
          "title": string,
          "description": string,
          "startTime": "HH:mm",
          "duration": number,
          "location": string,
          "tags": [string]
        }
      ]
    }
  ]
}
    `;

    // ------------------ OPENAI CALL ------------------
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });
    
    const data = JSON.parse(completion.choices[0].message.content as string);
    
    // ------------------ TRANSFORM INTO APP FORMAT ------------------
    const startDate = new Date();

    const days = data.days.map((d: any, index: number) => {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + index);

      return {
        id: uuidv4(),
        date: date.toISOString().split("T")[0],
        activities: d.activities.map((a: any) => ({
          id: uuidv4(),
          ...a,
        })),
      };
    });

    const itinerary = {
      name: data.tripName || `Trip to ${destString}`,
      destination: destString,
      startDate: startDate.toISOString().split("T")[0],
      endDate: days[days.length - 1].date,
      days,
    };

    return NextResponse.json(itinerary, { status: 200 });
  } catch (error) {
    console.error("OpenAI generation failed:", error);
    return NextResponse.json(
      { error: "OpenAI failed", detail: `${error}` },
      { status: 500 }
    );
  }
}
