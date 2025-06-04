<template>
  <div class="flex flex-col h-[600px] bg-white shadow rounded-lg overflow-hidden">
    <!-- ========= HEADER ========= -->
    <div class="flex items-center justify-between bg-blue-50 px-4 py-2 border-b">
      <div class="flex items-center gap-3">
        <img
          :src="APT_BASE_URL + friend.profileImage"
          alt="Friend avatar"
          class="h-10 w-10 rounded-full object-cover border"
        />
        <h2 class="text-blue-700 font-semibold text-lg">Chat with {{ friend.username }}</h2>
      </div>
      <button
        @click="closeConversation"
        title="Close chat"
        class="text-red-500 text-xl font-bold hover:text-red-700 transition"
      >
        ✖
      </button>
    </div>

    <!-- ========= MESSAGE LIST ========= -->
    <div
      ref="messageContainer"
      class="messages flex-1 overflow-y-auto px-4 py-3 space-y-2 bg-gray-50"
    >
      <div
        v-for="(msg, idx) in messages"
        :key="idx"
        class="flex items-end"
        :class="msg.senderName === currentUser.username ? 'justify-end' : 'justify-start'"
      >
        <!-- show avatar on incoming messages only -->
        <img
          v-if="msg.senderName !== currentUser.username"
          :src="APT_BASE_URL + friend.profileImage"
          alt="avatar"
          class="w-6 h-6 rounded-full mb-1 mr-2"
        />
        <div
          :class="[ 
            'px-4 py-2 rounded-xl shadow-sm max-w-sm break-words',
            msg.senderName === currentUser.username
              ? 'bg-blue-600 text-white ml-10'
              : 'bg-gray-200 text-gray-800 mr-10'
          ]"
        >
          <p class="text-sm">{{ msg.content }}</p>
          <div
            class="flex justify-between items-center text-[11px] mt-1"
            :class="msg.senderName === currentUser.username ? 'text-gray-200' : 'text-gray-500'"
          >
            <span>{{ msg.senderName === currentUser.username ? 'You' : msg.senderName }}</span>
            <span class="ps-2">{{ formatTime(msg.timestamp) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- ========= INPUT BAR ========= -->
    <div class="flex items-center gap-2 px-4 py-3 border-t bg-white">
      <input
        v-model="messageInput"
        @keyup.enter="handleSend"
        type="text"
        placeholder="Type a message…"
        class="flex-1 w-4/6 px-4 py-2 rounded-full text-gray-800 border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
      />
      <button
        @click="handleSend"
        :disabled="!isConnected || !messageInput.trim()"
        class="px-4 py-2 w-2/6 rounded-full text-white font-semibold transition
               bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
      >
        Send
      </button>
    </div>

    <!-- ========= CONNECTION STATUS ========= -->
    <div
      v-if="!isConnected"
      class="text-center text-sm text-red-500 py-2 bg-red-50 border-t"
    >
      🔌 Connecting…
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
import axios from 'axios'
import { useChatSocket } from '@/useChatSocket.js'
import API_BASE_URL from '@/api'
const APT_BASE_URL = API_BASE_URL;

const props = defineProps({
  friend: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['closeConversation'])

const messageInput = ref('')
const messages = ref([])
const currentUser = ref(null)
const messageContainer = ref(null)

const { connect, disconnect, sendMessage, isConnected } = useChatSocket((incomingMsg) => {
  console.log('📥 [Component] Received via STOMP:', incomingMsg)

if (!incomingMsg || typeof incomingMsg.content !== 'string') {
  console.warn('⚠️ Skipping empty or malformed message:', incomingMsg)
  return
}

const from = incomingMsg.senderName || 'Unknown'
const to = incomingMsg.receiverName || 'Unknown'

// Use incoming timestamp or fallback to now
const timestamp = incomingMsg.timestamp || new Date().toISOString()

const isForThisChat =
  (from === props.friend.username && to === currentUser.value?.username) ||
  (from === currentUser.value?.username && to === props.friend.username)

if (isForThisChat) {
  messages.value.push({
    senderName: from,
    receiverName: to,
    content: incomingMsg.content,
    timestamp: timestamp
  })

  nextTick(() => {
    messageContainer.value.scrollTop = messageContainer.value.scrollHeight
  })
}

})

async function fetchCurrentUser() {
  try {
    const res = await axios.get(`${APT_BASE_URL}/api/users/current-user`, {
      withCredentials: true
    })
    currentUser.value = res.data
    console.log('✅ Current user:', res.data)
  } catch (err) {
    console.error('❌ Failed to fetch current user:', err)
  }
}

async function fetchConversation() {
  if (!currentUser.value) return

  try {
    const res = await axios.get(`${APT_BASE_URL}/api/messages/conversation`, {
      params: { userId: props.friend.id },
      withCredentials: true
    })

    const validMessages = res.data.filter(
      (m) => m.senderName && m.receiverName && m.content
    )

    messages.value = validMessages
    nextTick(() => {
      messageContainer.value.scrollTop = messageContainer.value.scrollHeight
    })
    console.log('✅ Conversation loaded:', validMessages)
  } catch (err) {
    console.error('❌ Failed to fetch conversation:', err)
  }
}

// ── Only this function changed ──
function formatTime(isoString) {
  if (!isoString) return ''                           // no timestamp → empty
  const date = new Date(isoString)
  if (isNaN(date.getTime())) return ''               // invalid timestamp → empty
  return date.toLocaleTimeString([], {                // valid timestamp → “HH:MM”
    hour: '2-digit',
    minute: '2-digit'
  })
}

async function handleSend() {
  if (!isConnected.value || !messageInput.value.trim()) return

  const content = messageInput.value.trim()
  const timestamp = new Date().toISOString()

  const wsMsg = {
    senderName: currentUser.value.username,
    receiverName: props.friend.username,
    content,
    timestamp
  }

  // Optimistic UI push
  messages.value.push(wsMsg)
  nextTick(() => {
    messageContainer.value.scrollTop = messageContainer.value.scrollHeight
  })

  // Send over STOMP
  sendMessage(wsMsg)

  // Persist to DB
  try {
    await axios.post(
      `${APT_BASE_URL}/api/messages`,
      {
        senderId: currentUser.value.id,
        receiverId: props.friend.id,
        ...wsMsg
      },
      { withCredentials: true }
    )
    console.log('✅ Message saved to DB')
  } catch (err) {
    console.error('❌ Failed to save message:', err)
  }

  messageInput.value = ''
}

function closeConversation() {
  emit('closeConversation')
}

onMounted(async () => {
  await fetchCurrentUser()
  if (!currentUser.value) {
    alert('You are not logged in or your session expired.')
    return
  }
  await fetchConversation()
  connect()
})

onBeforeUnmount(() => {
  disconnect()
})
</script>

<style scoped>
.messages::-webkit-scrollbar {
  width: 6px;
}
.messages::-webkit-scrollbar-track {
  background: #f1f1f1;
}
.messages::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 3px;
}
.messages::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.4);
}
input:disabled,
button:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}
</style>
