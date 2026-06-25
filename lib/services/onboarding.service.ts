import { prisma } from "@/lib/prisma"
import { initializeTokenReset } from "./usage-guard.service"

/**
 * Default expense categories by business type for US market
 */
const DEFAULT_CATEGORIES_BY_BUSINESS_TYPE: Record<string, string[]> = {
  FREELANCER: [
    "Software & Services",
    "Office Supplies",
    "Marketing & Advertising",
    "Professional Services",
    "Travel & Entertainment",
    "Utilities",
    "Insurance",
    "Equipment",
    "Education & Training",
    "Home Office",
    "Other",
  ],
  CONTRACTOR: [
    "Materials & Supplies",
    "Equipment Rental",
    "Labor Costs",
    "Tools & Hardware",
    "Transportation",
    "Insurance",
    "Permits & Licenses",
    "Professional Services",
    "Safety Equipment",
    "Other",
  ],
  LOCAL_SERVICE: [
    "Cost of Goods Sold",
    "Inventory",
    "Supplies",
    "Equipment",
    "Marketing",
    "Utilities",
    "Rent",
    "Insurance",
    "Labor",
    "Other",
  ],
  AGENCY: [
    "Software & Subscriptions",
    "Marketing & Advertising",
    "Professional Services",
    "Office Expenses",
    "Travel & Entertainment",
    "Payroll & Benefits",
    "Insurance",
    "Rent",
    "Client Acquisition",
    "Other",
  ],
  TRADES: [
    "Materials",
    "Equipment",
    "Tools",
    "Vehicle Expenses",
    "Labor",
    "Insurance",
    "Permits",
    "Utilities",
    "Safety Equipment",
    "Other",
  ],
  CONSULTANT: [
    "Professional Services",
    "Software & Tools",
    "Marketing",
    "Travel & Entertainment",
    "Office Expenses",
    "Education & Training",
    "Insurance",
    "Professional Fees",
    "Networking",
    "Other",
  ],
  ECOMMERCE: [
    "Cost of Goods Sold",
    "Shipping & Fulfillment",
    "Inventory",
    "Marketing & Advertising",
    "Platform Fees",
    "Software & Subscriptions",
    "Packaging Supplies",
    "Customer Service",
    "Payment Processing",
    "Other",
  ],
}

/**
 * Default plan limits by tier
 */
const PLAN_LIMITS = {
  STARTER: {
    monthlyTokenLimit: 100000,
    monthlyCostLimit: 15.0,
  },
  PRO: {
    monthlyTokenLimit: 500000,
    monthlyCostLimit: 50.0,
  },
  TEAM: {
    monthlyTokenLimit: 2000000,
    monthlyCostLimit: 200.0,
  },
}

/**
 * Initialize organization with business type settings
 */
export async function initializeOrganization(
  organizationId: string,
  businessType: string,
  plan: string = "STARTER"
) {
  try {
    // Get default categories for business type
    const defaultCategories = DEFAULT_CATEGORIES_BY_BUSINESS_TYPE[businessType] || 
      DEFAULT_CATEGORIES_BY_BUSINESS_TYPE["FREELANCER"]

    // Get plan limits
    const planLimits = PLAN_LIMITS[plan as keyof typeof PLAN_LIMITS] || PLAN_LIMITS.STARTER

    // Update organization with business type and plan limits
    await prisma.organization.update({
      where: { id: organizationId },
      data: {
        businessType: businessType as any,
        monthlyTokenLimit: planLimits.monthlyTokenLimit,
        monthlyCostLimit: planLimits.monthlyCostLimit,
        plan: plan as any,
      },
    })

    // Initialize token reset date
    await initializeTokenReset(organizationId)

    // Create default categorization rules based on business type
    const categorizationRules = generateDefaultCategorizationRules(businessType)
    
    for (const rule of categorizationRules) {
      await prisma.categorizationRule.create({
        data: {
          organizationId,
          ...rule,
        },
      })
    }

    // Create default email templates
    await createDefaultTemplates(organizationId, businessType)

    return { success: true, categories: defaultCategories }
  } catch (error) {
    console.error("Error initializing organization:", error)
    throw error
  }
}

/**
 * Generate default categorization rules based on business type
 */
function generateDefaultCategorizationRules(businessType: string): Array<{
  name: string
  condition: string
  category: string
  priority: number
}> {
  const commonRules = [
    {
      name: "Software Subscriptions",
      condition: JSON.stringify({
        field: "description",
        operator: "contains",
        value: ["software", "subscription", "saas", "app", "tool"],
      }),
      category: "Software & Services",
      priority: 10,
    },
    {
      name: "Office Supplies",
      condition: JSON.stringify({
        field: "description",
        operator: "contains",
        value: ["office", "supplies", "stationery", "paper"],
      }),
      category: "Office Supplies",
      priority: 8,
    },
    {
      name: "Marketing Expenses",
      condition: JSON.stringify({
        field: "description",
        operator: "contains",
        value: ["marketing", "advertising", "facebook", "google ads", "promotion"],
      }),
      category: "Marketing & Advertising",
      priority: 9,
    },
    {
      name: "Travel Expenses",
      condition: JSON.stringify({
        field: "description",
        operator: "contains",
        value: ["travel", "flight", "hotel", "uber", "lyft", "airbnb"],
      }),
      category: "Travel & Entertainment",
      priority: 7,
    },
    {
      name: "Insurance Payments",
      condition: JSON.stringify({
        field: "description",
        operator: "contains",
        value: ["insurance", "premium", "coverage"],
      }),
      category: "Insurance",
      priority: 6,
    },
    {
      name: "Utility Bills",
      condition: JSON.stringify({
        field: "description",
        operator: "contains",
        value: ["electric", "water", "gas", "internet", "utility"],
      }),
      category: "Utilities",
      priority: 5,
    },
  ]

  // Add business-specific rules
  const businessSpecificRules: Record<string, any[]> = {
    CONTRACTOR: [
      {
        name: "Materials Purchase",
        condition: JSON.stringify({
          field: "description",
          operator: "contains",
          value: ["materials", "lumber", "concrete", "hardware"],
        }),
        category: "Materials & Supplies",
        priority: 15,
      },
      {
        name: "Equipment Rental",
        condition: JSON.stringify({
          field: "description",
          operator: "contains",
          value: ["rental", "lease", "equipment"],
        }),
        category: "Equipment Rental",
        priority: 14,
      },
    ],
    ECOMMERCE: [
      {
        name: "Shipping Costs",
        condition: JSON.stringify({
          field: "description",
          operator: "contains",
          value: ["shipping", "freight", "delivery", "ups", "fedex"],
        }),
        category: "Shipping & Fulfillment",
        priority: 15,
      },
      {
        name: "Inventory Purchase",
        condition: JSON.stringify({
          field: "description",
          operator: "contains",
          value: ["inventory", "stock", "merchandise"],
        }),
        category: "Inventory",
        priority: 16,
      },
    ],
    AGENCY: [
      {
        name: "Client Entertainment",
        condition: JSON.stringify({
          field: "description",
          operator: "contains",
          value: ["client", "dinner", "lunch", "meeting"],
        }),
        category: "Travel & Entertainment",
        priority: 12,
      },
    ],
  }

  return [...commonRules, ...(businessSpecificRules[businessType] || [])]
}

/**
 * Create default email templates for the organization
 */
async function createDefaultTemplates(organizationId: string, businessType: string) {
  const templates = [
    {
      type: "email",
      name: "Invoice Reminder",
      subject: "Reminder: Invoice [InvoiceNumber] Due [DueDate]",
      body: `Dear [ClientName],

This is a friendly reminder that invoice [InvoiceNumber] for [Amount] is due on [DueDate].

Please let us know if you have any questions or need additional information.

Best regards,
[YourName]`,
      isDefault: true,
    },
    {
      type: "email",
      name: "Payment Received",
      subject: "Payment Received - Invoice [InvoiceNumber]",
      body: `Dear [ClientName],

Thank you for your payment of [Amount] for invoice [InvoiceNumber].

We appreciate your business and look forward to working with you again.

Best regards,
[YourName]`,
      isDefault: true,
    },
    {
      type: "email",
      name: "Vendor Inquiry",
      subject: "Inquiry about [Subject]",
      body: `Dear [VendorName],

I hope this email finds you well. I am writing to inquire about [Subject].

Could you please provide more information or clarify [Details]?

Thank you for your assistance.

Best regards,
[YourName]`,
      isDefault: true,
    },
  ]

  for (const template of templates) {
    await prisma.template.create({
      data: {
        organizationId,
        ...template,
        variables: JSON.stringify(["ClientName", "InvoiceNumber", "Amount", "DueDate", "YourName", "VendorName", "Subject", "Details"]),
      },
    })
  }
}

/**
 * Get default categories for a business type
 */
export function getDefaultCategories(businessType: string): string[] {
  return DEFAULT_CATEGORIES_BY_BUSINESS_TYPE[businessType] || 
    DEFAULT_CATEGORIES_BY_BUSINESS_TYPE["FREELANCER"]
}

/**
 * Get available business types with descriptions
 */
export function getBusinessTypes(): Array<{ value: string; label: string; description: string }> {
  return [
    {
      value: "FREELANCER",
      label: "Freelancer",
      description: "Independent professional offering services to clients",
    },
    {
      value: "CONTRACTOR",
      label: "Contractor",
      description: "Skilled tradesperson working on construction or renovation projects",
    },
    {
      value: "LOCAL_SERVICE",
      label: "Local Service",
      description: "Service-based business serving local customers",
    },
    {
      value: "AGENCY",
      label: "Agency",
      description: "Professional services agency with multiple clients",
    },
    {
      value: "TRADES",
      label: "Trades",
      description: "Skilled trade business (plumbing, electrical, HVAC, etc.)",
    },
    {
      value: "CONSULTANT",
      label: "Consultant",
      description: "Professional consultant providing expert advice",
    },
    {
      value: "ECOMMERCE",
      label: "E-commerce",
      description: "Online retail business selling products",
    },
  ]
}
