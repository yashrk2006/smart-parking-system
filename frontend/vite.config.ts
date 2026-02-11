import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { smartParkingServer } from './server/plugin'

export default defineConfig({
    plugins: [react(), smartParkingServer()],
    server: {
        port: 3000,
    }
})
