// src/useChatSocket.js
import { Client } from '@stomp/stompjs'
import { ref } from 'vue'

/**
 * A composable for STOMP-over-WebSocket (no SockJS) that:
 *  - connect(): opens STOMP → '/chat'
 *  - disconnect(): closes it
 *  - sendMessage(msg): publishes to '/app/chat.sendToUser'
 *  - isConnected: reactive boolean
 *
 * onMessage callback receives payloads { senderName, receiverName, content, timestamp }
 */
export function useChatSocket(onMessage) {
  let stompClient = null
  const isConnected = ref(false)

  function connect() {
    console.log('🔌 [useChatSocket] → Attempting STOMP connect to ws://172.20.10.2:9200/chat …')
    stompClient = new Client({
      // 1) Point directly at your backend STOMP endpoint:
      brokerURL: 'ws://172.20.10.2:9200/chat',

      // 2) Auto-reconnect after 5 seconds if the socket drops:
      reconnectDelay: 5000,

      // 3) Called once STOMP handshake succeeds:
      onConnect: () => {
        console.log('✅ [useChatSocket] STOMP connected')
        isConnected.value = true

        // Subscribe to the “private” user queue.  Backend sends to '/user/{recipient}/queue/messages'.
        stompClient.subscribe(
          '/user/queue/messages',
          (payload) => {
            try {
              const chatMessage = JSON.parse(payload.body)
              console.log('📥 [useChatSocket] STOMP received:', chatMessage)
              onMessage(chatMessage)
            } catch (err) {
              console.error('❌ [useChatSocket] Error parsing STOMP message:', err)
            }
          }
        )
      },

      // 4) Called if the STOMP broker reports an error:
      onStompError: (frame) => {
        console.error('❌ [useChatSocket] STOMP broker error:', frame.headers['message'])
      },

      // 5) Called if the underlying WebSocket closes:
      onWebSocketClose: () => {
        console.log('⚠️ [useChatSocket] WebSocket closed')
        isConnected.value = false
      }
    })

    stompClient.activate()
  }

  function disconnect() {
    if (stompClient && stompClient.active) {
      stompClient.deactivate()
      isConnected.value = false
      console.log('🛑 [useChatSocket] STOMP disconnected')
    }
  }

  function sendMessage(msg) {
    if (stompClient && stompClient.active && isConnected.value) {
      stompClient.publish({
        destination: '/app/chat.sendToUser',
        body: JSON.stringify(msg)
      })
      console.log('📤 [useChatSocket] STOMP sent:', msg)
    } else {
      console.warn('⚠️ [useChatSocket] Cannot send: STOMP client is not connected')
    }
  }

  return {
    connect,
    disconnect,
    sendMessage,
    isConnected
  }
}
