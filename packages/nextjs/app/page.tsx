import { Button } from "~~/components/ui/button"
import { ArrowRight, Crown } from "lucide-react"

export default function Home() {
  return (
    <main className="flex flex-col min-h-[calc(100vh-4rem)]">
      {/* Hero Section with Dashboard Preview */}
      <section className="relative py-16 md:py-24 px-4">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,215,0,0.15),transparent_70%)]"></div>
        <div className="container max-w-6xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center px-3 py-1 mb-6 rounded-full border border-yellow-500/30 bg-yellow-500/10 text-yellow-400 text-sm">
            <Crown className="w-4 h-4 mr-2" />
            <span>The Future of Token Vesting</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-yellow-200">
            Streamline Your Token Vesting with VestKing
          </h1>
          <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto mb-10">
            The most advanced platform for managing token vesting schedules, designed for projects and investors to
            simplify the vesting process.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button
              size="lg"
              className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-black font-medium"
            >
              Launch App
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/10 hover:text-yellow-300"
            >
              Learn More
            </Button>
          </div>

          {/* Dashboard Preview */}
          <div className="relative mt-8 rounded-xl overflow-hidden border border-yellow-500/20 shadow-lg shadow-yellow-500/10">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60 pointer-events-none z-10"></div>

            <div className="bg-black/40 p-6 rounded-t-xl border-b border-yellow-500/20">
              <h2 className="text-2xl font-bold text-left text-white">Dashboard Preview</h2>
            </div>

            <div className="bg-gradient-to-br from-black via-gray-900 to-gray-800 p-6">
              {/* Dashboard Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="gradient-card rounded-xl p-6">
                  <div className="text-sm text-gray-400 mb-1">Total Vesting</div>
                  <div className="text-2xl font-bold flex items-center">
                    <span className="text-yellow-400 mr-2">◆</span>
                    175,050 Tokens
                  </div>
                  <div className="text-sm text-gray-400 mt-2">Across 3 streams</div>
                </div>

                <div className="gradient-card rounded-xl p-6">
                  <div className="text-sm text-gray-400 mb-1">Available to Claim</div>
                  <div className="text-2xl font-bold flex items-center">
                    <span className="text-yellow-400 mr-2">→</span>
                    43,750 Tokens
                  </div>
                  <div className="text-sm text-gray-400 mt-2">Ready for withdrawal</div>
                </div>

                <div className="gradient-card rounded-xl p-6">
                  <div className="text-sm text-gray-400 mb-1">Claimed Amount</div>
                  <div className="text-2xl font-bold flex items-center">
                    <span className="text-yellow-400 mr-2">📈</span>
                    53,760 Tokens
                  </div>
                  <div className="text-sm text-gray-400 mt-2">Total claimed to date</div>
                </div>
              </div>

              {/* Stream Card */}
              <div className="gradient-card rounded-xl overflow-hidden">
                <div className="p-4 border-b border-yellow-500/20 flex justify-between items-center">
                  <div>
                    <div className="text-xl font-bold">VKT Token Stream</div>
                    <div className="text-sm text-gray-400 flex items-center mt-1">
                      <span className="mr-1">🕒</span>
                      Started Jan 1, 2023
                    </div>
                  </div>
                  <Button className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-black font-medium">
                    Claim
                  </Button>
                </div>
                <div className="p-4">
                  <div className="mb-4">
                    <div className="flex justify-between mb-1 text-sm">
                      <span className="text-gray-400">Vesting Progress</span>
                      <span className="font-medium text-yellow-400">45.2%</span>
                    </div>
                    <div className="h-2 rounded-full progress-bar-bg overflow-hidden">
                      <div className="h-full progress-bar-fill rounded-full" style={{ width: "45.2%" }}></div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="bg-black/40 p-3 rounded-lg">
                      <p className="text-gray-400 mb-1">Total Amount</p>
                      <p className="font-semibold">100,000 VKT</p>
                    </div>
                    <div className="bg-black/40 p-3 rounded-lg">
                      <p className="text-gray-400 mb-1">Available</p>
                      <p className="font-semibold text-yellow-400">20,200 VKT</p>
                    </div>
                    <div className="bg-black/40 p-3 rounded-lg">
                      <p className="text-gray-400 mb-1">Claimed</p>
                      <p className="font-semibold">25,000 VKT</p>
                    </div>
                    <div className="bg-black/40 p-3 rounded-lg">
                      <p className="text-gray-400 mb-1">End Date</p>
                      <p className="font-semibold">Jan 1, 2024</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

