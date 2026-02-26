import { createAppKit } from '@reown/appkit/react'
import { WagmiProvider } from 'wagmi'
import { mainnet, arbitrum } from '@reown/appkit/networks'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'

// 0. Setup queryClient
const queryClient = new QueryClient()

// 1. Get projectId from https://dashboard.reown.com
// NOTE: Replace with your actual Reown projectId from https://dashboard.reown.com
const projectId = 'b56e18d47c72ab683b10814fe9495694'

// 2. Create metadata
const metadata = {
    name: 'StellarSpark',
    description: 'StellarSpark - Crowdfunding on Stellar',
    url: 'https://stellarspark.io',
    icons: ['https://avatars.githubusercontent.com/u/179229932']
}

// 3. Set the networks
const networks = [mainnet, arbitrum]

// 4. Create Wagmi Adapter
const wagmiAdapter = new WagmiAdapter({
    networks,
    projectId,
    ssr: false
})

// 5. Create modal
createAppKit({
    adapters: [wagmiAdapter],
    networks,
    projectId,
    metadata,
    features: {
        analytics: true
    },
    themeMode: 'dark',
    themeVariables: {
        '--w3m-accent': '#7c3aed',
        '--w3m-border-radius-master': '12px'
    }
})

export function AppKitProvider({ children }) {
    return (
        <WagmiProvider config={wagmiAdapter.wagmiConfig}>
            <QueryClientProvider client={queryClient}>
                {children}
            </QueryClientProvider>
        </WagmiProvider>
    )
}
