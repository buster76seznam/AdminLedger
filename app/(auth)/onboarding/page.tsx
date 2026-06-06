"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Briefcase, Building2, Wrench, User, Store, ShoppingBag } from "lucide-react"

const businessTypes = [
  {
    value: "FREELANCER",
    label: "Freelancer",
    description: "Independent professional working with multiple clients",
    icon: User,
    categories: ["Services", "Software", "Marketing", "Travel", "Office Supplies"],
    templates: ["invoice_reminder", "project_update", "payment_request"],
  },
  {
    value: "AGENCY",
    label: "Agency",
    description: "Service-based business with multiple clients and projects",
    icon: Building2,
    categories: ["Client Services", "Marketing", "Software", "Office Supplies", "Travel"],
    templates: ["project_proposal", "invoice_reminder", "monthly_report", "client_update"],
  },
  {
    value: "TRADES",
    label: "Trades",
    description: "Construction, plumbing, electrical, and other trade services",
    icon: Wrench,
    categories: ["Materials", "Equipment", "Labor", "Subcontractors", "Permits"],
    templates: ["quote_request", "invoice_reminder", "job_completion", "material_order"],
  },
  {
    value: "CONSULTANT",
    label: "Consultant",
    description: "Professional advisor providing expert services",
    icon: Briefcase,
    categories: ["Professional Services", "Travel", "Marketing", "Software", "Office Supplies"],
    templates: ["consulting_agreement", "invoice_reminder", "deliverable_notification", "follow_up"],
  },
  {
    value: "LOCAL_SERVICE",
    label: "Local Service",
    description: "Restaurant, retail, or local service business",
    icon: Store,
    categories: ["COGS", "Rent", "Utilities", "Labor", "Marketing", "Supplies"],
    templates: ["order_confirmation", "invoice_reminder", "appointment_reminder", "promotion"],
  },
  {
    value: "ECOMMERCE",
    label: "E-commerce",
    description: "Online store selling physical or digital products",
    icon: ShoppingBag,
    categories: ["COGS", "Shipping", "Marketing", "Platform Fees", "Software", "Returns"],
    templates: ["order_confirmation", "shipping_notification", "return_request", "abandoned_cart"],
  },
]

export default function OnboardingPage() {
  const router = useRouter()
  const [selectedType, setSelectedType] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!selectedType) return

    setLoading(true)
    try {
      const response = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessType: selectedType }),
      })

      if (response.ok) {
        router.push("/dashboard")
      }
    } catch (error) {
      console.error("Onboarding error:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Welcome to AdminLedger</h1>
          <p className="text-xl text-gray-600">Tell us about your business to personalize your experience</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {businessTypes.map((type) => {
            const Icon = type.icon
            return (
              <Card
                key={type.value}
                className={`cursor-pointer transition-all ${
                  selectedType === type.value
                    ? "border-blue-600 border-2 bg-blue-50"
                    : "hover:border-blue-300"
                }`}
                onClick={() => setSelectedType(type.value)}
              >
                <CardHeader>
                  <Icon className="h-8 w-8 text-blue-600 mb-2" />
                  <CardTitle>{type.label}</CardTitle>
                  <CardDescription>{type.description}</CardDescription>
                </CardHeader>
              </Card>
            )
          })}
        </div>

        {selectedType && (
          <div className="bg-white rounded-lg p-6 border mb-6">
            <h3 className="font-semibold mb-4">What you'll get with {businessTypes.find((t) => t.value === selectedType)?.label} setup:</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-sm text-gray-700 mb-2">Custom Categories</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  {businessTypes.find((t) => t.value === selectedType)?.categories.map((cat) => (
                    <li key={cat}>• {cat}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-sm text-gray-700 mb-2">Email Templates</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  {businessTypes.find((t) => t.value === selectedType)?.templates.map((tpl) => (
                    <li key={tpl}>• {tpl.replace(/_/g, " ")}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-center">
          <Button
            size="lg"
            onClick={handleSubmit}
            disabled={!selectedType || loading}
            className="min-w-[200px]"
          >
            {loading ? "Setting up..." : "Continue to Dashboard"}
          </Button>
        </div>
      </div>
    </div>
  )
}
