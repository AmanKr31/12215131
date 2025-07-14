"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ExternalLink, Clock, AlertCircle } from "lucide-react"

export default function RedirectPage() {
  const params = useParams()
  const router = useRouter()
  const [url, setUrl] = useState(null)
  const [isExpired, setIsExpired] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const shortCode = params.shortCode
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

      const foundUrl = parsedUrls.find((u) => u.shortCode === shortCode)

      if (foundUrl) {
        setUrl(foundUrl)
        const expired = new Date() > foundUrl.expiryDate
        setIsExpired(expired)

        if (!expired) {
          // Track the click
          const clickData = {
            timestamp: new Date(),
            source: document.referrer || "direct",
            location: "Unknown",
          }

          const updatedUrls = parsedUrls.map((u) =>
            u.id === foundUrl.id ? { ...u, clicks: u.clicks + 1, clickData: [...u.clickData, clickData] } : u,
          )

          localStorage.setItem("shortenedUrls", JSON.stringify(updatedUrls))

          // Redirect after a short delay
          setTimeout(() => {
            window.location.href = foundUrl.originalUrl
          }, 2000)
        }
      }
    }

    setIsLoading(false)
  }, [params.shortCode])

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 max-w-2xl">
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p>Loading...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!url) {
    return (
      <div className="container mx-auto p-6 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              URL Not Found
            </CardTitle>
            <CardDescription>The shortened URL you're looking for doesn't exist.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push("/")}>Go to URL Shortener</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isExpired) {
    return (
      <div className="container mx-auto p-6 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <Clock className="h-5 w-5" />
              Link Expired
            </CardTitle>
            <CardDescription>This shortened URL has expired and is no longer valid.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Original URL:</p>
              <p className="font-medium break-all">{url.originalUrl}</p>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Created:</p>
                <p>{url.createdDate.toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Expired:</p>
                <p>{url.expiryDate.toLocaleDateString()}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => router.push("/")}>Create New Short URL</Button>
              <Button variant="outline" onClick={() => window.open(url.originalUrl, "_blank")}>
                <ExternalLink className="h-4 w-4 mr-2" />
                Visit Original URL
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ExternalLink className="h-5 w-5" />
            Redirecting...
          </CardTitle>
          <CardDescription>You will be redirected to the original URL in a moment.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted p-4 rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">Destination:</p>
            <p className="font-medium break-all">{url.originalUrl}</p>
          </div>

          <div className="flex items-center justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>

          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-4">
              If you're not redirected automatically, click the button below.
            </p>
            <Button onClick={() => (window.location.href = url.originalUrl)}>
              <ExternalLink className="h-4 w-4 mr-2" />
              Go to Destination
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-4 text-sm text-center pt-4 border-t">
            <div>
              <p className="text-muted-foreground">Total Clicks</p>
              <p className="font-medium">{url.clicks + 1}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Created</p>
              <p className="font-medium">{url.createdDate.toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Expires</p>
              <p className="font-medium">{url.expiryDate.toLocaleDateString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
