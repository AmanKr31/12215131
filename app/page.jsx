"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Copy, ExternalLink, BarChart3, LinkIcon } from "lucide-react"
import { Logger } from "../utils/logger"
import StatisticsPage from "../components/StatisticsPage"

export default function URLShortener() {
  // State for form inputs
  const [originalUrl, setOriginalUrl] = useState("")
  const [validityMinutes, setValidityMinutes] = useState(30)
  const [customShortcode, setCustomShortcode] = useState("")

  // State for shortened URLs
  const [shortenedUrls, setShortenedUrls] = useState([])

  // State for UI
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  // Initialize logger
  const logger = new Logger()

  // Load saved URLs when component mounts
  useEffect(() => {
    const saved = localStorage.getItem("urls")
    if (saved) {
      const parsedUrls = JSON.parse(saved).map((url) => ({
        ...url,
        createdAt: new Date(url.createdAt),
        expiresAt: new Date(url.expiresAt),
        clickData: url.clickData || [],
      }))
      setShortenedUrls(parsedUrls)
      logger.info("Loaded URLs from localStorage", { count: parsedUrls.length })
    }
  }, [])

  // Save URLs to localStorage whenever they change
  useEffect(() => {
    if (shortenedUrls.length > 0) {
      localStorage.setItem("urls", JSON.stringify(shortenedUrls))
      logger.info("Saved URLs to localStorage", { count: shortenedUrls.length })
    }
  }, [shortenedUrls])

  // Generate random shortcode
  function generateShortcode() {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
    let result = ""
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    logger.debug("Generated shortcode", { shortcode: result })
    return result
  }

  // Validate URL format
  function isValidUrl(string) {
    try {
      new URL(string)
      return true
    } catch {
      return false
    }
  }

  // Check if shortcode already exists
  function isShortcodeUnique(shortcode) {
    return !shortenedUrls.some((url) => url.shortcode === shortcode)
  }

  // Get user's approximate location (mock implementation)
  function getUserLocation() {
    // In a real app, you'd use geolocation API or IP-based location
    const locations = ["New York, US", "London, UK", "Tokyo, JP", "Mumbai, IN", "Sydney, AU"]
    return locations[Math.floor(Math.random() * locations.length)]
  }

  // Get click source
  function getClickSource() {
    return document.referrer || "direct"
  }

  // Handle form submission
  function handleSubmit(e) {
    e.preventDefault()
    setError("")

    logger.info("Form submission started", { originalUrl, validityMinutes, customShortcode })

    // Validation
    if (!originalUrl) {
      setError("Please enter a URL")
      logger.warn("Validation failed: Empty URL")
      return
    }

    if (!isValidUrl(originalUrl)) {
      setError("Please enter a valid URL")
      logger.warn("Validation failed: Invalid URL format", { originalUrl })
      return
    }

    if (validityMinutes <= 0) {
      setError("Validity must be greater than 0")
      logger.warn("Validation failed: Invalid validity", { validityMinutes })
      return
    }

    if (customShortcode && !isShortcodeUnique(customShortcode)) {
      setError("This shortcode already exists")
      logger.warn("Validation failed: Shortcode not unique", { customShortcode })
      return
    }

    if (customShortcode && !/^[a-zA-Z0-9]+$/.test(customShortcode)) {
      setError("Shortcode must contain only letters and numbers")
      logger.warn("Validation failed: Invalid shortcode format", { customShortcode })
      return
    }

    setLoading(true)

    // Simulate API call
    setTimeout(() => {
      const shortcode = customShortcode || generateShortcode()
      const now = new Date()
      const expiry = new Date(now.getTime() + validityMinutes * 60000)

      const newUrl = {
        id: Date.now(),
        originalUrl: originalUrl,
        shortcode: shortcode,
        shortUrl: `http://localhost:3000/${shortcode}`,
        createdAt: now,
        expiresAt: expiry,
        clicks: 0,
        clickData: [],
      }

      setShortenedUrls((prev) => [newUrl, ...prev])
      logger.info("URL shortened successfully", {
        shortcode,
        originalUrl,
        validityMinutes,
        expiresAt: expiry,
      })

      // Reset form
      setOriginalUrl("")
      setCustomShortcode("")
      setValidityMinutes(30)
      setLoading(false)
    }, 1000)
  }

  // Copy URL to clipboard
  function copyToClipboard(text) {
    navigator.clipboard.writeText(text)
    logger.info("URL copied to clipboard", { url: text })
    alert("Copied to clipboard!")
  }

  // Handle redirect (simulate click tracking)
  function handleRedirect(url) {
    const now = new Date()

    if (now > new Date(url.expiresAt)) {
      alert("This link has expired")
      logger.warn("Attempted to access expired URL", { shortcode: url.shortcode })
      return
    }

    // Create detailed click data
    const clickData = {
      timestamp: now,
      source: getClickSource(),
      location: getUserLocation(),
      userAgent: navigator.userAgent,
      ip: "192.168.1.1", // Mock IP
    }

    // Update click count and add click data
    setShortenedUrls((prev) =>
      prev.map((u) =>
        u.id === url.id
          ? {
              ...u,
              clicks: u.clicks + 1,
              clickData: [...(u.clickData || []), clickData],
            }
          : u,
      ),
    )

    logger.info("URL clicked", {
      shortcode: url.shortcode,
      clickData,
      totalClicks: url.clicks + 1,
    })

    // Open original URL
    window.open(url.originalUrl, "_blank")
  }

  // Check if URL is expired
  function isExpired(expiresAt) {
    return new Date() > new Date(expiresAt)
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-center mb-8">URL Shortener</h1>

      <Tabs defaultValue="shortener" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="shortener" className="flex items-center gap-2">
            <LinkIcon className="h-4 w-4" />
            URL Shortener
          </TabsTrigger>
          <TabsTrigger value="statistics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Statistics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="shortener" className="mt-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Form Section */}
            <Card>
              <CardHeader>
                <CardTitle>Shorten a URL</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">{error}</div>
                  )}

                  <div>
                    <Label htmlFor="url">Original URL *</Label>
                    <Input
                      id="url"
                      type="url"
                      placeholder="https://example.com"
                      value={originalUrl}
                      onChange={(e) => setOriginalUrl(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="validity">Validity (minutes)</Label>
                    <Input
                      id="validity"
                      type="number"
                      min="1"
                      value={validityMinutes}
                      onChange={(e) => setValidityMinutes(Number(e.target.value))}
                    />
                  </div>

                  <div>
                    <Label htmlFor="shortcode">Custom Shortcode (optional)</Label>
                    <Input
                      id="shortcode"
                      placeholder="mycode123"
                      value={customShortcode}
                      onChange={(e) => setCustomShortcode(e.target.value)}
                    />
                  </div>

                  <Button type="submit" disabled={loading} className="w-full">
                    {loading ? "Creating..." : "Shorten URL"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Recent URLs Section */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Shortened URLs</CardTitle>
              </CardHeader>
              <CardContent>
                {shortenedUrls.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No URLs shortened yet</p>
                ) : (
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {shortenedUrls.slice(0, 5).map((url) => (
                      <div key={url.id} className="border rounded-lg p-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <p className="font-medium text-sm truncate flex-1">{url.originalUrl}</p>
                            <Badge variant={isExpired(url.expiresAt) ? "destructive" : "secondary"}>
                              {isExpired(url.expiresAt) ? "Expired" : "Active"}
                            </Badge>
                          </div>

                          <div className="bg-gray-100 p-2 rounded text-sm font-mono">{url.shortUrl}</div>

                          <div className="flex justify-between text-xs text-gray-500">
                            <span>Created: {url.createdAt.toLocaleDateString()}</span>
                            <span>Clicks: {url.clicks}</span>
                          </div>

                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => copyToClipboard(url.shortUrl)}>
                              <Copy className="h-4 w-4 mr-1" />
                              Copy
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleRedirect(url)}
                              disabled={isExpired(url.expiresAt)}
                            >
                              <ExternalLink className="h-4 w-4 mr-1" />
                              Visit
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="statistics" className="mt-6">
          <StatisticsPage shortenedUrls={shortenedUrls} onRedirect={handleRedirect} onCopy={copyToClipboard} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
