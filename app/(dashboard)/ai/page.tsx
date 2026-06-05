"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Send, Bot, Sparkles, AlertCircle, CheckCircle, Clock } from "lucide-react"

export default function AIAssistantPage() {
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState<Array<{
    id: string
    role: string
    content: string
    confidence?: number
    type?: string
  }>>([
    {
      id: "1",
      role: "assistant",
      content: "Hello! I'm your AI admin assistant. I can help you with:\n\n• Reviewing your tasks for the week\n• Identifying missing documents for bookkeeping\n• Drafting emails to request invoices\n• Summarizing your expenses\n• Preparing summaries for your accountant\n\nWhat would you like help with today?",
      confidence: 1.0,
      type: "greeting",
    },
  ])

  const suggestedQuestions = [
    "What do I need to do this week?",
    "What documents are missing for bookkeeping?",
    "Draft an email to request a missing invoice",
    "Summarize my latest expenses",
    "Prepare a clean summary for my accountant",
  ]

  const handleSendMessage = () => {
    if (!message.trim()) return

    const userMessage = {
      id: Date.now().toString(),
      role: "user" as const,
      content: message,
    }

    setMessages([...messages, userMessage])
    setMessage("")

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = {
        id: (Date.now() + 1).toString(),
        role: "assistant" as const,
        content: "I'm analyzing your data to answer that question. This is a simulated response - in production, this would connect to the OpenAI API to provide intelligent assistance based on your actual data.",
        confidence: 0.85,
        type: "response",
      }
      setMessages((prev) => [...prev, aiResponse])
    }, 1000)
  }

  const handleSuggestedQuestion = (question: string) => {
    setMessage(question)
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return "bg-green-100 text-green-800"
    if (confidence >= 0.7) return "bg-yellow-100 text-yellow-800"
    return "bg-red-100 text-red-800"
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">AI Admin Assistant</h2>
        <p className="text-gray-600">Get intelligent help with your admin and bookkeeping tasks</p>
      </div>

      {/* Disclaimer */}
      <Card className="bg-yellow-50 border-yellow-200">
        <CardContent className="pt-6">
          <div className="flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div className="text-sm text-yellow-900">
              <p className="font-medium">Important Disclaimer</p>
              <p className="mt-1">
                This AI assistant provides suggestions and assistance but is not a certified public accountant (CPA) 
                or legal advisor. Always verify AI suggestions with a qualified professional for financial, tax, or legal matters.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Chat Interface */}
        <div className="lg:col-span-2">
          <Card className="h-[600px] flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bot className="h-5 w-5" />
                <span>Chat with AI Assistant</span>
              </CardTitle>
              <CardDescription>
                Ask questions about your business finances and tasks
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${
                      msg.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-4 ${
                        msg.role === "user"
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 text-gray-900"
                      }`}
                    >
                      <div className="flex items-start space-x-2">
                        {msg.role === "assistant" && (
                          <Bot className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                        )}
                        <div className="flex-1">
                          <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                          {msg.role === "assistant" && msg.confidence && (
                            <div className="mt-2 flex items-center space-x-2">
                              <Badge className={getConfidenceColor(msg.confidence)}>
                                {Math.round(msg.confidence * 100)}% confidence
                              </Badge>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex space-x-2">
                <Input
                  placeholder="Ask me anything about your finances..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                />
                <Button onClick={handleSendMessage}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Suggested Questions */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Sparkles className="h-5 w-5" />
                <span>Suggested Questions</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {suggestedQuestions.map((question, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="w-full text-left justify-start h-auto py-3 px-4"
                  onClick={() => handleSuggestedQuestion(question)}
                >
                  <span className="text-sm">{question}</span>
                </Button>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent AI Insights</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-blue-900">Category suggestion</p>
                  <p className="text-xs text-blue-700">Office Depot receipt → Office Supplies</p>
                </div>
              </div>
              <div className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg">
                <Clock className="h-4 w-4 text-yellow-600 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-yellow-900">Deadline reminder</p>
                  <p className="text-xs text-yellow-700">Invoice #5678 due in 5 days</p>
                </div>
              </div>
              <div className="flex items-start space-x-3 p-3 bg-red-50 rounded-lg">
                <AlertCircle className="h-4 w-4 text-red-600 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-900">Duplicate detected</p>
                  <p className="text-xs text-red-700">Transaction #4521 matches #4498</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
