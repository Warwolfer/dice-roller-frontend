import { ref, reactive, onUnmounted, watch } from 'vue'
import { API_BASE_URL } from '../constants'

export interface WebSocketMessage {
  type: string
  roomId?: string
  payload?: any
}

export type WebSocketEventCallback = (message: WebSocketMessage) => void

export interface WebSocketState {
  isConnected: boolean
  isConnecting: boolean
  error: string | null
  reconnectAttempts: number
  currentRoomId: string | null
}

const MAX_RECONNECT_ATTEMPTS = 5
const RECONNECT_DELAY_BASE = 1000 // 1 second base delay
const HEARTBEAT_INTERVAL = 30000 // 30 seconds

export function useWebSocket() {
  const ws = ref<WebSocket | null>(null)
  const state = reactive<WebSocketState>({
    isConnected: false,
    isConnecting: false,
    error: null,
    reconnectAttempts: 0,
    currentRoomId: null
  })
  
  const eventCallbacks = new Map<string, Set<WebSocketEventCallback>>()
  const heartbeatInterval = ref<number | null>(null)
  const reconnectTimeout = ref<number | null>(null)
  
  // Get WebSocket URL from API base URL
  const getWebSocketUrl = () => {
    const wsUrl = API_BASE_URL.replace('http://', 'ws://').replace('https://', 'wss://')
    return wsUrl.replace('/api', '') // Remove /api path for WebSocket connection
  }
  
  const connect = () => {
    if (state.isConnected || state.isConnecting) {
      return
    }
    
    state.isConnecting = true
    state.error = null
    
    try {
      const wsUrl = getWebSocketUrl()
      console.log('Connecting to WebSocket:', wsUrl)
      ws.value = new WebSocket(wsUrl)
      
      ws.value.onopen = () => {
        console.log('WebSocket connected')
        state.isConnected = true
        state.isConnecting = false
        state.error = null
        state.reconnectAttempts = 0
        
        // Start heartbeat
        startHeartbeat()
        
        // Rejoin current room if we were in one
        if (state.currentRoomId) {
          joinRoom(state.currentRoomId)
        }
      }
      
      ws.value.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data)
          handleMessage(message)
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error)
        }
      }
      
      ws.value.onclose = (event) => {
        console.log('WebSocket disconnected:', event.code, event.reason)
        state.isConnected = false
        state.isConnecting = false
        stopHeartbeat()
        
        // Attempt reconnection if not manually closed
        if (event.code !== 1000) {
          scheduleReconnect()
        }
      }
      
      ws.value.onerror = (error) => {
        console.error('WebSocket error:', error)
        state.error = 'Connection error'
        state.isConnecting = false
      }
      
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error)
      state.error = 'Failed to connect'
      state.isConnecting = false
    }
  }
  
  const disconnect = () => {
    if (reconnectTimeout.value) {
      clearTimeout(reconnectTimeout.value)
      reconnectTimeout.value = null
    }
    
    stopHeartbeat()
    
    if (ws.value) {
      ws.value.close(1000, 'Manual disconnect') // Normal closure
      ws.value = null
    }
    
    state.isConnected = false
    state.isConnecting = false
    state.currentRoomId = null
    state.reconnectAttempts = 0
  }
  
  const send = (message: WebSocketMessage) => {
    if (!state.isConnected || !ws.value) {
      console.warn('Cannot send message: WebSocket not connected')
      return false
    }
    
    try {
      ws.value.send(JSON.stringify(message))
      return true
    } catch (error) {
      console.error('Failed to send WebSocket message:', error)
      return false
    }
  }
  
  const joinRoom = (roomId: string, payload?: any) => {
    state.currentRoomId = roomId
    return send({
      type: 'join_room',
      roomId,
      payload
    })
  }
  
  const leaveRoom = (roomId?: string) => {
    const targetRoomId = roomId || state.currentRoomId
    if (targetRoomId) {
      send({
        type: 'leave_room',
        roomId: targetRoomId
      })
    }
    state.currentRoomId = null
  }
  
  const on = (eventType: string, callback: WebSocketEventCallback) => {
    if (!eventCallbacks.has(eventType)) {
      eventCallbacks.set(eventType, new Set())
    }
    eventCallbacks.get(eventType)!.add(callback)
    
    // Return unsubscribe function
    return () => {
      const callbacks = eventCallbacks.get(eventType)
      if (callbacks) {
        callbacks.delete(callback)
        if (callbacks.size === 0) {
          eventCallbacks.delete(eventType)
        }
      }
    }
  }
  
  const handleMessage = (message: WebSocketMessage) => {
    console.log('WebSocket message received:', message)
    
    // Call event-specific callbacks
    const callbacks = eventCallbacks.get(message.type)
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(message)
        } catch (error) {
          console.error('Error in WebSocket event callback:', error)
        }
      })
    }
    
    // Call general message callbacks
    const generalCallbacks = eventCallbacks.get('*')
    if (generalCallbacks) {
      generalCallbacks.forEach(callback => {
        try {
          callback(message)
        } catch (error) {
          console.error('Error in WebSocket general callback:', error)
        }
      })
    }
  }
  
  const startHeartbeat = () => {
    if (heartbeatInterval.value) {
      clearInterval(heartbeatInterval.value)
    }
    
    heartbeatInterval.value = setInterval(() => {
      if (state.isConnected) {
        send({ type: 'ping' })
      }
    }, HEARTBEAT_INTERVAL) as unknown as number
  }
  
  const stopHeartbeat = () => {
    if (heartbeatInterval.value) {
      clearInterval(heartbeatInterval.value)
      heartbeatInterval.value = null
    }
  }
  
  const scheduleReconnect = () => {
    if (state.reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
      state.error = 'Max reconnection attempts reached'
      return
    }
    
    if (reconnectTimeout.value) {
      clearTimeout(reconnectTimeout.value)
    }
    
    const delay = RECONNECT_DELAY_BASE * Math.pow(2, state.reconnectAttempts) // Exponential backoff
    state.reconnectAttempts++
    
    console.log(`Scheduling reconnect attempt ${state.reconnectAttempts} in ${delay}ms`)
    
    reconnectTimeout.value = setTimeout(() => {
      if (!state.isConnected) {
        connect()
      }
    }, delay) as unknown as number
  }
  
  // Cleanup on unmount
  onUnmounted(() => {
    disconnect()
  })
  
  return {
    state,
    connect,
    disconnect,
    send,
    joinRoom,
    leaveRoom,
    on
  }
}