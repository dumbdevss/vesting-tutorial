"use client"

import { useState } from "react"
import { Button } from "~~/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "~~/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~~/components/ui/tabs"
import { ArrowRight, Clock, CoinsIcon, Download, LineChart } from "lucide-react"

// Simple classNames utility to avoid potential issues with cn
const classNames = (...classes: (string | boolean | undefined | null)[]) => {
  return classes.filter(Boolean).join(" ")
}

// Mock data for demonstration
const mockStreams = [
  {
    id: "stream-1",
    token: "VKT",
    total_amount: "100000",
    start_time: new Date("2023-01-01").getTime(),
    cliff: 2592000000, // 30 days in milliseconds
    duration: 31536000000, // 365 days in milliseconds
    claimed_amount: "25000",
    status: "active",
  },
  {
    id: "stream-2",
    token: "ETH",
    total_amount: "50",
    start_time: new Date("2023-02-15").getTime(),
    cliff: 7776000000, // 90 days in milliseconds
    duration: 15768000000, // 6 months in milliseconds
    claimed_amount: "10",
    status: "active",
  },
  {
    id: "stream-3",
    token: "USDC",
    total_amount: "75000",
    start_time: new Date("2022-11-01").getTime(),
    cliff: 0, // No cliff
    duration: 63072000000, // 2 years in milliseconds
    claimed_amount: "18750",
    status: "active",
  },
]

export default function UserDashboard() {
  const [streams] = useState(mockStreams)
  const currentTime = Date.now()

  // Calculate vesting progress and available amount
  const calculateProgress = (stream: (typeof streams)[0]) => {
    const elapsedTime = currentTime - stream.start_time

    // If we're still in cliff period
    if (elapsedTime < stream.cliff) {
      return 0
    }

    // Calculate progress based on elapsed time after cliff
    const timeAfterCliff = elapsedTime - stream.cliff
    const vestingDuration = stream.duration - stream.cliff

    // Cap progress at 100%
    return Math.min(100, (timeAfterCliff / vestingDuration) * 100)
  }

  const calculateAvailable = (stream: (typeof streams)[0]) => {
    const progress = calculateProgress(stream) / 100
    const totalVested = Number.parseFloat(stream.total_amount) * progress
    const available = totalVested - Number.parseFloat(stream.claimed_amount)
    return Math.max(0, available).toFixed(2)
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <div className="container max-w-6xl mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">User Dashboard</h1>
          <p className="text-gray-400 mt-1">Manage your token vesting streams</p>
        </div>
        <Button
          variant="outline"
          className="border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/10 hover:text-yellow-300"
        >
          <Download className="mr-2 h-4 w-4" />
          Export Data
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="gradient-card">
          <CardHeader className="pb-2">
            <CardDescription>Total Vesting</CardDescription>
            <CardTitle className="text-2xl flex items-center">
              <CoinsIcon className="mr-2 h-5 w-5 text-yellow-400" />
              175,050 Tokens
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-400">Across 3 streams</p>
          </CardContent>
        </Card>

        <Card className="gradient-card">
          <CardHeader className="pb-2">
            <CardDescription>Available to Claim</CardDescription>
            <CardTitle className="text-2xl flex items-center">
              <ArrowRight className="mr-2 h-5 w-5 text-yellow-400" />
              43,750 Tokens
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-400">Ready for withdrawal</p>
          </CardContent>
        </Card>

        <Card className="gradient-card">
          <CardHeader className="pb-2">
            <CardDescription>Claimed Amount</CardDescription>
            <CardTitle className="text-2xl flex items-center">
              <LineChart className="mr-2 h-5 w-5 text-yellow-400" />
              53,760 Tokens
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-400">Total claimed to date</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="active" className="w-full">
        <TabsList className="mb-6 bg-black/40 border border-yellow-500/20">
          <TabsTrigger
            value="active"
            className="data-[state=active]:bg-yellow-500/20 data-[state=active]:text-yellow-400"
          >
            Active Streams
          </TabsTrigger>
          <TabsTrigger
            value="completed"
            className="data-[state=active]:bg-yellow-500/20 data-[state=active]:text-yellow-400"
          >
            Completed
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-6">
          {streams.map((stream) => (
            <Card key={stream.id} className="overflow-hidden gradient-card">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">{stream.token} Token Stream</CardTitle>
                    <CardDescription className="flex items-center mt-1">
                      <Clock className="mr-1 h-4 w-4" />
                      Started {formatDate(stream.start_time)}
                    </CardDescription>
                  </div>
                  <Button className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-black font-medium">
                    Claim
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pb-3">
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1 text-sm">
                      <span className="text-gray-400">Vesting Progress</span>
                      <span className="font-medium text-yellow-400">{calculateProgress(stream).toFixed(1)}%</span>
                    </div>
                    <div className="h-2 rounded-full progress-bar-bg overflow-hidden">
                      <div
                        className="h-full progress-bar-fill rounded-full"
                        style={{ width: `${calculateProgress(stream)}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="bg-black/40 p-3 rounded-lg">
                      <p className="text-gray-400 mb-1">Total Amount</p>
                      <p className="font-semibold">
                        {stream.total_amount} {stream.token}
                      </p>
                    </div>
                    <div className="bg-black/40 p-3 rounded-lg">
                      <p className="text-gray-400 mb-1">Available</p>
                      <p className="font-semibold text-yellow-400">
                        {calculateAvailable(stream)} {stream.token}
                      </p>
                    </div>
                    <div className="bg-black/40 p-3 rounded-lg">
                      <p className="text-gray-400 mb-1">Claimed</p>
                      <p className="font-semibold">
                        {stream.claimed_amount} {stream.token}
                      </p>
                    </div>
                    <div className="bg-black/40 p-3 rounded-lg">
                      <p className="text-gray-400 mb-1">End Date</p>
                      <p className="font-semibold">{formatDate(stream.start_time + stream.duration)}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter
                className={classNames(
                  "text-xs border-t border-yellow-500/20 bg-yellow-500/5 text-gray-400",
                  stream.cliff > 0 ? "justify-between" : "justify-end",
                )}
              >
                {stream.cliff > 0 && <div>Cliff: {formatDate(stream.start_time + stream.cliff)}</div>}
                <div>Stream ID: {stream.id}</div>
              </CardFooter>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="completed">
          <Card className="gradient-card">
            <CardHeader>
              <CardTitle className="text-center text-gray-400">No completed streams</CardTitle>
            </CardHeader>
            <CardContent className="text-center py-8">
              <p className="text-gray-500">
                Completed streams will appear here once they are fully vested and claimed.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

