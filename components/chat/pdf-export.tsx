"use client"

import { Button } from "@/components/ui/button"
import { Download, FileText } from "lucide-react"
import { useState } from "react"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

interface PDFExportProps {
  messages: Message[]
}

export default function PDFExport({ messages }: PDFExportProps) {
  const [isExporting, setIsExporting] = useState(false)

  const exportToPDF = async () => {
    if (messages.length === 0) return

    setIsExporting(true)

    try {
      // Dynamic import to reduce bundle size
      const jsPDF = (await import("jspdf")).default

      const doc = new jsPDF()
      const pageWidth = doc.internal.pageSize.width
      const pageHeight = doc.internal.pageSize.height
      const margin = 20
      const maxWidth = pageWidth - 2 * margin
      let yPosition = margin

      // Title
      doc.setFontSize(20)
      doc.setFont("helvetica", "bold")
      doc.text("WeatherChat AI - Conversation History", margin, yPosition)
      yPosition += 15

      // Export date
      doc.setFontSize(10)
      doc.setFont("helvetica", "normal")
      doc.text(`Exported on: ${new Date().toLocaleString()}`, margin, yPosition)
      yPosition += 20

      // Messages
      messages.forEach((message, index) => {
        // Check if we need a new page
        if (yPosition > pageHeight - 40) {
          doc.addPage()
          yPosition = margin
        }

        // Message header
        doc.setFontSize(12)
        doc.setFont("helvetica", "bold")
        const role = message.role === "user" ? "You" : "WeatherChat AI"
        const timestamp = message.timestamp.toLocaleString()
        doc.text(`${role} - ${timestamp}`, margin, yPosition)
        yPosition += 8

        // Message content
        doc.setFontSize(10)
        doc.setFont("helvetica", "normal")

        // Split long text into multiple lines
        const lines = doc.splitTextToSize(message.content, maxWidth)
        lines.forEach((line: string) => {
          if (yPosition > pageHeight - 20) {
            doc.addPage()
            yPosition = margin
          }
          doc.text(line, margin, yPosition)
          yPosition += 5
        })

        yPosition += 10 // Space between messages
      })

      // Footer
      const totalPages = doc.getNumberOfPages()
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i)
        doc.setFontSize(8)
        doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin - 20, pageHeight - 10)
      }

      // Save the PDF
      const fileName = `WeatherChat_${new Date().toISOString().split("T")[0]}.pdf`
      doc.save(fileName)
    } catch (error) {
      console.error("Error exporting PDF:", error)
      alert("Failed to export PDF. Please try again.")
    } finally {
      setIsExporting(false)
    }
  }

  if (messages.length === 0) {
    return null
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={exportToPDF}
      disabled={isExporting}
      className="flex items-center space-x-2 bg-transparent"
    >
      {isExporting ? (
        <>
          <FileText className="h-4 w-4 animate-pulse" />
          <span>Exporting...</span>
        </>
      ) : (
        <>
          <Download className="h-4 w-4" />
          <span>Export PDF</span>
        </>
      )}
    </Button>
  )
}
