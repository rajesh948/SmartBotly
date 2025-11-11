import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";

/**
 * AI Client Service
 * Wrapper for Claude and OpenAI APIs with swappable providers
 */

export interface AIResponse {
  reply: string;
  action: "SEND_TEXT" | "SEND_MEDIA" | "CREATE_ORDER" | "RESERVE_STOCK" | "ESCALATE";
  mediaKey?: string;
  metadata?: any;
}

/**
 * Call Claude API
 */
async function callClaude(prompt: string): Promise<AIResponse> {
  try {
    const apiKey = process.env.CLAUDE_API_KEY;
    if (!apiKey) {
      throw new Error("CLAUDE_API_KEY not configured");
    }

    const anthropic = new Anthropic({
      apiKey,
    });

    const message = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    // Extract text content from response
    const content = message.content[0];
    let responseText = "";
    
    if (content.type === "text") {
      responseText = content.text;
    }

    // Try to parse JSON response
    try {
      const parsed = JSON.parse(responseText);
      return {
        reply: parsed.reply || responseText,
        action: parsed.action || "SEND_TEXT",
        mediaKey: parsed.mediaKey,
        metadata: parsed.metadata,
      };
    } catch {
      // If not JSON, return as plain text
      return {
        reply: responseText,
        action: "SEND_TEXT",
      };
    }
  } catch (error: any) {
    console.error("❌ Claude API error:", error);
    throw error;
  }
}

/**
 * Call OpenAI API
 */
async function callOpenAI(prompt: string): Promise<AIResponse> {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error("OPENAI_API_KEY not configured");
    }

    const openai = new OpenAI({
      apiKey,
    });

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 1024,
    });

    const responseText = completion.choices[0]?.message?.content || "";

    // Try to parse JSON response
    try {
      const parsed = JSON.parse(responseText);
      return {
        reply: parsed.reply || responseText,
        action: parsed.action || "SEND_TEXT",
        mediaKey: parsed.mediaKey,
        metadata: parsed.metadata,
      };
    } catch {
      // If not JSON, return as plain text
      return {
        reply: responseText,
        action: "SEND_TEXT",
      };
    }
  } catch (error: any) {
    console.error("❌ OpenAI API error:", error);
    throw error;
  }
}

/**
 * Main AI service function with provider switching
 */
export async function callAI(
  prompt: string,
  provider: "claude" | "openai" = "claude"
): Promise<AIResponse> {
  if (provider === "openai") {
    return callOpenAI(prompt);
  } else {
    return callClaude(prompt);
  }
}
