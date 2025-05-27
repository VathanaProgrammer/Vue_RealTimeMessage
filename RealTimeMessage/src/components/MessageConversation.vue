<template>
  <div class="mt-4 border-t pt-2 bg-white p-4 rounded shadow">
    <div class="flex items-center justify-between mb-3">
      <div class="flex items-center space-x-3">
        <img
          :src="APT_BASE_URL + friend.profileImage"
          alt="profile"
          class="rounded-full object-cover h-10 w-10 border-2"
        />
        <h3 class="text-lg font-semibold text-blue-600">
          Chat with {{ friend.username }}
        </h3>
      </div>
      <button @click="closeConversation" class="text-red-600 text-xl font-bold">X</button>
    </div>

    <div class="messages space-y-1 mb-2 max-h-60 overflow-y-auto">
      <div
        v-for="(msg, index) in messages"
        :key="index"
        class="flex"
      >
        <div
          :class="[
            'p-2 rounded-md max-w-[70%]',
            msg.sender === currentUser.username
              ? 'bg-blue-100 ml-auto text-right'
              : 'bg-gray-100 mr-auto text-left'
          ]"
        >
          <p class="text-sm text-red-500">{{ msg.content }}</p>
          <span class="text-xs text-gray-500">{{ msg.sender }}</span>
        </div>
      </div>
    </div>

    <div class="flex items-center space-x-2 mt-2">
      <input
        v-model="messageInput"
        type="text"
        placeholder="Type a message..."
        class="border p-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-700"
      />
      <button
        @click="handleSend"
        class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
      >
        Send
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick  } from 'vue';
const APT_BASE_URL = 'http://localhost:9200';

nextTick(() => {
  const container = document.querySelector('.messages');
  if (container) container.scrollTop = container.scrollHeight;
});
const props = defineProps({ friend: Object });
const emit = defineEmits(['closeConversation']);

const messageInput = ref('');
const messages = ref([]);
const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

let eventSource = null;

const connect = () => {
  const username = currentUser.username;
  eventSource = new EventSource(`${APT_BASE_URL}/api/chat/stream/${username}`);

eventSource.onmessage = (event) => {
  try {
    const message = JSON.parse(event.data);

    // Skip if we already have the same timestamp
    const isDuplicate = messages.value.some(
      (msg) => msg.timestamp === message.timestamp
    );

    if (
      !isDuplicate &&
      (message.sender === props.friend.username ||
       message.receiver === props.friend.username)
    ) {
      messages.value.push(message);
      messages.value = [...messages.value]; // force reactivity
    }
  } catch (error) {
    console.error('Error parsing SSE message:', error);
  }
};


  eventSource.onerror = () => {
    console.error('SSE connection error');
  };
};

const sendMessage = async (msg) => {
  try {
    const res = await fetch(APT_BASE_URL + '/api/chat/sendToUser', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(msg),
    });

    if (!res.ok) {
      console.error('Failed to send message');
    } else {
      console.log('Message sent');
    }
  } catch (err) {
    console.error('Send error:', err);
  }
};

const handleSend = () => {
  const text = messageInput.value.trim();
  if (!text) return;

  const newMsg = {
    sender: currentUser.username,
    receiver: props.friend.username,
    content: text,
    timestamp: new Date().toISOString(),
  };

  messages.value.push(newMsg);
  sendMessage(newMsg);
  messageInput.value = '';
};

const closeConversation = () => {
  emit('closeConversation');
};

onMounted(connect);
onBeforeUnmount(() => {
  if (eventSource) eventSource.close();
});
</script>
