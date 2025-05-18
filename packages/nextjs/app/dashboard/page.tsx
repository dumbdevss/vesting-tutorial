"use client"

import { useState } from "react"
import { useWallet } from "@aptos-labs/wallet-adapter-react"
import { Button } from "~~/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "~~/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~~/components/ui/tabs"
import { Input } from "~~/components/ui/input"
import { ArrowRight, Clock, CoinsIcon, Download, LineChart } from "lucide-react"
import { ToastAction } from "~~/components/ui/toast"
import useSubmitTransaction from "~~/hooks/scaffold-move/useSubmitTransaction"
import { toast } from "~~/components/ui/use-toast"

// Simple classNames utility to avoid potential issues with cn
const classNames = (...classes: (string | boolean | undefined | null)[]) => {
  return classes.filter(Boolean).join(" ")
}

export default function UserDashboard() {
  const [claimAmounts, setClaimAmounts] = useState<{ [key: string]: string }>({})
  const currentTime = Date.now()

  const decimal = 1 * 10 ** 8

  const { account } = useWallet()
  const { submitTransaction, transactionResponse, transactionInProcess } = useSubmitTransaction("vesting")

  // TODO 17: Implement useView hook for fetching user streams
  const { data, error, isLoading } = {
    data: [[]],
    error: null,
    isLoading: false
  }

  const streams = data?.[0]?.vec?.[0] || []

  // TODO 18: Implement claimStream function
  /*
  const claimStream = async (streamId: string, amount: number) => {
    // 1. Submit transaction to claim tokens from the specified stream
    // 2. Show success toast with transaction link if successful
    // 3. Show error toast if transaction fails
    // 4. Return transaction hash or throw error
  }
  */

  // TODO 19: Implement calculateProgress function
  /*
  const calculateProgress = (stream: any) => {
    // 1. Calculate elapsed time since stream start
    // 2. Return 0 if before cliff
    // 3. Return 100 if duration is complete
    // 4. Otherwise, return percentage of duration completed
  }
  */

  // TODO 20: Implement calculateAvailable function
  /*
  const calculateAvailable = (stream: any) => {
    // 1. Calculate progress using calculateProgress
    // 2. Compute total vested amount based on progress
    // 3. Subtract claimed amount and format with decimal
    // 4. Return available amount, ensuring non-negative
  }
  */

  // TODO 21: Implement formatDate function
  /*
  const formatDate = (timestamp: number) => {
    // 1. Convert timestamp to readable date string
    // 2. Use specified format (e.g., "Jan 1, 2023, 12:00 PM")
    // 3. Use Europe/London timezone
  }
  */

  // TODO 22: Implement handleClaimAmountChange function
  /*
  const handleClaimAmountChange = (streamId: string, value: string) => {
    // 1. Update claimAmounts state with new value for the specified streamId
  }
  */

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
              {streams.reduce((sum: number, stream: any) => sum + Number.parseFloat('0'), 0).toFixed(2)} MOVE
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
                        Started {'TBD'} {/* TODO 23: Use formatDate */}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        placeholder="Amount"
                        value={claimAmounts[stream.stream_id] || ""}
                        onChange={() => {}} // TODO 24: Connect to handleClaimAmountChange
                        className="w-24 bg-black/20 border-yellow-500/30 focus:border-yellow-500/50 focus:ring-yellow-500/20"
                      />
                      <Button
                        onClick={() => {}} // TODO 25: Connect to claimStream
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
                        <span className="font-medium text-yellow-400">{'0'}%</span> {/* TODO 26: Use calculateProgress */}
                      </div>
                      <div className="h-2 rounded-full progress-bar-bg overflow-hidden">
                        <div
                          className="h-full progress-bar-fill rounded-full"
                          style={{ width: `${0}%` }} {/* TODO 27: Use calculateProgress */}
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
                          {'0.00'} MOVE {/* TODO 28: Use calculateAvailable */}
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
                        <p className="font-semibold">{'TBD'}</p> {/* TODO 29: Use formatDate */}
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
                  {stream.cliff > 0 && <div>Cliff: {'TBD'}</div>} {/* TODO 30: Use formatDate */}
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