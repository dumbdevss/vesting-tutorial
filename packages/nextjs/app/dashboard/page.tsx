"use client"

import { useState } from "react"
import { useWallet } from "@aptos-labs/wallet-adapter-react"
import { Button } from "~~/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "~~/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~~/components/ui/tabs"
import { Input } from "~~/components/ui/input"
import { ArrowRight, Clock, CoinsIcon, Download, LineChart } from "lucide-react"
import { useView } from "~~/hooks/scaffold-move/useView"
import { ToastAction } from "~~/components/ui/toast"
import useSubmitTransaction from "~~/hooks/scaffold-move/useSubmitTransaction"
import { toast } from "~~/components/ui/use-toast"

// Simple classNames utility to avoid potential issues with cn
const classNames = (...classes: (string | boolean | undefined | null)[]) => {
  return classes.filter(Boolean).join(" ")
}

export default function UserDashboard() {
  const [claimAmounts, setClaimAmounts] = useState<{ [key: string]: string }>({});
  const currentTime = Date.now();

  const decimal = 1 * 10 ** 8;

  const { account } = useWallet()
  const { submitTransaction, transactionResponse, transactionInProcess } = useSubmitTransaction("vesting")
  const { data, error, isLoading } = useView({
    moduleName: "vesting",
    functionName: "get_streams_for_user",
    args: [account?.address as `0x${string}`],
  });


  const streams = data?.[0]?.vec?.[0] || []

  const claimStream = async (streamId: string, amount: number) => {
    try {
      await submitTransaction("claim", [streamId, amount])
      const response = transactionResponse as any
      if (response && response.transactionHash) {
        toast({
          title: "Claim Successful",
          description: `Claim of ${amount} tokens successful.`,
          action: (
            <a
              href={`https://explorer.movementnetwork.xyz/txn/${response?.transactionHash}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ToastAction altText="View transaction">View txn</ToastAction>
            </a>
          ),
        })
        return response.transactionHash
      } else {
        throw new Error("Transaction hash not available or transaction failed.")
      }
    } catch (error) {
      console.error("Error claiming stream:", error)
      toast({
        variant: "destructive",
        title: "Claim Failed",
        description: "Failed to claim tokens. Please try again.",
      })
      throw error
    }
  }

  // Calculate vesting progress and available amount
  const calculateProgress = (stream: any) => {
    console.log(currentTime)
    const elapsedTime = currentTime - (stream.start_time * 1000);
    if (elapsedTime < (stream.cliff * 1000)) {
      return 0;
    } else if (elapsedTime >= stream.duration) {
      return 100;
    } else {
      return (elapsedTime / stream.duration) * 100;
    }
  }

  const calculateAvailable = (stream: any) => {
    const progress = calculateProgress(stream) / 100
    const totalVested = Number.parseFloat(stream.total_amount) * progress
    const available = (totalVested - Number.parseFloat(stream.claimed_amount)) / decimal
    console.log("Available:", available) 
    return Math.max(0, available).toFixed(2)
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      timeZone: "Europe/London",
    });
  };


  const handleClaimAmountChange = (streamId: string, value: string) => {
    setClaimAmounts((prev) => ({
      ...prev,
      [streamId]: value,
    }))
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
              {streams.reduce((sum: number, stream: any) => sum + (Number.parseFloat(stream.total_amount) / decimal), 0)} MOVE
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-400">Across {streams.length} streams</p>
          </CardContent>
        </Card>

        <Card className="gradient-card">
          <CardHeader className="pb-2">
            <CardDescription>Available to Claim</CardDescription>
            <CardTitle className="text-2xl flex items-center">
              <ArrowRight className="mr-2 h-5 w-5 text-yellow-400" />
              {streams.reduce((sum: number, stream: any) => sum + Number.parseFloat(calculateAvailable(stream)), 0).toFixed(2)} MOVE
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
              {streams.reduce((sum: number, stream: any) => sum + Number.parseFloat(stream.claimed_amount), 0)} MOVE
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
          {isLoading ? (
            <Card className="gradient-card">
              <CardContent className="text-center py-8">
                <p className="text-gray-400">Loading streams...</p>
              </CardContent>
            </Card>
          ) : error ? (
            <Card className="gradient-card">
              <CardContent className="text-center py-8">
                <p className="text-red-400">Error loading streams: {error.message}</p>
              </CardContent>
            </Card>
          ) : streams.length === 0 ? (
            <Card className="gradient-card">
              <CardContent className="text-center py-8">
                <p className="text-gray-400">No active streams found.</p>
              </CardContent>
            </Card>
          ) : (
            streams.map((stream: any) => (
              <Card key={stream.stream_id} className="overflow-hidden gradient-card">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl">MOVE Token Stream</CardTitle>
                      <CardDescription className="flex items-center mt-1">
                        <Clock className="mr-1 h-4 w-4" />
                        Started {formatDate(stream.start_time)}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        placeholder="Amount"
                        value={claimAmounts[stream.stream_id] || ""}
                        onChange={(e) => handleClaimAmountChange(stream.stream_id, e.target.value)}
                        className="w-24 bg-black/20 border-yellow-500/30 focus:border-yellow-500/50 focus:ring-yellow-500/20"
                      />
                      <Button
                        onClick={() => {
                          const amount = Number(claimAmounts[stream.stream_id])
                          if (amount > 0 && amount <= Number(calculateAvailable(stream))) {
                            claimStream(stream.stream_id, amount)
                          } else {
                            toast({
                              variant: "destructive",
                              title: "Invalid Amount",
                              description: "Please enter a valid amount within the available balance.",
                            })
                          }
                        }}
                        disabled={transactionInProcess || !claimAmounts[stream.stream_id] || Number(claimAmounts[stream.stream_id]) <= 0}
                        className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-black font-medium"
                      >
                        Claim
                      </Button>
                    </div>
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
                          {(parseInt(stream.total_amount) / decimal).toFixed(2)} MOVE
                        </p>
                      </div>
                      <div className="bg-black/40 p-3 rounded-lg">
                        <p className="text-gray-400 mb-1">Available</p>
                        <p className="font-semibold text-yellow-400">
                          {(parseFloat(calculateAvailable(stream)) / decimal).toFixed(2)} MOVE
                        </p>
                      </div>
                      <div className="bg-black/40 p-3 rounded-lg">
                        <p className="text-gray-400 mb-1">Claimed</p>
                        <p className="font-semibold">
                        {(parseFloat(stream.claimed_amount) / decimal).toFixed(2)} MOVE
                        </p>
                      </div>
                      <div className="bg-black/40 p-3 rounded-lg">
                        <p className="text-gray-400 mb-1">End Date</p>
                        <p className="font-semibold">{formatDate(parseInt(stream.start_time) + parseInt(stream.duration))}</p>
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
                  {stream.cliff > 0 && <div>Cliff: {formatDate(parseInt(stream.start_time) + parseInt(stream.cliff))}</div>}
                  <div>Stream ID: {stream.stream_id}</div>
                </CardFooter>
              </Card>
            ))
          )}
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