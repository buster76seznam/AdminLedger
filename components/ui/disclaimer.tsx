import { AlertTriangle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export function AIDisclaimer() {
  return (
    <Alert variant="default" className="bg-amber-50 border-amber-200">
      <AlertTriangle className="h-4 w-4 text-amber-600" />
      <AlertTitle className="text-amber-900">AI Assistance Disclaimer</AlertTitle>
      <AlertDescription className="text-amber-800">
        FuiLedger provides AI-powered assistance for administrative tasks and bookkeeping preparation. 
        This service is not a substitute for professional accounting, tax, or legal advice. 
        All AI suggestions should be reviewed and approved by you before being applied. 
        Consult a CPA or legal professional for tax, accounting, or legal matters.
      </AlertDescription>
    </Alert>
  )
}

export function ConfidenceIndicator({ confidence, source }: { confidence: number; source?: string }) {
  const getColor = () => {
    if (confidence >= 0.8) return "text-green-600"
    if (confidence >= 0.6) return "text-yellow-600"
    return "text-red-600"
  }

  const getLabel = () => {
    if (confidence >= 0.8) return "High Confidence"
    if (confidence >= 0.6) return "Medium Confidence"
    return "Low Confidence - Review Required"
  }

  return (
    <div className="flex items-center gap-2 text-sm">
      <span className={`font-medium ${getColor()}`}>{getLabel()}</span>
      <span className="text-gray-500">({(confidence * 100).toFixed(0)}%)</span>
      {source && <span className="text-gray-400">• Source: {source}</span>}
    </div>
  )
}

export function SourceDisplay({ source, entityType }: { source: string; entityType: string }) {
  const sourceLabels: Record<string, string> = {
    ai: "AI Generated",
    manual: "Manual Entry",
    import: "Imported",
    api: "API",
    ocr: "OCR Extracted",
  }

  return (
    <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-gray-100 text-xs text-gray-600">
      <span>{sourceLabels[source] || source}</span>
      {entityType && <span>• {entityType}</span>}
    </div>
  )
}
