export function useChatSocket(onMessage) {
  let eventSource = null;

  const connect = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    const url = `http://192.168.18.61:9200/api/sse/${user.username}`;
    console.log('🔌 Connecting to SSE:', url);

    eventSource = new EventSource(url);
    eventSource.onmessage = (e) => {
      const msg = JSON.parse(e.data);
      console.log('📥 Message received via SSE:', msg);
      onMessage(msg);
    };

    eventSource.onerror = (err) => {
      console.error('❌ SSE error:', err);
    };
  };

  const disconnect = () => {
    if (eventSource) {
      eventSource.close();
      console.log('🔌 SSE disconnected');
    }
  };

  const sendMessage = async (msg) => {
    console.log('📤 Sending message:', msg);
    await fetch('http://192.168.18.61:9200/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(msg),
    });
  };

  return { connect, disconnect, sendMessage };
}
