<template>
  <form @submit="handleSubmit" class="mb-6 p-4 bg-slate-800 rounded-lg shadow-md">
    <div class="mb-4">
      <div class="flex space-x-4 mb-3">
        <label class="flex items-center">
          <input
            type="radio"
            value="manual"
            v-model="inputMode"
            class="mr-2 text-sky-500 focus:ring-sky-500"
          />
          <span class="text-sm text-slate-300">Enter Name Manually</span>
        </label>
        <label class="flex items-center">
          <input
            type="radio"
            value="userid"
            v-model="inputMode"
            class="mr-2 text-sky-500 focus:ring-sky-500"
          />
          <span class="text-sm text-slate-300">Use TerraRP User ID</span>
        </label>
      </div>
    </div>

    <div v-if="inputMode === 'manual'">
      <label for="username" class="block text-sm font-medium text-slate-300 mb-1">
        Enter Your Name:
      </label>
      <div class="flex space-x-2">
        <input
          id="username"
          type="text"
          v-model="name"
          placeholder="E.g., DungeonMaster"
          class="flex-grow p-2 bg-slate-700 border border-slate-600 rounded-md focus:ring-sky-500 focus:border-sky-500 text-slate-100"
          aria-label="Username"
        />
        <Button type="submit" variant="primary" :disabled="!name.trim()">
          Set Name
        </Button>
      </div>
    </div>

    <div v-else>
      <label for="userid" class="block text-sm font-medium text-slate-300 mb-1">
        Enter TerraRP User ID:
      </label>
      <div class="flex space-x-2">
        <input
          id="userid"
          type="number"
          v-model="userId"
          placeholder="E.g., 135"
          class="flex-grow p-2 bg-slate-700 border border-slate-600 rounded-md focus:ring-sky-500 focus:border-sky-500 text-slate-100"
          aria-label="User ID"
        />
        <Button type="submit" variant="primary" :disabled="!userId || isLoading">
          {{ isLoading ? 'Loading...' : 'Fetch User' }}
        </Button>
      </div>
      <div v-if="fetchError" class="mt-2 text-red-400 text-sm">
        {{ fetchError }}
      </div>
      <div v-if="fetchedUsername" class="mt-2 text-green-400 text-sm">
        Found user: {{ fetchedUsername }}
      </div>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Button from './Button.vue'
import { API_BASE_URL } from '../constants'
import { useApiCache } from '../composables/useApiCache'

interface UserInputProps {
  currentName?: string | null
}

const props = defineProps<UserInputProps>()
const emit = defineEmits<{
  setUser: [name: string, terrapData?: any]
}>()

const { cachedFetch } = useApiCache()

const inputMode = ref<'manual' | 'userid'>('manual')
const name = ref('')
const userId = ref<number | null>(null)
const isLoading = ref(false)
const fetchError = ref<string | null>(null)
const fetchedUsername = ref<string | null>(null)

const fetchUserFromTerraRP = async (id: number): Promise<{username: string, data: any} | null> => {
  try {
    isLoading.value = true
    fetchError.value = null
    
    const data = await cachedFetch(`${API_BASE_URL}/terrarp-user/${id}`, {}, 300000) // 5 minute TTL for user data
    
    // Extract username from the response - adjust this based on the actual API response structure
    const username = data.username || data.name || data.characterName || `User ${id}`
    return { username, data }
  } catch (error) {
    const err = error as Error
    fetchError.value = err.message
    return null
  } finally {
    isLoading.value = false
  }
}

const handleSubmit = async (e: Event) => {
  e.preventDefault()
  
  if (inputMode.value === 'manual') {
    if (name.value.trim()) {
      emit('setUser', name.value.trim())
    }
  } else {
    if (userId.value) {
      const result = await fetchUserFromTerraRP(userId.value)
      if (result) {
        fetchedUsername.value = result.username
        emit('setUser', result.username, result.data)
      }
    }
  }
}

onMounted(() => {
  name.value = props.currentName || ''
})
</script>