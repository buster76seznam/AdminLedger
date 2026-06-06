import { prisma } from "@/lib/prisma"

export interface RuleCondition {
  field: string
  operator: "equals" | "contains" | "greater_than" | "less_than" | "matches"
  value: any
}

export interface CategorizationRuleInput {
  name: string
  conditions: RuleCondition[]
  category: string
  priority?: number
}

export async function createCategorizationRule(
  organizationId: string,
  rule: CategorizationRuleInput
) {
  try {
    return await prisma.categorizationRule.create({
      data: {
        organizationId,
        name: rule.name,
        condition: JSON.stringify(rule.conditions),
        category: rule.category,
        priority: rule.priority || 0,
      },
    })
  } catch (error) {
    console.error("Error creating categorization rule:", error)
    throw error
  }
}

export async function applyRules(
  organizationId: string,
  transaction: { description: string; vendor: string; amount: number }
) {
  try {
    const rules = await prisma.categorizationRule.findMany({
      where: {
        organizationId,
        isActive: true,
      },
      orderBy: { priority: "desc" },
    })

    for (const rule of rules) {
      const conditions = JSON.parse(rule.condition) as RuleCondition[]
      
      if (evaluateConditions(conditions, transaction)) {
        return {
          category: rule.category,
          source: "rule_engine",
          confidence: 1.0,
          ruleId: rule.id,
        }
      }
    }

    return null // No matching rule
  } catch (error) {
    console.error("Error applying rules:", error)
    return null
  }
}

function evaluateConditions(conditions: RuleCondition[], transaction: any): boolean {
  return conditions.every((condition) => {
    const fieldValue = getFieldValue(transaction, condition.field)
    
    switch (condition.operator) {
      case "equals":
        return fieldValue === condition.value
      case "contains":
        return String(fieldValue).toLowerCase().includes(String(condition.value).toLowerCase())
      case "greater_than":
        return Number(fieldValue) > Number(condition.value)
      case "less_than":
        return Number(fieldValue) < Number(condition.value)
      case "matches":
        return new RegExp(condition.value).test(String(fieldValue))
      default:
        return false
    }
  })
}

function getFieldValue(transaction: any, field: string): any {
  switch (field) {
    case "description":
      return transaction.description
    case "vendor":
      return transaction.vendor
    case "amount":
      return transaction.amount
    default:
      return null
  }
}

export async function getCategorizationRules(organizationId: string) {
  try {
    return await prisma.categorizationRule.findMany({
      where: { organizationId },
      orderBy: { priority: "desc" },
    })
  } catch (error) {
    console.error("Error getting categorization rules:", error)
    return []
  }
}

export async function updateCategorizationRule(ruleId: string, updates: Partial<CategorizationRuleInput>) {
  try {
    const data: any = {}
    if (updates.name) data.name = updates.name
    if (updates.category) data.category = updates.category
    if (updates.conditions) data.condition = JSON.stringify(updates.conditions)
    if (updates.priority !== undefined) data.priority = updates.priority

    return await prisma.categorizationRule.update({
      where: { id: ruleId },
      data,
    })
  } catch (error) {
    console.error("Error updating categorization rule:", error)
    throw error
  }
}

export async function deleteCategorizationRule(ruleId: string) {
  try {
    return await prisma.categorizationRule.delete({
      where: { id: ruleId },
    })
  } catch (error) {
    console.error("Error deleting categorization rule:", error)
    throw error
  }
}
