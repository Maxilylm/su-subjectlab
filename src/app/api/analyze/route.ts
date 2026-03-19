import { NextRequest } from "next/server";

interface AnalyzeRequest {
  subjects: string[];
  emailType?: string;
}

export async function POST(request: NextRequest) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return Response.json(
      { error: "GROQ_API_KEY is not configured" },
      { status: 500 }
    );
  }

  let body: AnalyzeRequest;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { subjects, emailType } = body;

  if (!subjects || !Array.isArray(subjects) || subjects.length === 0) {
    return Response.json(
      { error: "At least one subject line is required" },
      { status: 400 }
    );
  }

  if (subjects.length > 5) {
    return Response.json(
      { error: "Maximum 5 subject lines allowed" },
      { status: 400 }
    );
  }

  const filtered = subjects.filter((s) => s.trim().length > 0);
  if (filtered.length === 0) {
    return Response.json(
      { error: "At least one non-empty subject line is required" },
      { status: 400 }
    );
  }

  const emailTypeContext = emailType
    ? ` The email type is: ${emailType}.`
    : "";

  const userPrompt = `Analyze these email subject lines${emailTypeContext}

${filtered.map((s, i) => `${i + 1}. "${s}"`).join("\n")}

Score each on all 4 dimensions (1-10) and determine the winner (0-indexed).`;

  try {
    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            {
              role: "system",
              content:
                "You are an email marketing expert. Score each subject line on 4 dimensions (1-10): openRate, spamRisk (10=very spammy), emotionalPull, clarity. Also provide a brief tip for improvement. Return JSON: { results: [{ subject: string, scores: { openRate: number, spamRisk: number, emotionalPull: number, clarity: number }, overallScore: number, tip: string }], winner: number }. The overallScore should be calculated as: (openRate + (10 - spamRisk) + emotionalPull + clarity) / 4, rounded to one decimal. The winner is the 0-based index of the subject with the highest overallScore.",
            },
            {
              role: "user",
              content: userPrompt,
            },
          ],
          temperature: 0.7,
          max_tokens: 2048,
          response_format: { type: "json_object" },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Groq API error:", response.status, errorText);
      return Response.json(
        { error: `Groq API error: ${response.status}` },
        { status: 502 }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      return Response.json(
        { error: "No response from AI model" },
        { status: 502 }
      );
    }

    const parsed = JSON.parse(content);
    return Response.json(parsed);
  } catch (error) {
    console.error("Analysis error:", error);
    return Response.json(
      { error: "Failed to analyze subject lines" },
      { status: 500 }
    );
  }
}
