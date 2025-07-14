"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Download, Trash2, Search, Filter } from "lucide-react"
import { Logger } from "./index"

export default function LogViewer() {
  const [logs, setLogs] = useState([])
  const [filteredLogs, setFilteredLogs] = useState([])
  const [filterLevel, setFilterLevel] = useState("ALL")
  const [searchTerm, setSearchTerm] = useState("")
  const [logger] = useState(() => new Logger())

  // Load logs on component mount
  useEffect(() => {
    const allLogs = logger.getLogs()
    setLogs(allLogs)
    setFilteredLogs(allLogs)
  }, [logger])

  // Filter logs based on level and search term
  useEffect(() => {
    let filtered = logs

    // Filter by level
    if (filterLevel !== "ALL") {
      filtered = filtered.filter((log) => log.level === filterLevel)
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (log) =>
          log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (log.data && JSON.stringify(log.data).toLowerCase().includes(searchTerm.toLowerCase())),
      )
    }

    setFilteredLogs(filtered)
  }, [logs, filterLevel, searchTerm])

  // Get badge variant for log level
  const getBadgeVariant = (level) => {
    switch (level) {
      case "DEBUG":
        return "secondary"
      case "INFO":
        return "default"
      case "WARN":
        return "destructive"
      case "ERROR":
        return "destructive"
      default:
        return "secondary"
    }
  }

  // Export logs
  const handleExportLogs = () => {
    const dataStr = logger.exportLogs()
    const dataBlob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement("a")
    link.href = url
    link.download = `url-shortener-logs-${new Date().toISOString().split("T")[0]}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  // Clear logs
  const handleClearLogs = () => {
    if (confirm("Are you sure you want to clear all logs?")) {
      logger.clearLogs()
      setLogs([])
      setFilteredLogs([])
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Application Logs</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleExportLogs}>
              <Download className="h-4 w-4 mr-1" />
              Export
            </Button>
            <Button variant="outline" size="sm" onClick={handleClearLogs}>
              <Trash2 className="h-4 w-4 mr-1" />
              Clear
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex gap-4 mb-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
              <Input
                placeholder="Search logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Select value={filterLevel} onValueChange={setFilterLevel}>
            <SelectTrigger className="w-32">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Levels</SelectItem>
              <SelectItem value="DEBUG">Debug</SelectItem>
              <SelectItem value="INFO">Info</SelectItem>
              <SelectItem value="WARN">Warning</SelectItem>
              <SelectItem value="ERROR">Error</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Log entries */}
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {filteredLogs.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No logs found</p>
          ) : (
            filteredLogs
              .slice()
              .reverse()
              .map((log) => (
                <div key={log.id} className="border rounded p-3 text-sm">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge variant={getBadgeVariant(log.level)}>{log.level}</Badge>
                      <span className="text-gray-500 text-xs">{log.timestamp.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="font-medium mb-1">{log.message}</div>
                  {log.data && (
                    <div className="bg-gray-50 p-2 rounded text-xs">
                      <pre>{JSON.stringify(log.data, null, 2)}</pre>
                    </div>
                  )}
                </div>
              ))
          )}
        </div>

        {/* Log statistics */}
        <div className="mt-4 pt-4 border-t">
          <div className="grid grid-cols-4 gap-4 text-center text-sm">
            <div>
              <div className="font-bold text-blue-600">{logs.length}</div>
              <div className="text-gray-500">Total</div>
            </div>
            <div>
              <div className="font-bold text-green-600">{logs.filter((l) => l.level === "INFO").length}</div>
              <div className="text-gray-500">Info</div>
            </div>
            <div>
              <div className="font-bold text-yellow-600">{logs.filter((l) => l.level === "WARN").length}</div>
              <div className="text-gray-500">Warnings</div>
            </div>
            <div>
              <div className="font-bold text-red-600">{logs.filter((l) => l.level === "ERROR").length}</div>
              <div className="text-gray-500">Errors</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
