"use client"

import { useState } from "react"
import { useWallet } from "@aptos-labs/wallet-adapter-react"
import { Button } from "~~/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "~~/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~~/components/ui/tabs"
import { Input } from "~~/components/ui/input"
import { Label } from "~~/components/ui/label"
import { AlertCircle, Download, FileSpreadsheet, Plus, Search, Upload, Users, Clock } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~~/components/ui/table"
import { Alert, AlertDescription, AlertTitle } from "~~/components/ui/alert"
import * as XLSX from "xlsx"
import useSubmitTransaction from "~~/hooks/scaffold-move/useSubmitTransaction"
import { useView } from "~~/hooks/scaffold-move/useView"

// Utility function to parse time strings (e.g., "1d", "1min", "1mon", "1yr") to seconds
const parseTimeToSeconds = (timeStr: string): number => {
  const trimmed = timeStr.trim().toLowerCase()
  const match = trimmed.match(/^(\d+\.?\d*)\s*([a-z]+)$/)
  if (!match) {
    throw new Error(`Invalid time format: ${timeStr}. Use formats like 1d, 1min, 1mon, 1yr.`)
  }

  const value = parseFloat(match[1])
  const unit = match[2]

  const secondsInUnit: Record<string, number> = {
    s: 1,
    sec: 1,
    second: 1,
    seconds: 1,
    m: 60,
    min: 60,
    minute: 60,
    minutes: 60,
    h: 60 * 60,
    hr: 60 * 60,
    hour: 60 * 60,
    hours: 60 * 60,
    d: 24 * 60 * 60,
    day: 24 * 60 * 60,
    days: 24 * 60 * 60,
    w: 7 * 24 * 60 * 60,
    wk: 7 * 24 * 60 * 60,
    week: 7 * 24 * 60 * 60,
    weeks: 7 * 24 * 60 * 60,
    mon: 30 * 24 * 60 * 60, // Approximate: 30 days
    month: 30 * 24 * 60 * 60,
    months: 30 * 24 * 60 * 60,
    y: 365 * 24 * 60 * 60, // Approximate: 365 days
    yr: 365 * 24 * 60 * 60,
    year: 365 * 24 * 60 * 60,
    years: 365 * 24 * 60 * 60,
  }

  if (!secondsInUnit[unit]) {
    throw new Error(`Invalid time unit: ${unit}. Supported units: s, m, h, d, w, mon, y`)
  }

  return Math.round(value * secondsInUnit[unit])
}

export default function AdminDashboard() {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [recipients, setRecipients] = useState<`0x${string}`[]>([])
  const [amounts, setAmounts] = useState<number[]>([])
  const [durations, setDurations] = useState<string[]>([]) // Store as strings for input
  const [cliffs, setCliffs] = useState<string[]>([]) // Store as strings for input

  const {account} = useWallet();

  const { submitTransaction, transactionResponse, transactionInProcess } = useSubmitTransaction("vesting");

  const { data, error, isLoading, refetch } = useView({
    moduleName: "vesting",
    functionName: "get_tickets_by_user",
    args: account?.address ? [`${account.address}`] : [],
  }) as UseViewResponse<[Ticket[]]>;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return

    setIsUploading(true)
    setUploadError(null)

    const file = e.target.files[0]

    try {
      const reader = new FileReader()
      reader.onload = async (event) => {
        if (!event.target?.result) {
          throw new Error("Failed to read file")
        }

        // Parse the file
        const data = new Uint8Array(event.target.result as ArrayBuffer)
        const workbook = XLSX.read(data, { type: "array" })
        const sheetName = workbook.SheetNames[0]
        const sheet = workbook.Sheets[sheetName]
        const jsonData = XLSX.utils.sheet_to_json(sheet)

        // Expected columns: wallet_address, amount, duration, cliff
        const processedData = jsonData.map((row: any) => ({
          wallet_address: row.wallet_address || row.address || "",
          amount: Number(row.Amount) || 0,
          duration: String(row.duration || ""),
          cliff: String(row.cliff || ""),
        }))

        // Validate data
        const validData = processedData.filter((row) => {
          const isValidAddress = /^0x[a-fA-F0-9]{64}$/.test(row.wallet_address)
          const isValidAmount = row.amount > 0
          let isValidDuration = false
          let isValidCliff = false
          try {
            parseTimeToSeconds(row.duration)
            isValidDuration = true
          } catch {
            // Invalid duration format
          }
          try {
            parseTimeToSeconds(row.cliff)
            isValidCliff = true
          } catch {
            // Invalid cliff format
          }
          // Check if all validations passed
          return isValidAddress && isValidAmount && isValidDuration && isValidCliff
        })

        if (validData.length === 0) {
          throw new Error(
            "No valid data found in the file. Ensure columns include wallet_address, amount, duration, cliff (e.g., 1d, 1min, 1mon, 1yr)."
          )
        }

        // Create streams for each valid row
        let successCount = 0
        for (const row of validData) {
          try {
            await handleCreateStream(
              row.wallet_address as `0x${string}`,
              row.amount,
              parseTimeToSeconds(row.duration),
              parseTimeToSeconds(row.cliff)
            )
            successCount++
          } catch (error) {
            console.error(`Failed to create stream for ${row.wallet_address}:`, error)
          }
        }

        if (successCount > 0 && successCount === validData.length) {
          setIsUploading(false)
          setUploadSuccess(true)
          setTimeout(() => setUploadSuccess(false), 3000)
        }
      }

      reader.onerror = () => {
        setIsUploading(false)
        setUploadError("Error reading file")
      }

      reader.readAsArrayBuffer(file)
    } catch (error: any) {
      setIsUploading(false)
      setUploadError(error.message || "Failed to process file")
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target

    const strip0x = (address: string) => {
      return address.startsWith("0x") ? address.slice(2) : address
    }

    switch (name) {
      case "wallet-address":
        setRecipients([`0x${strip0x(value)}`])
        break
      case "amount":
        setAmounts([Number(value)])
        break
      case "duration":
        setDurations([value]) // Store as string
        break
      case "cliff":
        setCliffs([value]) // Store as string
        break
      default:
        break
    }
  }

  const handleCreateStream = async (
    recipient: `0x${string}`,
    amount: number,
    duration: number,
    cliff: number
  ) => {
    await submitTransaction("create_stream", [recipient, amount, duration, cliff])
  }

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
        </TabsList>

        <TabsContent value="create" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Bulk Upload */}
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
                      onChange={handleFileUpload}
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
                <span className="text-xs text-gray-400">Supported formats: .xlsx, .xls, .csv</span>
              </CardFooter>
            </Card>

            {/* Individual Stream */}
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
                      onChange={handleInputChange}
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
                        placeholder="0.00"
                        onChange={handleInputChange}
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
                        onChange={handleInputChange}
                        value={cliffs[0] || ""}
                        className="bg-black/20 border-yellow-500/30 focus:border-yellow-500/50 focus:ring-yellow-500/20"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="duration">Duration (e.g., 1d, 1min, 1mon, 1yr)</Label>
                      <Input
                        id="duration"
                        type="text"
                        onChange={handleInputChange}
                        value={durations[0] || ""}
                        placeholder="1yr"
                        className="bg-black/20 border-yellow-500/30 focus:border-yellow-500/50 focus:ring-yellow-500/20"
                      />
                    </div>
                  </div>
                </form>
              </CardContent>
              <CardFooter className="border-t border-yellow-500/20 bg-yellow-500/5 flex justify-end">
                <Button
                  onClick={() => {
                    if (recipients[0] && amounts[0] && durations[0] && cliffs[0]) {
                      handleCreateStream(
                        recipients[0] as `0x${string}`,
                        amounts[0],
                        parseTimeToSeconds(durations[0]),
                        parseTimeToSeconds(cliffs[0])
                      )
                    }
                  }}
                  className="bg-gradient-to-r from-yellow-500 to-yellow-600 mt-4 hover:from-yellow-400 hover:to-yellow-500 text-black font-medium"
                  disabled={transactionInProcess}
                >
                  Create Stream
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>

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
                    <TableRow className="hover:bg-yellow-500/5 border-yellow-500/20">
                      <TableCell className="font-medium">#3210</TableCell>
                      <TableCell className="font-mono text-xs">0x1a2b...3c4d</TableCell>
                      <TableCell>VKT</TableCell>
                      <TableCell>100,000</TableCell>
                      <TableCell>Jan 1, 2023</TableCell>
                      <TableCell>30 days</TableCell>
                      <TableCell>365 days</TableCell>
                      <TableCell>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400">
                          Active
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-yellow-400">
                          <span className="sr-only">Edit</span>
                          <Clock className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                    <TableRow className="hover:bg-yellow-500/5 border-yellow-500/20">
                      <TableCell className="font-medium">#3209</TableCell>
                      <TableCell className="font-mono text-xs">0x5e6f...7g8h</TableCell>
                      <TableCell>ETH</TableCell>
                      <TableCell>50</TableCell>
                      <TableCell>Feb 15, 2023</TableCell>
                      <TableCell>90 days</TableCell>
                      <TableCell>180 days</TableCell>
                      <TableCell>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400">
                          Active
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-yellow-400">
                          <span className="sr-only">Edit</span>
                          <Clock className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                    <TableRow className="hover:bg-yellow-500/5 border-yellow-500/20">
                      <TableCell className="font-medium">#3208</TableCell>
                      <TableCell className="font-mono text-xs">0x9i0j...1k2l</TableCell>
                      <TableCell>USDC</TableCell>
                      <TableCell>75,000</TableCell>
                      <TableCell>Nov 1, 2022</TableCell>
                      <TableCell>0 days</TableCell>
                      <TableCell>730 days</TableCell>
                      <TableCell>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400">
                          Active
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-yellow-400">
                          <span className="sr-only">Edit</span>
                          <Clock className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
            <CardFooter className="border-t border-yellow-500/20 bg-yellow-500/5 flex justify-between text-xs text-gray-400">
              <div>Showing 3 of 24 streams</div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="h-8 w-8 p-0 border-yellow-500/30 text-yellow-400">
                  1
                </Button>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-gray-400">
                  2
                </Button>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-gray-400">
                  3
                </Button>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}