import { io } from 'socket.io-client'

class WebSocketService {
    private socket: any | null = null
    private readonly url: string

    constructor() {
        this.url = 'http://localhost:3001'
    }

    connect(token?: string): void {
        if (this.socket?.connected) return

        this.socket = io(this.url, {
            auth: {
                token: token || localStorage.getItem('token')
            },
            transports: ['websocket'],
            upgrade: true
        })

        this.setupEventListeners()
    }

    disconnect(): void {
        if (this.socket) {
            this.socket.disconnect()
            this.socket = null
        }
    }

    private setupEventListeners(): void {
        if (!this.socket) return

        this.socket.on('connect', () => {
            console.log('WebSocket connected:', this.socket?.id)
        })

        this.socket.on('disconnect', (reason) => {
            console.log('WebSocket disconnected:', reason)
        })

        this.socket.on('error', (error) => {
            console.error('WebSocket error:', error)
        })
    }

    // Organization real-time updates
    onOrganizationUpdate(callback: (data: any) => void): void {
        this.socket?.on('organization:updated', callback)
    }

    onOrganizationCreate(callback: (data: any) => void): void {
        this.socket?.on('organization:created', callback)
    }

    onOrganizationDelete(callback: (data: any) => void): void {
        this.socket?.on('organization:deleted', callback)
    }

    // Review real-time updates
    onReviewUpdate(callback: (data: any) => void): void {
        this.socket?.on('review:updated', callback)
    }

    onReviewCreate(callback: (data: any) => void): void {
        this.socket?.on('review:created', callback)
    }

    // Roadshow real-time updates
    onRoadshowUpdate(callback: (data: any) => void): void {
        this.socket?.on('roadshow:updated', callback)
    }

    onRoadshowCreate(callback: (data: any) => void): void {
        this.socket?.on('roadshow:created', callback)
    }

    // MOU real-time updates
    onMouUpdate(callback: (data: any) => void): void {
        this.socket?.on('mou:updated', callback)
    }

    onMouCreate(callback: (data: any) => void): void {
        this.socket?.on('mou:created', callback)
    }

    // Generic event emitter
    emit(event: string, data: any): void {
        this.socket?.emit(event, data)
    }

    // Generic event listener
    on(event: string, callback: (data: any) => void): void {
        this.socket?.on(event, callback)
    }

    // Remove event listener
    off(event: string, callback?: (data: any) => void): void {
        if (callback) {
            this.socket?.off(event, callback)
        } else {
            this.socket?.off(event)
        }
    }

    // Check connection status
    get isConnected(): boolean {
        return this.socket?.connected || false
    }

    get socketId(): string | undefined {
        return this.socket?.id
    }
}

// Export singleton instance
export default new WebSocketService()