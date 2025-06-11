<template>
  <div class="ai-assistant-widget" :class="{ 'is-open': isOpen }">
    <button
        @click="toggleChat"
        class="assistant-fab"
        :aria-expanded="isOpen"
        aria-label="打开智能助手"
    >
      <font-awesome-icon v-if="!isOpen" :icon="['fas', 'headset']" />
      <font-awesome-icon v-else :icon="['fas', 'times']" />
    </button>

    <transition name="chat-window-fade">
      <div v-if="isOpen" class="chat-window">
        <header class="chat-header">
          <h3 class="chat-title">
            <font-awesome-icon :icon="['fas', 'robot']" /> 智能助手小AI
          </h3>
          <button @click="isOpen = false" class="close-chat-button" aria-label="关闭聊天窗口">
            <font-awesome-icon :icon="['fas', 'times']" />
          </button>
        </header>
        <main class="chat-messages" ref="messagesContainerRef">
          <div v-for="(msg, index) in messages" :key="index" class="message-item" :class="`message-${msg.type}`">
            <div v-if="msg.type === 'ai'" class="avatar ai-avatar">
              <font-awesome-icon :icon="['fas', 'robot']" />
            </div>
            <div class="message-content">
              <p class="message-text" v-html="sanitizeAndFormat(msg.text)"></p>
              <span class="message-timestamp">{{ formatTimestamp(msg.timestamp) }}</span>
            </div>
            <div v-if="msg.type === 'user'" class="avatar user-avatar">
              <font-awesome-icon :icon="['fas', 'user']" />
            </div>
          </div>
          <div v-if="isLoadingAiResponse" class="message-item message-ai typing-indicator">
            <div class="avatar ai-avatar">
              <font-awesome-icon :icon="['fas', 'robot']" />
            </div>
            <div class="message-content">
              <p class="message-text"><i>小AI正在思考中...</i></p>
            </div>
          </div>
        </main>
        <footer class="chat-input-area">
          <textarea
              v-model="userInput"
              @keydown.enter.prevent="handleEnterKey"
              placeholder="请输入您的问题..."
              class="chat-input"
              rows="2"
              :disabled="isLoadingAiResponse"
          ></textarea>
          <button @click="sendMessage" class="send-button" :disabled="!userInput.trim() || isLoadingAiResponse">
            <font-awesome-icon :icon="['fas', 'paper-plane']" />
            <span class="sr-only">发送</span>
          </button>
        </footer>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, watch } from 'vue';
import DOMPurify from 'dompurify';
// import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

interface ChatMessage {
  id: string;
  type: 'user' | 'ai' | 'system'; // system for initial messages or errors
  text: string;
  timestamp: Date;
}

const isOpen = ref(false);
const userInput = ref('');
const messages = ref<ChatMessage[]>([
  {
    id: `ai-init-${Date.now()}`,
    type: 'ai',
    text: '您好！我是您的智能助手小AI，非常乐意为您服务。您可以问我关于如何使用本平台，或与面试准备相关的问题。',
    timestamp: new Date()
  }
]);
const messagesContainerRef = ref<HTMLElement | null>(null);
const isLoadingAiResponse = ref(false);

const toggleChat = () => {
  isOpen.value = !isOpen.value;
  if (isOpen.value) {
    scrollToBottom();
  }
};

const sanitizeAndFormat = (text: string) => {
  // Basic formatting: \n to <br>
  const formattedText = text.replace(/\n/g, '<br>');
  return DOMPurify.sanitize(formattedText);
};

const formatTimestamp = (date: Date): string => {
  return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
};

const scrollToBottom = async () => {
  await nextTick(); // Wait for DOM update
  if (messagesContainerRef.value) {
    messagesContainerRef.value.scrollTop = messagesContainerRef.value.scrollHeight;
  }
};

watch(messages, scrollToBottom, { deep: true });


const getMockAiResponse = (userMessage: string): Promise<string> => { // 修改返回类型为 Promise<string>
  const lowerMessage = userMessage.toLowerCase();
  isLoadingAiResponse.value = true;

  // Simulate API delay
  return new Promise<string>((resolve) => {
    setTimeout(() => {
      isLoadingAiResponse.value = false;
      if (lowerMessage.includes('你好') || lowerMessage.includes('hello')) {
        resolve('您好！很高兴为您服务。有什么可以帮您的吗？');
      } else if (lowerMessage.includes('如何开始') || lowerMessage.includes('开始面试') || lowerMessage.includes('模拟面试')) {
        resolve('您可以点击导航栏中的“开始练习”按钮，进入面试设置页面，配置好您的面试类型和阶段后，即可开始模拟面试。');
      } else if (lowerMessage.includes('忘记密码')) {
        resolve('如果您忘记了密码，可以在登录页面点击“忘记密码”链接，按照提示通过邮箱重置您的密码。');
      } else if (lowerMessage.includes('简历') || lowerMessage.includes('上传简历')) {
        resolve('您可以在“账户设置”页面的“管理简历”部分上传和管理您的简历。在“设置新面试”时，也可以选择使用已上传的简历或上传新的简历。');
      } else if (lowerMessage.includes('技术问题') || lowerMessage.includes('算法题')) {
        resolve('对于具体的技术或算法问题，建议您前往“讨论区”与他人交流，或在“学习资料”、“刷题板块”查找相关内容。如果您想练习回答这类问题，可以在模拟面试中选择“技术问答”或“编程考察”阶段。');
      } else if (lowerMessage.includes('谢谢') || lowerMessage.includes('感谢')) {
        resolve('不客气！能帮到您我很开心。如果您还有其他问题，随时可以问我。');
      } else {
        resolve('抱歉，我暂时还在学习中，可能无法完全理解您的问题。您可以尝试换一种问法，或者在我们的“讨论区”向其他用户寻求帮助。');
      }
      scrollToBottom(); // Scroll after AI response is added
    }, Math.random() * 1000 + 500); // Random delay between 0.5s to 1.5s
  });
};

const sendMessage = async () => {
  if (!userInput.value.trim()) return;

  const userMessageText = userInput.value;
  messages.value.push({
    id: `user-${Date.now()}`,
    type: 'user',
    text: userMessageText,
    timestamp: new Date(),
  });
  userInput.value = ''; // Clear input after sending

  const aiResponseText = await getMockAiResponse(userMessageText); // Await the promise
  messages.value.push({
    id: `ai-${Date.now()}`,
    type: 'ai',
    text: aiResponseText,
    timestamp: new Date(),
  });
};

const handleEnterKey = (event: KeyboardEvent) => {
  if (event.shiftKey) { // Allow Shift+Enter for new line
    return;
  }
  sendMessage();
};

</script>

<style scoped>
.ai-assistant-widget {
  position: fixed;
  bottom: 1.5rem; /* 24px */
  left: 1.5rem;  /* 24px */
  z-index: 1000; /* Ensure it's above most other content */
}

.assistant-fab {
  background-color: var(--primary-color);
  color: white;
  border: none;
  width: 56px; /* Material Design FAB size */
  height: 56px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem; /* Icon size */
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.2s ease-out;
}
.assistant-fab:hover {
  background-color: color-mix(in srgb, var(--primary-color) 85%, black 15%);
  transform: scale(1.05);
}
[data-theme="dark"] .assistant-fab {
  /* Primary color should already be suitable for dark theme */
}

.chat-window {
  position: fixed; /* Changed from absolute to fixed for better viewport anchoring */
  bottom: calc(1.5rem + 56px + 0.75rem); /* FAB bottom + FAB height + gap */
  left: 1.5rem;
  width: 360px; /* Common chat window width */
  max-height: 70vh; /* Limit height */
  background-color: var(--card-bg-color);
  border-radius: 10px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  overflow: hidden; /* Important for border-radius on children */
  border: 1px solid var(--border-color);
}
[data-theme="dark"] .chat-window {
  /* background-color: #1e2124; From your dark theme variables */
  /* border-color: #3a3f4c; */
}


.chat-header {
  background-color: var(--primary-color);
  color: white;
  padding: 0.75rem 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
}
.chat-title {
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.close-chat-button {
  background: none;
  border: none;
  color: white;
  font-size: 1.1rem;
  cursor: pointer;
  padding: 0.25rem;
  opacity: 0.8;
}
.close-chat-button:hover {
  opacity: 1;
}

.chat-messages {
  flex-grow: 1;
  padding: 1rem;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
.chat-messages::-webkit-scrollbar { width: 5px; }
.chat-messages::-webkit-scrollbar-track { background: var(--border-color); border-radius: 3px;}
.chat-messages::-webkit-scrollbar-thumb { background: var(--primary-color); border-radius: 3px;}


.message-item {
  display: flex;
  max-width: 85%; /* Messages don't take full width */
}
.message-item .avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: var(--border-color);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
  flex-shrink: 0;
}
.message-item .ai-avatar {
  background-color: var(--primary-color);
  color: white;
  margin-right: 0.6rem;
}
.message-item .user-avatar {
  background-color: var(--secondary-color); /* Or another distinct color */
  color: white;
  margin-left: 0.6rem;
}
[data-theme="dark"] .message-item .user-avatar {
  background-color: #4a5568; /* Darker secondary for dark theme */
}


.message-content {
  padding: 0.6rem 0.9rem;
  border-radius: 12px;
  font-size: 0.9rem;
  line-height: 1.5;
}
.message-item.message-ai {
  align-self: flex-start;
}
.message-item.message-ai .message-content {
  background-color: var(--bg-color); /* Slightly different from chat window bg */
  border: 1px solid var(--border-color);
  border-top-left-radius: 0; /* Bubble style */
  color: var(--text-color);
}
[data-theme="dark"] .message-item.message-ai .message-content {
  background-color: #2d3748; /* Darker bubble */
  border-color: #4a5568;
}


.message-item.message-user {
  align-self: flex-end; /* User messages on the right */
  flex-direction: row-reverse; /* Avatar on the right */
}
.message-item.message-user .message-content {
  background-color: var(--primary-color);
  color: white;
  border-top-right-radius: 0; /* Bubble style */
}

.message-text {
  margin: 0;
  word-wrap: break-word;
  overflow-wrap: break-word;
  white-space: pre-wrap; /* Respect newlines in messages */
}
.message-timestamp {
  display: block;
  font-size: 0.7rem;
  opacity: 0.6;
  margin-top: 0.25rem;
  text-align: right; /* Timestamp on the right of bubble */
}
.message-item.message-ai .message-timestamp {
  text-align: left;
}

.typing-indicator i {
  opacity: 0.8;
}

.chat-input-area {
  padding: 0.75rem;
  border-top: 1px solid var(--border-color);
  display: flex;
  align-items: flex-end; /* Align items to bottom for multi-line textarea */
  gap: 0.5rem;
  background-color: var(--bg-color);
  flex-shrink: 0;
}
.chat-input {
  flex-grow: 1;
  padding: 0.6rem 0.75rem;
  border: 1px solid var(--input-border-color);
  border-radius: 6px;
  font-size: 0.9rem;
  resize: none; /* Prevent manual resize */
  line-height: 1.4;
  max-height: 80px; /* Limit textarea height */
  overflow-y: auto; /* Scroll if text exceeds max-height */
  background-color: var(--input-bg-color);
  color: var(--text-color);
}
.chat-input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px var(--primary-color-translucent);
}
.send-button {
  background-color: var(--primary-color);
  color: white;
  border: none;
  width: 44px; /* Square button */
  height: 44px;
  border-radius: 6px; /* Match input */
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  cursor: pointer;
  transition: background-color 0.2s ease;
  flex-shrink: 0;
}
.send-button:hover:not(:disabled) {
  opacity: 0.85;
}
.send-button:disabled {
  background-color: var(--border-color);
  color: var(--text-color-muted);
  cursor: not-allowed;
  opacity: 0.7;
}

.sr-only { /* For accessibility */
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

/* Chat Window Transition */
.chat-window-fade-enter-active,
.chat-window-fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.chat-window-fade-enter-from,
.chat-window-fade-leave-to {
  opacity: 0;
  transform: translateY(20px) scale(0.95);
}
</style>