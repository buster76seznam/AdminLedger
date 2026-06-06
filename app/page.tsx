import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Check, Bot, FileText, TrendingUp, Shield, Zap } from "lucide-react"

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Bot className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold">AdminLedger</span>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/login">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/signup">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl font-bold tracking-tight mb-6">
          Save 5 Hours a Week on Admin Work
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Prepare clean books in minutes, not hours. AI-powered document processing, 
          smart categorization, and automated task management for US small businesses.
        </p>
        <div className="flex items-center justify-center space-x-4">
          <Link href="/signup">
            <Button size="lg" className="text-lg">
              Start 14-Day Free Trial
            </Button>
          </Link>
          <Link href="/login">
            <Button size="lg" variant="outline" className="text-lg">
              See How It Works
            </Button>
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center mb-12">Real Results for Small Businesses</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <Card>
            <CardHeader>
              <FileText className="h-12 w-12 text-blue-600 mb-4" />
              <CardTitle>Process Documents in Seconds</CardTitle>
              <CardDescription>
                Upload invoices and receipts. AI extracts data with 95% accuracy, saving you hours of manual entry.
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <Bot className="h-12 w-12 text-blue-600 mb-4" />
              <CardTitle>Get Answers, Not Just Data</CardTitle>
              <CardDescription>
                Ask questions about your finances in plain English. Get instant insights and actionable recommendations.
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <TrendingUp className="h-12 w-12 text-blue-600 mb-4" />
              <CardTitle>Export to QuickBooks in One Click</CardTitle>
              <CardDescription>
                Categorize transactions automatically, detect duplicates, and export clean data your accountant will love.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* Pricing */}
      <section className="container mx-auto px-4 py-20 bg-gray-50 rounded-3xl">
        <h2 className="text-3xl font-bold text-center mb-4">Start Free, Pay When You're Ready</h2>
        <p className="text-gray-600 text-center mb-12">14-day trial. No credit card required. Cancel anytime.</p>
        
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* Starter */}
          <Card>
            <CardHeader>
              <CardTitle>Starter</CardTitle>
              <CardDescription>Perfect for solo entrepreneurs</CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold">$29</span>
                <span className="text-gray-600">/month</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-center"><Check className="h-4 w-4 mr-2 text-green-600" /> Up to 100 documents/month</li>
                <li className="flex items-center"><Check className="h-4 w-4 mr-2 text-green-600" /> 1 user</li>
                <li className="flex items-center"><Check className="h-4 w-4 mr-2 text-green-600" /> Basic AI features</li>
                <li className="flex items-center"><Check className="h-4 w-4 mr-2 text-green-600" /> Email support</li>
              </ul>
              <Link href="/signup">
                <Button className="w-full mt-6" variant="outline">Get Started</Button>
              </Link>
            </CardContent>
          </Card>

          {/* Pro */}
          <Card className="border-blue-600 border-2">
            <CardHeader>
              <CardTitle>Pro</CardTitle>
              <CardDescription>For growing businesses</CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold">$59</span>
                <span className="text-gray-600">/month</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-center"><Check className="h-4 w-4 mr-2 text-green-600" /> Up to 500 documents/month</li>
                <li className="flex items-center"><Check className="h-4 w-4 mr-2 text-green-600" /> Up to 5 users</li>
                <li className="flex items-center"><Check className="h-4 w-4 mr-2 text-green-600" /> Advanced AI features</li>
                <li className="flex items-center"><Check className="h-4 w-4 mr-2 text-green-600" /> Priority support</li>
                <li className="flex items-center"><Check className="h-4 w-4 mr-2 text-green-600" /> Custom categories</li>
              </ul>
              <Link href="/signup">
                <Button className="w-full mt-6">Get Started</Button>
              </Link>
            </CardContent>
          </Card>

          {/* Team */}
          <Card>
            <CardHeader>
              <CardTitle>Team</CardTitle>
              <CardDescription>For larger organizations</CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold">$199</span>
                <span className="text-gray-600">/month</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-center"><Check className="h-4 w-4 mr-2 text-green-600" /> Unlimited documents</li>
                <li className="flex items-center"><Check className="h-4 w-4 mr-2 text-green-600" /> Up to 25 users</li>
                <li className="flex items-center"><Check className="h-4 w-4 mr-2 text-green-600" /> Full AI features</li>
                <li className="flex items-center"><Check className="h-4 w-4 mr-2 text-green-600" /> Dedicated support</li>
                <li className="flex items-center"><Check className="h-4 w-4 mr-2 text-green-600" /> API access</li>
                <li className="flex items-center"><Check className="h-4 w-4 mr-2 text-green-600" /> Custom integrations</li>
              </ul>
              <Link href="/signup">
                <Button className="w-full mt-6" variant="outline">Contact Sales</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Trust Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-3xl mx-auto text-center">
          <Shield className="h-16 w-16 text-blue-600 mx-auto mb-6" />
          <h2 className="text-3xl font-bold mb-4">Built for Trust</h2>
          <p className="text-gray-600 mb-8">
            AdminLedger is designed to assist, not replace. We provide tools to help you organize 
            your finances, but you remain in control. All AI suggestions require your approval, 
            and every change is logged for transparency.
          </p>
          <div className="grid md:grid-cols-3 gap-6 text-left">
            <div>
              <h3 className="font-semibold mb-2">Not a CPA</h3>
              <p className="text-sm text-gray-600">We provide administrative assistance, not professional tax or legal advice.</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">You're in Control</h3>
              <p className="text-sm text-gray-600">All AI suggestions require your approval before being applied.</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Full Audit Trail</h3>
              <p className="text-sm text-gray-600">Every change is logged for transparency and compliance.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to Simplify Your Admin Work?</h2>
        <p className="text-gray-600 mb-8">Join thousands of small businesses using AdminLedger</p>
        <Link href="/signup">
          <Button size="lg" className="text-lg">
            Start Your Free Trial
          </Button>
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t bg-gray-50 py-8">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p>&copy; 2026 AdminLedger. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
