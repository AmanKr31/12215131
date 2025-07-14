"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Copy, ExternalLink, Clock, LinkIcon, Trash2 } from "lucide-react"
import { toast } from "@/hooks/use-toast"

export default function UrlShortener() {
  const [urls, setUrls] = useState([])
  const [originalUrl, setOriginalUrl] = useState("")
  const [validityMinutes, setValidityMinutes] = useState(30)
  const [customShortcode, setCustomShortcode] = useState("")
  const [errors, setErrors] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  // Load URLs from localStorage on component mount
  useEffect(() => {
    const savedUrls = localStorage.getItem("shortenedUrls")
    if (savedUrls) {
      const parsedUrls = JSON.parse(savedUrls).map((url) => ({
        ...url,
        createdDate: new Date(url.createdDate),
        expiryDate: new Date(url.expiryDate),
        clickData: url.clickData.map((click) => ({
          ...click,
          timestamp: new Date(click.timestamp),
        })),
      }))
      setUrls(parsedUrls)
    }
  }, [])

  // Save URLs to localStorage whenever urls change
  useEffect(() => {
    localStorage.setItem("shortenedUrls", JSON.stringify(urls))
  }, [urls])

  const validateUrl = (url) => {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  const generateShortCode = () => {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
    let result = ""
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }

  const isShortCodeUnique = (shortCode) => {
    return !urls.some((url) => url.shortCode === shortCode)
  }

  const validateForm = () => {
    const newErrors = []

    if (!originalUrl) {
      newErrors.push("Original URL is required")
    } else if (!validateUrl(originalUrl)) {
      newErrors.push("Invalid URL format")
    }

    if (validityMinutes <= 0) {
      newErrors.push("Validity must be greater than 0")
    }

    if (customShortcode && !isShortCodeUnique(customShortcode)) {
      newErrors.push("Custom shortcode already exists")
    }

    if (customShortcode && !/^[a-zA-Z0-9]+$/.test(customShortcode)) {
      newErrors.push("Custom shortcode must be alphanumeric")
    }

    setErrors(newErrors)
    return newErrors.length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return

    setIsLoading(true)

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const shortCode = customShortcode || generateShortCode()
    const createdDate = new Date()
    const expiryDate = new Date(createdDate.getTime() + validityMinutes * 60000)

    const newUrl = {
      id: Math.random().toString(36).substr(2, 9),
      originalUrl,
      shortCode,
      shortUrl: `http://localhost:3000/${shortCode}`,
      expiryDate,
      createdDate,
      clicks: 0,
      clickData: [],
    }

    setUrls((prev) => [...prev, newUrl])

    // Reset form
    setOriginalUrl("")
    setValidityMinutes(30)
    setCustomShortcode("")
    setErrors([])
    setIsLoading(false)

    toast({
      title: "URL Shortened Successfully",
      description: "Your URL has been shortened and is ready to use.",
    })
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied to clipboard",
      description: "Short URL has been copied to your clipboard.",
    })
  }

  const handleRedirect = (shortCode) => {
    const url = urls.find((u) => u.shortCode === shortCode)
    if (url && new Date() < url.expiryDate) {
      // Simulate click tracking
      const clickData = {
        timestamp: new Date(),
        source: "direct",
        location: "Unknown",
      }

      setUrls((prev) =>
        prev.map((u) => (u.id === url.id ? { ...u, clicks: u.clicks + 1, clickData: [...u.clickData, clickData] } : u)),
      )

      // In a real app, this would redirect to the original URL
      window.open(url.originalUrl, "_blank")
    } else {
      toast({
        title: "Link Expired",
        description: "This shortened URL has expired.",
        variant: "destructive",
      })
    }
  }

  const deleteUrl = (id) => {
    setUrls((prev) => prev.filter((url) => url.id !== id))
    toast({
      title: "URL Deleted",
      description: "The shortened URL has been deleted.",
    })
  }

  const isExpired = (expiryDate) => new Date() > expiryDate

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">URL Shortener</h1>
        <p className="text-muted-foreground">Create short, memorable links with custom options</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* URL Shortener Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LinkIcon className="h-5 w-5" />
              Shorten URL
            </CardTitle>
            <CardDescription>Enter a URL to create a shortened version</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {errors.length > 0 && (
                <Alert variant="destructive">
                  <AlertDescription>
                    <ul className="list-disc list-inside space-y-1">
                      {errors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              <div>
                <Label htmlFor="originalUrl">Original URL *</Label>
                <Input
                  id="originalUrl"
                  placeholder="https://example.com"
                  value={originalUrl}
                  onChange={(e) => setOriginalUrl(e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="validityMinutes">Validity (minutes)</Label>
                <Input
                  id="validityMinutes"
                  type="number"
                  min="1"
                  value={validityMinutes}
                  onChange={(e) => setValidityMinutes(Number.parseInt(e.target.value) || 30)}
                />
              </div>

              <div>
                <Label htmlFor="customShortcode">Custom Shortcode (optional)</Label>
                <Input
                  id="customShortcode"
                  placeholder="mycode123"
                  value={customShortcode}
                  onChange={(e) => setCustomShortcode(e.target.value)}
                />
              </div>

              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? "Shortening..." : "Shorten URL"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* URL List */}
        <Card>
          <CardHeader>
            <CardTitle>Your Shortened URLs</CardTitle>
            <CardDescription>Manage and track your shortened links</CardDescription>
          </CardHeader>
          <CardContent>
            {urls.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No shortened URLs yet. Create your first one!</p>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {urls
                  .slice()
                  .reverse()
                  .map((url) => (
                    <Card key={url.id} className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{url.originalUrl}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <code className="text-xs bg-muted px-2 py-1 rounded">{url.shortUrl}</code>
                              <Badge
                                variant={isExpired(url.expiryDate) ? "destructive" : "secondary"}
                                className="text-xs"
                              >
                                <Clock className="h-3 w-3 mr-1" />
                                {isExpired(url.expiryDate) ? "Expired" : "Active"}
                              </Badge>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteUrl(url.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
                          <div>
                            <p>Created: {url.createdDate.toLocaleDateString()}</p>
                          </div>
                          <div>
                            <p>Expires: {url.expiryDate.toLocaleDateString()}</p>
                          </div>
                          <div>
                            <p>Clicks: {url.clicks}</p>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => copyToClipboard(url.shortUrl)}>
                            <Copy className="h-3 w-3 mr-1" />
                            Copy
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRedirect(url.shortCode)}
                            disabled={isExpired(url.expiryDate)}
                          >
                            <ExternalLink className="h-3 w-3 mr-1" />
                            Visit
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
