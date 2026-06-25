import OpenAI from "openai"

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
})

// Cost per 1M tokens (approximate USD)
const MODEL_COSTS = {
  "gpt-4o-mini": { input: 0.15, output: 0.60 },
  "claude-3.5-sonnet": { input: 3.0, output: 15.0 },
  "llama-3-8b-instruct": { input: 0.0, output: 0.0 }, // Free tier
}

interface ExtractionResult {
  vendor?: string
  date?: string
  amount?: number
  currency?: string
  tax?: number
  dueDate?: string
  lineItems?: Array<{ description: string; quantity: number; price: number }>
  confidence: number
}

interface AIUsage {
  tokensUsed: number
  costUsd: number
  modelUsed: string
}

/**
 * Extract document data using GPT-4o mini Vision capabilities
 * This function handles PDF/Image documents directly without separate OCR
 */
export async function extractDocumentWithVision(
  fileUrl: string,
  mimeType: string,
  documentType: string
): Promise<{ result: ExtractionResult; usage: AIUsage }> {
  try {
    const prompt = `Extract key information from this ${documentType} document. Return a JSON object with the following fields if present:
- vendor: company name
- date: document date (YYYY-MM-DD)
- amount: total amount (number)
- currency: currency code (e.g., USD)
- tax: tax amount if shown
- dueDate: due date if applicable (YYYY-MM-DD)
- lineItems: array of items with description, quantity, and price
- confidence: overall confidence score (0-1) for this extraction

Important:
- All monetary values must be in USD
- Use standard US business terminology (e.g., "Sales Tax" instead of VAT)
- Provide accurate confidence scores based on extraction certainty
- Return only valid JSON, no explanations`

    const response = await openai.chat.completions.create({
      model: "openai/gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a document extraction assistant for US businesses. Extract structured data from financial documents with high accuracy. Always provide a confidence score (0-1) indicating how certain you are about the extraction. Default all currency to USD.",
        },
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            { type: "image_url", image_url: { url: fileUrl } },
          ],
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.1,
      max_tokens: 2000,
    })

    const content = response.choices[0].message.content
    if (!content) {
      throw new Error("No content in response")
    }

    const result = JSON.parse(content)
    
    // Ensure confidence is present
    if (!result.confidence) {
      result.confidence = 0.8
    }

    // Default currency to USD
    if (!result.currency) {
      result.currency = "USD"
    }

    // Calculate usage
    const tokensUsed = response.usage?.total_tokens || 0
    const inputTokens = response.usage?.prompt_tokens || 0
    const outputTokens = response.usage?.completion_tokens || 0
    const costUsd = (inputTokens / 1_000_000) * MODEL_COSTS["gpt-4o-mini"].input + 
                   (outputTokens / 1_000_000) * MODEL_COSTS["gpt-4o-mini"].output

    return {
      result,
      usage: {
        tokensUsed,
        costUsd,
        modelUsed: "gpt-4o-mini",
      },
    }
  } catch (error) {
    console.error("GPT-4o mini Vision extraction error:", error)
    throw error
  }
}

/**
 * Fallback extraction using Claude 3.5 Sonnet for low confidence extractions
 */
export async function extractDocumentWithClaude(
  fileUrl: string,
  mimeType: string,
  documentType: string
): Promise<{ result: ExtractionResult; usage: AIUsage }> {
  try {
    const prompt = `Extract key information from this ${documentType} document. Return a JSON object with the following fields if present:
- vendor: company name
- date: document date (YYYY-MM-DD)
- amount: total amount (number)
- currency: currency code (e.g., USD)
- tax: tax amount if shown
- dueDate: due date if applicable (YYYY-MM-DD)
- lineItems: array of items with description, quantity, and price
- confidence: overall confidence score (0-1) for this extraction

Important:
- All monetary values must be in USD
- Use standard US business terminology (e.g., "Sales Tax" instead of VAT)
- Provide accurate confidence scores based on extraction certainty
- Return only valid JSON, no explanations`

    const response = await openai.chat.completions.create({
      model: "anthropic/claude-3.5-sonnet",
      messages: [
        {
          role: "system",
          content: "You are a document extraction assistant for US businesses. Extract structured data from financial documents with high accuracy. Always provide a confidence score (0-1) indicating how certain you are about the extraction. Default all currency to USD.",
        },
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            { type: "image_url", image_url: { url: fileUrl } },
          ],
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.1,
      max_tokens: 2000,
    })

    const content = response.choices[0].message.content
    if (!content) {
      throw new Error("No content in response")
    }

    const result = JSON.parse(content)
    
    // Ensure confidence is present
    if (!result.confidence) {
      result.confidence = 0.85
    }

    // Default currency to USD
    if (!result.currency) {
      result.currency = "USD"
    }

    // Calculate usage
    const tokensUsed = response.usage?.total_tokens || 0
    const inputTokens = response.usage?.prompt_tokens || 0
    const outputTokens = response.usage?.completion_tokens || 0
    const costUsd = (inputTokens / 1_000_000) * MODEL_COSTS["claude-3.5-sonnet"].input + 
                   (outputTokens / 1_000_000) * MODEL_COSTS["claude-3.5-sonnet"].output

    return {
      result,
      usage: {
        tokensUsed,
        costUsd,
        modelUsed: "claude-3.5-sonnet",
      },
    }
  } catch (error) {
    console.error("Claude 3.5 Sonnet extraction error:", error)
    throw error
  }
}

/**
 * Main document extraction with automatic routing and fallback
 */
export async function extractDocumentData(
  fileUrl: string,
  mimeType: string,
  documentType: string
): Promise<{ result: ExtractionResult; usage: AIUsage; fallbackUsed: boolean }> {
  // Try GPT-4o mini first
  try {
    const { result, usage } = await extractDocumentWithVision(fileUrl, mimeType, documentType)
    
    // If confidence is below 85%, fallback to Claude
    if (result.confidence < 0.85) {
      console.log(`Low confidence (${result.confidence}), falling back to Claude 3.5 Sonnet`)
      const claudeResult = await extractDocumentWithClaude(fileUrl, mimeType, documentType)
      return {
        result: claudeResult.result,
        usage: claudeResult.usage,
        fallbackUsed: true,
      }
    }
    
    return {
      result,
      usage,
      fallbackUsed: false,
    }
  } catch (error) {
    console.error("Primary extraction failed, trying Claude fallback:", error)
    try {
      const claudeResult = await extractDocumentWithClaude(fileUrl, mimeType, documentType)
      return {
        result: claudeResult.result,
        usage: claudeResult.usage,
        fallbackUsed: true,
      }
    } catch (fallbackError) {
      console.error("Claude fallback also failed:", fallbackError)
      throw new Error("Document extraction failed with both models")
    }
  }
}

/**
 * Categorize transaction using GPT-4o mini for cost efficiency
 */
export async function categorizeTransaction(
  description: string,
  vendor: string,
  amount: number
): Promise<{ category: string; confidence: number; usage: AIUsage }> {
  try {
    const prompt = `Categorize this transaction into one of these standard US expense categories:
- Office Supplies
- Software & Services
- Marketing & Advertising
- Travel & Entertainment
- Professional Services
- Utilities
- Rent & Lease
- Payroll & Benefits
- Insurance
- Sales Tax
- Cost of Goods Sold
- Other

Transaction details:
- Description: ${description}
- Vendor: ${vendor}
- Amount: $${amount}

Return JSON with:
{
  "category": "category name",
  "confidence": 0.85
}`

    const response = await openai.chat.completions.create({
      model: "openai/gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a bookkeeping assistant for US businesses. Categorize transactions into standard expense categories. Always provide a confidence score (0-1) indicating how certain you are about the categorization.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.1,
      max_tokens: 200,
    })

    const content = response.choices[0].message.content
    if (!content) {
      return { category: "Other", confidence: 0.5, usage: { tokensUsed: 0, costUsd: 0, modelUsed: "gpt-4o-mini" } }
    }

    const result = JSON.parse(content)
    
    // Calculate usage
    const tokensUsed = response.usage?.total_tokens || 0
    const inputTokens = response.usage?.prompt_tokens || 0
    const outputTokens = response.usage?.completion_tokens || 0
    const costUsd = (inputTokens / 1_000_000) * MODEL_COSTS["gpt-4o-mini"].input + 
                   (outputTokens / 1_000_000) * MODEL_COSTS["gpt-4o-mini"].output

    return {
      category: result.category || "Other",
      confidence: result.confidence || 0.8,
      usage: {
        tokensUsed,
        costUsd,
        modelUsed: "gpt-4o-mini",
      },
    }
  } catch (error) {
    console.error("Transaction categorization error:", error)
    return { category: "Other", confidence: 0.5, usage: { tokensUsed: 0, costUsd: 0, modelUsed: "gpt-4o-mini" } }
  }
}

/**
 * Generate AI chat response using GPT-4o mini for admin chat
 */
export async function generateAIResponse(
  userQuery: string,
  context: any
): Promise<{ answer: string; confidence: number; source: string; suggestedActions: string[]; checklist: string[]; usage: AIUsage }> {
  try {
    const prompt = `You are an AI admin assistant for small US businesses. Help the user with their query.

User query: ${userQuery}

Context about their business:
${JSON.stringify(context, null, 2)}

Important guidelines:
- Provide helpful, actionable advice for US businesses
- Never claim to be a CPA or legal advisor
- Always include a disclaimer that they should consult a professional for tax/legal matters
- Keep responses concise and clear
- If you're not confident about something, say so
- Provide confidence level (0-1) for your suggestions
- Include source of information (e.g., "based on your transaction history", "general business practice")
- Use US business terminology (e.g., "Vendor", "Sales Tax", "Bookkeeping")

Return a JSON response with:
{
  "answer": "your response",
  "confidence": 0.85,
  "source": "source of information",
  "suggestedActions": ["action1", "action2"],
  "checklist": ["item1", "item2"]
}`

    const response = await openai.chat.completions.create({
      model: "openai/gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are an AI admin assistant for small US businesses. Help with bookkeeping, admin tasks, and financial organization. Always be helpful but never claim to be a CPA or legal advisor. Always provide confidence scores and sources for your suggestions.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 1000,
    })

    const content = response.choices[0].message.content
    if (!content) {
      throw new Error("No content in response")
    }

    const result = JSON.parse(content)
    
    // Add default confidence and source if not provided
    if (!result.confidence) result.confidence = 0.7
    if (!result.source) result.source = "AI analysis"

    // Calculate usage
    const tokensUsed = response.usage?.total_tokens || 0
    const inputTokens = response.usage?.prompt_tokens || 0
    const outputTokens = response.usage?.completion_tokens || 0
    const costUsd = (inputTokens / 1_000_000) * MODEL_COSTS["gpt-4o-mini"].input + 
                   (outputTokens / 1_000_000) * MODEL_COSTS["gpt-4o-mini"].output

    return {
      answer: result.answer,
      confidence: result.confidence,
      source: result.source,
      suggestedActions: result.suggestedActions || [],
      checklist: result.checklist || [],
      usage: {
        tokensUsed,
        costUsd,
        modelUsed: "gpt-4o-mini",
      },
    }
  } catch (error) {
    console.error("AI chat error:", error)
    throw error
  }
}

/**
 * Draft email using GPT-4o mini for cost efficiency
 */
export async function draftEmail(
  template: string,
  context: any
): Promise<{ content: string; usage: AIUsage }> {
  try {
    const prompt = `Draft an email using the following template and context.

Template type: ${template}

Context:
${JSON.stringify(context, null, 2)}

Draft a professional, clear email appropriate for US business communication. Include placeholders for any missing information in brackets like [Name].`

    const response = await openai.chat.completions.create({
      model: "openai/gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a professional email drafter for US businesses. Create clear, professional business emails.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    })

    const content = response.choices[0].message.content || ""
    
    // Calculate usage
    const tokensUsed = response.usage?.total_tokens || 0
    const inputTokens = response.usage?.prompt_tokens || 0
    const outputTokens = response.usage?.completion_tokens || 0
    const costUsd = (inputTokens / 1_000_000) * MODEL_COSTS["gpt-4o-mini"].input + 
                   (outputTokens / 1_000_000) * MODEL_COSTS["gpt-4o-mini"].output

    return {
      content,
      usage: {
        tokensUsed,
        costUsd,
        modelUsed: "gpt-4o-mini",
      },
    }
  } catch (error) {
    console.error("Email drafting error:", error)
    throw error
  }
}

/**
 * Detect duplicate transactions using GPT-4o mini
 */
export async function detectDuplicateTransactions(
  transactions: any[]
): Promise<{ duplicates: string[][]; usage: AIUsage }> {
  try {
    const prompt = `Analyze these transactions and identify potential duplicates. Return a JSON array of transaction IDs that are likely duplicates.

Transactions:
${JSON.stringify(transactions, null, 2)}

Return format: {"duplicates": [["id1", "id2"], ["id3", "id4"]]}`

    const response = await openai.chat.completions.create({
      model: "openai/gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a bookkeeping assistant for US businesses. Identify duplicate transactions based on amount, date, and description.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.1,
      max_tokens: 500,
    })

    const content = response.choices[0].message.content
    if (!content) {
      return { duplicates: [], usage: { tokensUsed: 0, costUsd: 0, modelUsed: "gpt-4o-mini" } }
    }

    const result = JSON.parse(content)
    
    // Calculate usage
    const tokensUsed = response.usage?.total_tokens || 0
    const inputTokens = response.usage?.prompt_tokens || 0
    const outputTokens = response.usage?.completion_tokens || 0
    const costUsd = (inputTokens / 1_000_000) * MODEL_COSTS["gpt-4o-mini"].input + 
                   (outputTokens / 1_000_000) * MODEL_COSTS["gpt-4o-mini"].output

    return {
      duplicates: result.duplicates || [],
      usage: {
        tokensUsed,
        costUsd,
        modelUsed: "gpt-4o-mini",
      },
    }
  } catch (error) {
    console.error("Duplicate detection error:", error)
    return { duplicates: [], usage: { tokensUsed: 0, costUsd: 0, modelUsed: "gpt-4o-mini" } }
  }
}
