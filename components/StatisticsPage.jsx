"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Copy, ExternalLink, Clock, MapPin, Monitor, Calendar, BarChart3 } from "lucide-react"

export default function StatisticsPage({ shortenedUrls, onRedirect, onCopy }) {
  // Check if URL is expired
  function isExpired(expiresAt) {
    return new Date() > new Date(expiresAt)
  }

  // Calculate total statistics
  const totalUrls = shortenedUrls.length
  const totalClicks = shortenedUrls.reduce((sum, url) => sum + url.clicks, 0)
  const activeUrls = shortenedUrls.filter((url) => !isExpired(url.expiresAt)).length
  const expiredUrls = totalUrls - activeUrls

  return (
    <div className="space-y-6">
      {/* Overview Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{totalUrls}</div>
            <div className="text-sm text-gray-500">Total URLs</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{totalClicks}</div>
            <div className="text-sm text-gray-500">Total Clicks</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-emerald-600">{activeUrls}</div>
            <div className="text-sm text-gray-500">Active URLs</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">{expiredUrls}</div>
            <div className="text-sm text-gray-500">Expired URLs</div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed URL Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>All Shortened URLs</CardTitle>
        </CardHeader>
        <CardContent>
          {shortenedUrls.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <Clock className="h-12 w-12 mx-auto" />
              </div>
              <p className="text-gray-500">No URLs have been shortened yet.</p>
              <p className="text-sm text-gray-400">Create your first shortened URL to see statistics here.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {shortenedUrls.map((url) => (
                <Card key={url.id} className="border-l-4 border-l-blue-500">
                  <CardContent className="p-6">
                    {/* URL Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg truncate mb-1">{url.originalUrl}</h3>
                        <div className="flex items-center gap-2 mb-2">
                          <code className="bg-gray-100 px-3 py-1 rounded text-sm font-mono">{url.shortUrl}</code>
                          <Badge variant={isExpired(url.expiresAt) ? "destructive" : "secondary"}>
                            {isExpired(url.expiresAt) ? "Expired" : "Active"}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button size="sm" variant="outline" onClick={() => onCopy(url.shortUrl)}>
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onRedirect(url)}
                          disabled={isExpired(url.expiresAt)}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* URL Details */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <div>
                          <div className="text-sm font-medium">Created</div>
                          <div className="text-sm text-gray-500">
                            {url.createdAt.toLocaleDateString()} {url.createdAt.toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <div>
                          <div className="text-sm font-medium">Expires</div>
                          <div className="text-sm text-gray-500">
                            {url.expiresAt.toLocaleDateString()} {url.expiresAt.toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Monitor className="h-4 w-4 text-gray-400" />
                        <div>
                          <div className="text-sm font-medium">Total Clicks</div>
                          <div className="text-lg font-bold text-blue-600">{url.clicks}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-4 bg-gray-400 rounded" />
                        <div>
                          <div className="text-sm font-medium">Short Code</div>
                          <div className="text-sm font-mono text-gray-600">{url.shortcode}</div>
                        </div>
                      </div>
                    </div>

                    {/* Click Data */}
                    {url.clickData && url.clickData.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-3 flex items-center gap-2">
                          <BarChart3 className="h-4 w-4" />
                          Detailed Click Data ({url.clickData.length} clicks)
                        </h4>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <div className="space-y-3 max-h-64 overflow-y-auto">
                            {url.clickData
                              .slice()
                              .reverse()
                              .map((click, index) => (
                                <div key={index} className="bg-white rounded p-3 border">
                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                                    <div className="flex items-center gap-2">
                                      <Clock className="h-4 w-4 text-blue-500" />
                                      <div>
                                        <div className="font-medium">Timestamp</div>
                                        <div className="text-gray-600">
                                          {new Date(click.timestamp).toLocaleDateString()}{" "}
                                          {new Date(click.timestamp).toLocaleTimeString()}
                                        </div>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <ExternalLink className="h-4 w-4 text-green-500" />
                                      <div>
                                        <div className="font-medium">Source</div>
                                        <div className="text-gray-600 truncate">
                                          {click.source === "direct" ? "Direct Access" : click.source}
                                        </div>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <MapPin className="h-4 w-4 text-red-500" />
                                      <div>
                                        <div className="font-medium">Location</div>
                                        <div className="text-gray-600">{click.location}</div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* No clicks message */}
                    {(!url.clickData || url.clickData.length === 0) && (
                      <div className="bg-gray-50 rounded-lg p-6 text-center">
                        <Monitor className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-500">No clicks recorded yet</p>
                        <p className="text-sm text-gray-400">Share this link to start tracking clicks</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
