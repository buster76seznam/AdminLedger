import OpenAI from "openai"

const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
})

export async function extractDocumentData(ocrText: string, documentType: string) {
  try {
    const prompt = `Extract key information from this ${documentType} document. Return a JSON object with the following fields if present:
- vendor: company name
- date: document date (YYYY-MM-DD)
- amount: total amount (number)
- currency: currency code (e.g., USD)
- tax: tax amount if shown
- dueDate: due date if applicable (YYYY-MM-DD)
- lineItems: array of items with description, quantity, and price

Document text:
${ocrText}

Return only valid JSON, no explanations.`

    const response = await openai.chat.completions.create({
      model: "meta-llama/llama-3-8b-instruct:free",
      messages: [
        {
          role: "system",
          content: "You are a document extraction assistant. Extract structured data from financial documents.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.1,
    })

    const content = response.choices[0].message.content
    if (!content) {
      throw new Error("No content in response")
    }

    return JSON.parse(content)
  } catch (error) {
    console.error("OpenAI extraction error:", error)
    throw error
  }
}

export async function categorizeTransaction(description: string, vendor: string, amount: number) {
  try {
    const prompt = `Categorize this transaction into one of these expense categories:
- Office Supplies
- Software & Services
- Marketing
- Travel
- Professional Services
- Utilities
- Rent
- Payroll
- Insurance
- Other

Transaction details:
- Description: ${description}
- Vendor: ${vendor}
- Amount: $${amount}

Return only the category name, no explanations.`

    const response = await openai.chat.completions.create({
      model: "meta-llama/llama-3-8b-instruct:free",
      messages: [
        {
          role: "system",
          content: "You are a bookkeeping assistant. Categorize transactions into standard expense categories.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.1,
    })

    const category = response.choices[0].message.content?.trim()
    return category || "Other"
  } catch (error) {
    console.error("OpenAI categorization error:", error)
    return "Other"
  }
}

export async function detectDuplicateTransactions(transactions: any[]) {
  try {
    const prompt = `Analyze these transactions and identify potential duplicates. Return a JSON array of transaction IDs that are likely duplicates.

Transactions:
${JSON.stringify(transactions, null, 2)}

Return format: {"duplicates": [["id1", "id2"], ["id3", "id4"]]}`

    const response = await openai.chat.completions.create({
      model: "meta-llama/llama-3-8b-instruct:free",
      messages: [
        {
          role: "system",
          content: "You are a bookkeeping assistant. Identify duplicate transactions based on amount, date, and description.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.1,
    })

    const content = response.choices[0].message.content
    if (!content) {
      return { duplicates: [] }
    }

    return JSON.parse(content)
  } catch (error) {
    console.error("OpenAI duplicate detection error:", error)
    return { duplicates: [] }
  }
}

export async function generateAIResponse(userQuery: string, context: any) {
  try {
    const prompt = `You are an AI admin assistant for small businesses. Help the user with their query.

User query: ${userQuery}

Context about their business:
${JSON.stringify(context, null, 2)}

Important guidelines:
- Provide helpful, actionable advice
- Never claim to be a CPA or legal advisor
- Always include a disclaimer that they should consult a professional for tax/legal matters
- Keep responses concise and clear
- If you're not confident about something, say so
- Provide confidence level (0-1) for your suggestions

Return a JSON response with:
{
  "answer": "your response",
  "confidence": 0.85,
  "suggestedActions": ["action1", "action2"],
  "checklist": ["item1", "item2"]
}`

    const response = await openai.chat.completions.create({
      model: "meta-llama/llama-3-8b-instruct:free",
      messages: [
        {
          role: "system",
          content: "You are an AI admin assistant for small US businesses. Help with bookkeeping, admin tasks, and financial organization. Always be helpful but never claim to be a CPA or legal advisor.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    })

    const content = response.choices[0].message.content
    if (!content) {
      throw new Error("No content in response")
    }

    return JSON.parse(content)
  } catch (error) {
    console.error("OpenAI chat error:", error)
    throw error
  }
}

export async function draftEmail(template: string, context: any) {
  try {
    const prompt = `Draft an email using the following template and context.

Template type: ${template}

Context:
${JSON.stringify(context, null, 2)}

Draft a professional, clear email. Include placeholders for any missing information in brackets like [Name].`

    const response = await openai.chat.completions.create({
      model: "meta-llama/llama-3-8b-instruct:free",
      messages: [
        {
          role: "system",
          content: "You are a professional email drafter. Create clear, professional business emails.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
    })

    return response.choices[0].message.content || ""
  } catch (error) {
    console.error("OpenAI email drafting error:", error)
    throw error
  }
}
