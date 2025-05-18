"use client"

import { useEffect, useState } from "react"
import { useWallet } from "@aptos-labs/wallet-adapter-react"
import { Button } from "~~/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "~~/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~~/components/ui/tabs"
import { Input } from "~~/components/ui/input"
import { Label } from "~~/components/ui/label"
import { AlertCircle, Download, FileSpreadsheet, Plus, Search, Upload, Users, Clock } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~~/components/ui/table"
import { ToastAction } from "~~/components/ui/toast"
import { Alert, AlertDescription, AlertTitle } from "~~/components/ui/alert"
import * as XLSX from "xlsx"
import { nanoid } from "nanoid"
import { secondsInUnit } from "~~/utils/utils"
import useSubmitTransaction from "~~/hooks/scaffold-move/useSubmitTransaction"
import { useToast } from "~~/hooks/use-toast"

// Utility function to parse time strings (e.g., "1d", "1min", "1mon", "1yr") to seconds
const parseTimeToSeconds = (timeStr: string): number => {
  const trimmed = timeStr.trim().toLowerCase()
  const match = trimmed.match(/^(\d+\.?\d*)\s*([a-z]+)$/)
  if (!match) {
    throw new Error(`Invalid time format: ${timeStr}. Use formats like 1d, 1min, 1mon, 1yr.`)
  }

  const value = parseFloat(match[1])
  const unit = match[2]

  if (!secondsInUnit[unit]) {
    throw new Error(`Invalid time unit: ${unit}. Supported units: s, m, h, d, w, mon, y`)
  }

  return Math.round(value * secondsInUnit[unit])
}

// Utility function to format seconds to a human-readable string
const formatSeconds = (seconds: number): string => {
  if (seconds < 60) return `${seconds} seconds`
  if (seconds < 3600) return `${Math.round(seconds / 60)} minutes`
  if (seconds < 86400) return `${Math.round(seconds / 3600)} hours`
  if (seconds < 604800) return `${Math.round(seconds / 86400)} days`
  if (seconds < 2592000) return `${Math.round(seconds / 604800)} weeks`
  if (seconds < 31536000) return `${Math.round(seconds / 2592000)} months`
  return `${Math.round(seconds / 31536000)} years`
}

// Utility function to format timestamp to readable date
const formatTimestamp = (timestamp: number): string => {
  return new Date(timestamp * 1000).toLocaleDateString()
}

export default function AdminDashboard() {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [recipients, setRecipients] = useState<`0x${string}`[]>([])
  const [amounts, setAmounts] = useState<number[]>([])
  const [durations, setDurations] = useState<string[]>([])
  const [cliffs, setCliffs] = useState<string[]>([])
  const [depositAmount, setDepositAmount] = useState<number>(0)
  const { toast } = useToast()

  const decimal = 1 * 10 ** 8

  const { account } = useWallet()
  const { submitTransaction, transactionResponse, transactionInProcess } = useSubmitTransaction("vesting")

  // TODO 1: Implement useView hook for fetching all streams
  const { data, error, isLoading } = {
    data: [[]],
    error: null,
    isLoading: false
  }

  // TODO 2: Implement authorization check
  const isAuthorized = false // Replace with actual check against module address

  useEffect(() => {
    if (isAuthorized) {
      // Your code here that should run when transactionResponse changes
    }
  }, [transactionResponse, isAuthorized])

  // TODO 3: Implement handleFileUpload function
  /*
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    // 1. Check if a file is selected
    // 2. Set isUploading to true and clear uploadError
    // 3. Read and parse XLS file using XLSX
    // 4. Validate data (wallet_address, amount, duration, cliff)
    // 5. Extract valid data into recipients, amounts, durations, and cliffs
    // 6. Update state with extracted data
    // 7. Set isUploading to false and uploadSuccess to true
    // 8. Handle errors and set uploadError
  }
  */

  // TODO 4: Implement handleInputChange function
  /*
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    // 1. Get name and value from event target
    // 2. Update appropriate state array (recipients, amounts, durations, cliffs) based on input name
    // 3. Update depositAmount for deposit-amount input
  }
  */

  // TODO 5: Implement handleCreateStream function
  /*
  const handleCreateStream = async (recipient: `0x${string}`, amount: number, duration: number, cliff: number) => {
    // 1. Generate a unique streamId using nanoid
    // 2. Submit transaction to create a single stream
    // 3. Show success toast with transaction link if successful
    // 4. Clear input states on success
    // 5. Show error toast if transaction fails
  }
  */

  // TODO 6: Implement handleCreateMultipleStreams function
  /*
  const handleCreateMultipleStreams = async (recipients: `0x${string}`[], amounts: number[], durations: number[], cliffs: number[]) => {
    // 1. Validate that all input arrays have the same length
    // 2. Generate unique streamIds for each stream
    // 3. Format amounts with decimal multiplier
    // 4. Submit transaction to create multiple streams
    // 5. Show success toast with transaction link if successful
    // 6. Show error toast if transaction fails
  }
  */

  // TODO 7: Implement handleDeposit function
  /*
  const handleDeposit = async (amount: number) => {
    // 1. Submit transaction to deposit tokens with formatted amount
    // 2. Show success toast with transaction link if successful
    // 3. Show error toast if transaction fails
    // 4. Return null on failure
  }
  */

  return (
    <div className="container max-w-6xl mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-gray-400 mt-1">Manage token vesting streams for users</p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/10 hover:text-yellow-300"
          >
            <Download className="mr-2 h-4 w-4" />
            Export All Data
          </Button>
          <Button className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-black font-medium">
            <Plus className="mr-2 h-4 w-4" />
            New Stream
          </Button>
        </div>
      </div>

      <Tabs defaultValue="create" className="w-full">
        <TabsList className="mb-6 bg-black/40 border border-yellow-500/20">
          <TabsTrigger
            value="create"
            className="data-[state=active]:bg-yellow-500/20 data-[state=active]:text-yellow-400"
          >
            Create Streams
          </TabsTrigger>
          <TabsTrigger
            value="manage"
            className="data-[state=active]:bg-yellow-500/20 data-[state=active]:text-yellow-400"
          >
            Manage Streams
          </TabsTrigger>
          <TabsTrigger
            value="deposit"
            className="data-[state=active]:bg-yellow-500/20 data-[state=active]:text-yellow-400"
          >
            Deposit
          </TabsTrigger>
        </TabsList>

        {!isAuthorized ? (
          <Alert className="bg-red-500/20 border-red-500/50 text-red-300">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Unauthorized</AlertTitle>
            <AlertDescription>
              You are not authorized to view this page. Only the contract owner can access this section.
            </AlertDescription>
          </Alert>
        ) : (
          <>
            <TabsContent value="create" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="gradient-card">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <FileSpreadsheet className="mr-2 h-5 w-5 text-yellow-400" />
                      Bulk Upload
                    </CardTitle>
                    <CardDescription>Upload an XLS file with multiple vesting streams</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="border-2 border-dashed border-yellow-500/30 rounded-lg p-8 text-center bg-black/20">
                      <FileSpreadsheet className="h-10 w-10 mx-auto mb-4 text-yellow-400/70" />
                      <h3 className="text-lg font-medium mb-2">Upload XLS File</h3>
                      <p className="text-sm text-gray-400 mb-4">
                        File should contain columns for wallet_address, amount, duration (e.g., 1d, 1min, 1mon, 1yr), and cliff
                      </p>
                      <div className="relative">
                        <Input
                          id="file-upload"
                          type="file"
                          accept=".xls,.xlsx,.csv"
                          className="absolute inset-0 opacity-0 cursor-pointer"
                          onChange={() => {}} // TODO 8: Connect to handleFileUpload
                        />
                        <Button
                          variant="outline"
                          className="w-full border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/10 hover:text-yellow-300"
                          disabled={isUploading}
                        >
                          {isUploading ? (
                            <>Processing...</>
                          ) : (
                            <>
                              <Upload className="mr-2 h-4 w-4" />
                              Select File
                            </>
                          )}
                        </Button>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">Maximum file size: 5MB</p>
                    </div>

                    {uploadSuccess && (
                      <Alert className="mt-4 bg-green-500/20 border-green-500/50 text-green-300">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Success</AlertTitle>
                        <AlertDescription>File uploaded successfully. Streams created.</AlertDescription>
                      </Alert>
                    )}
                    {uploadError && (
                      <Alert className="mt-4 bg-red-500/20 border-red-500/50 text-red-300">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{uploadError}</AlertDescription>
                      </Alert>
                    )}
                  </CardContent>
                  <CardFooter className="border-t border-yellow-500/20 bg-yellow-500/5 flex justify-between">
                    <div></div>
                    <Button
                      onClick={() => {}} // TODO 9: Connect to handleCreateMultipleStreams
                      className="bg-gradient-to-r from-yellow-500 to-yellow-600 mt-4 hover:from-yellow-400 hover:to-yellow-500 text-black font-medium"
                      disabled={transactionInProcess}
                    >
                      Create Stream
                    </Button>
                  </CardFooter>
                </Card>

                <Card className="gradient-card">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Users className="mr-2 h-5 w-5 text-yellow-400" />
                      Create Individual Stream
                    </CardTitle>
                    <CardDescription>Set up a vesting stream for a single user</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="wallet-address">Wallet Address</Label>
                        <Input
                          id="wallet-address"
                          placeholder="0x..."
                          onChange={() => {}} // TODO 10: Connect to handleInputChange
                          name="wallet-address"
                          type="text"
                          value={recipients[0] || ""}
                          className="bg-black/20 border-yellow-500/30 focus:border-yellow-500/50 focus:ring-yellow-500/20"
                        />
                      </div>

                      <div className="w-full gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="amount">Amount</Label>
                          <Input
                            id="amount"
                            type="number"
                            name="amount"
                            placeholder="0.00"
                            onChange={() => {}} // TODO 11: Connect to handleInputChange
                            value={amounts[0] || ""}
                            className="bg-black/20 border-yellow-500/30 focus:border-yellow-500/50 focus:ring-yellow-500/20"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="cliff">Cliff (e.g., 1d, 1min, 1mon, 1yr)</Label>
                          <Input
                            id="cliff"
                            type="text"
                            placeholder="30d"
                            name="cliff"
                            onChange={() => {}} // TODO 12: Connect to handleInputChange
                            value={cliffs[0] || ""}
                            className="bg-black/20 border-yellow-500/30 focus:border-yellow-500/50 focus:ring-yellow-500/20"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="duration">Cliff (e.g., 1d, 1min, 1mon, 1yr)</Label>
                          <Input
                            id="duration"
                            type="text"
                            onChange={() => {}} // TODO 13: Connect to handleInputChange
                            value={durations[0] || ""}
                            name="duration"
                            placeholder="1yr"
                            className="bg-black/20 border-yellow-500/30 focus:border-yellow-500/50 focus:ring-yellow-500/20"
                          />
                        </div>
                      </div>
                    </form>
                  </CardContent>
                  <CardFooter className="border-t border-yellow-500/20 bg-yellow-500/5 flex justify-end">
                    <Button
                      onClick={() => {}} // TODO 14: Connect to handleCreateStream
                      className="bg-gradient-to-r from-yellow-500 to-yellow-600 mt-4 hover:from-yellow-400 hover:to-yellow-500 text-black font-medium"
                      disabled={transactionInProcess}
                    >
                      Create Stream
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="deposit" className="space-y-6">
              <Card className="gradient-card">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="mr-2 h-5 w-5 text-yellow-400" />
                    Deposit to Contract
                  </CardTitle>
                  <CardDescription>Deposit tokens into the vesting contract</CardDescription>
                </CardHeader>
                <CardContent>
                  <form className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="deposit-amount">Amount</Label>
                      <Input
                        id="deposit-amount"
                        type="number"
                        name="deposit-amount"
                        placeholder="0.00"
                        onChange={() => {}} // TODO 15: Connect to handleInputChange
                        value={depositAmount || ""}
                        className="bg-black/20 border-yellow-500/30 focus:border-yellow-500/50 focus:ring-yellow-500/20"
                      />
                    </div>
                  </form>
                </CardContent>
                <CardFooter className="border-t border-yellow-500/20 bg-yellow-500/5 flex justify-end">
                  <Button
                    onClick={() => {}} // TODO 16: Connect to handleDeposit
                    className="bg-gradient-to-r from-yellow-500 to-yellow-600 mt-4 hover:from-yellow-400 hover:to-yellow-500 text-black font-medium"
                    disabled={transactionInProcess || depositAmount <= 0}
                  >
                    Deposit
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </>
        )}

        <TabsContent value="manage">
          <Card className="gradient-card">
            <CardHeader className="pb-3">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <CardTitle>All Vesting Streams</CardTitle>
                <div className="relative w-full md:w-64">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                  <Input
                    type="search"
                    placeholder="Search by address or ID..."
                    className="pl-8 bg-black/20 border-yellow-500/30 focus:border-yellow-500/50 focus:ring-yellow-500/20"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {!isAuthorized ? (
                <Alert className="bg-red-500/20 border-red-500/50 text-red-300">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Unauthorized</AlertTitle>
                  <AlertDescription>
                    You are not authorized to view this page. Only the contract owner can access this section.
                  </AlertDescription>
                </Alert>
              ) : isLoading ? (
                <div className="text-center text-gray-400">Loading streams...</div>
              ) : error ? (
                <Alert className="bg-red-500/20 border-red-500/50 text-red-300">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>Failed to load streams: {error.message}</AlertDescription>
                </Alert>
              ) : !data || data?.[0]?.length === 0 ? (
                <div className="text-center text-gray-400">No streams found.</div>
              ) : (
                <div className="rounded-md border border-yellow-500/20 overflow-hidden">
                  <Table>
                    <TableHeader className="bg-yellow-500/10">
                      <TableRow className="hover:bg-yellow-500/5 border-yellow-500/20">
                        <TableHead className="text-yellow-400">ID</TableHead>
                        <TableHead className="text-yellow-400">Recipient</TableHead>
                        <TableHead className="text-yellow-400">Token</TableHead>
                        <TableHead className="text-yellow-400">Amount</TableHead>
                        <TableHead className="text-yellow-400">Start Date</TableHead>
                        <TableHead className="text-yellow-400">Cliff</TableHead>
                        <TableHead className="text-yellow-400">Duration</TableHead>
                        <TableHead className="text-yellow-400">Status</TableHead>
                        <TableHead className="text-yellow-400 text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data?.[0]?.map((stream: any, index: number) => {
                        const isActive = stream.claimed_amount < stream.total_amount
                        return (
                          <TableRow key={index} className="hover:bg-yellow-500/5 border-yellow-500/20">
                            <TableCell className="font-medium">{stream.stream_id}</TableCell>
                            <TableCell className="font-mono text-xs">
                              {stream.beneficiary.slice(0, 6)}...{stream.beneficiary.slice(-4)}
                            </TableCell>
                            <TableCell>VKT</TableCell>
                            <TableCell>{stream.total_amount}</TableCell>
                            <TableCell>{formatTimestamp(stream.start_time)}</TableCell>
                            <TableCell>{formatSeconds(stream.cliff)}</TableCell>
                            <TableCell>{formatSeconds(stream.duration)}</TableCell>
                            <TableCell>
                              <span
                                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${isActive
                                  ? "bg-green-500/20 text-green-400"
                                  : "bg-gray-500/20 text-gray-400"
                                  }`}
                              >
                                {isActive ? "Active" : "Completed"}
                              </span>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-yellow-400"
                              >
                                <span className="sr-only">Edit</span>
                                <Clock className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
            <CardFooter className="border-t border-yellow-500/20 bg-yellow-500/5 flex justify-between text-xs text-gray-400">
              <div>Showing {data?.[0]?.length || 0} of {data?.[0]?.length || 0} streams</div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 p-0 border-yellow-500/30 text-yellow-400"
                >
                  1
                </Button>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}