

<template>
  <div class="text-center m-4 flex flex-col gap-y-2">
    <div>
      <label for="urlToBan>">URL to ban:</label>
      <input
        id="urlToBan"
        type="text"
        v-model="urlToBan"
        class="border border-gray-300 rounded-md p-2">
    </div>
    <button @click="banUrl" class="bg-blue-200 rounded-full p-2">Ban Url</button>

    <div>
      <h2>Banned URLs</h2>
      <ul>
        <li v-for="url in bannedUrlList" :key="url">{{ url }}</li>
      </ul>
    </div>
    
    <RouterLink
      class="underline"
      to="/common/about"
    >
      About
    </RouterLink>
  </div>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router';
import { ref } from 'vue';
import { b } from 'unplugin-vue-router/dist/options-8dbadba3';

interface Message {
  to: string;
  action: string;
  payload: any;
}

function sendMessage(message: Message) {
  return new Promise(async (resolve, reject) => {
    try {
      chrome.runtime.sendMessage( message, (response) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
        resolve(response);
      }
    });
   } catch (error) {
      reject(error);
    }
  });
}

const urlToBan = ref('');
const bannedUrlList = ref([]);

async function banUrl() {
  const response = await sendMessage({
    to: 'background',
    action: 'banUrl',
    payload: urlToBan.value,
  });
  console.log('banUrl', urlToBan.value);
  urlToBan.value = '';
  const bannedListResponse = await getBannedUrlList();
  bannedUrlList.value = bannedListResponse.bannedUrls;
  console.log(bannedUrlList.value);
}

async function getBannedUrlList() {
  const result = await sendMessage({
    to: 'background',
    action: 'getBannedUrlList',
    payload: null,
  });
  return result;
 
}

</script>

<style scoped>
.btn {
  @apply px-4 py-2 rounded-md bg-blue-500 text-white;
}

.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}

.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}

.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
