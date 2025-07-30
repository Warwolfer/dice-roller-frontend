<template>
  <div class="space-y-4">
    <!-- Category Selection -->
    <div class="flex items-center space-x-2">
      <label for="action-category" class="text-slate-300 font-medium min-w-0">
        Category:
      </label>
      <select
        id="action-category"
        :value="selectedCategory"
        @change="onCategoryChange"
        :disabled="disabled"
        class="flex-1 p-2 bg-slate-700 border border-slate-600 rounded-md focus:ring-sky-500 focus:border-sky-500 text-slate-100 disabled:opacity-50"
      >
        <option value="">Select Category</option>
        <option
          v-for="category in categories"
          :key="category"
          :value="category"
        >
          {{ category }}
        </option>
      </select>
    </div>

    <!-- Action Selection -->
    <div class="flex items-center space-x-2">
      <label for="action-name" class="text-slate-300 font-medium min-w-0">
        Action:
      </label>
      <select
        id="action-name"
        :value="selectedAction?.name || ''"
        @change="onActionChange"
        :disabled="disabled || !selectedCategory"
        class="flex-1 p-2 bg-slate-700 border border-slate-600 rounded-md focus:ring-sky-500 focus:border-sky-500 text-slate-100 disabled:opacity-50"
      >
        <option value="">Select Action</option>
        <option
          v-for="action in filteredActions"
          :key="action.name"
          :value="action.name"
        >
          {{ action.name }} ({{ action.type }})
        </option>
      </select>
    </div>

    <!-- Ranks Section -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <!-- Weapon Rank -->
      <div class="flex items-center space-x-2">
        <label for="weapon-rank" class="text-slate-300 font-medium min-w-0">
          WR:
        </label>
        <select
          id="weapon-rank"
          :value="weaponRank"
          @change="onWeaponRankChange"
          :disabled="disabled"
          class="flex-1 p-2 bg-slate-700 border border-slate-600 rounded-md focus:ring-sky-500 focus:border-sky-500 text-slate-100 disabled:opacity-50"
        >
          <option
            v-for="rank in rankOptions"
            :key="rank.value"
            :value="rank.value"
          >
            {{ rank.label }} (+{{ rank.bonus }})
          </option>
        </select>
      </div>

      <!-- Mastery Rank -->
      <div class="flex items-center space-x-2">
        <label for="mastery-rank" class="text-slate-300 font-medium min-w-0">
          MR:
        </label>
        <select
          id="mastery-rank"
          :value="masteryRank"
          @change="onMasteryRankChange"
          :disabled="disabled"
          class="flex-1 p-2 bg-slate-700 border border-slate-600 rounded-md focus:ring-sky-500 focus:border-sky-500 text-slate-100 disabled:opacity-50"
        >
          <option
            v-for="rank in rankOptions"
            :key="rank.value"
            :value="rank.value"
          >
            {{ rank.label }} (+{{ rank.bonus }})
          </option>
        </select>
      </div>
    </div>

    <!-- Action Details -->
    <div v-if="selectedAction" class="mt-4 p-3 bg-slate-700/50 rounded-md">
      <div class="text-sm space-y-2">
        <div class="flex justify-between items-start">
          <span class="font-medium text-sky-400">{{ selectedAction.name }}</span>
          <span class="text-xs text-slate-400">{{ selectedAction.type }}</span>
        </div>
        <div v-if="selectedAction.rollFormula" class="text-xs text-amber-400 font-mono">
          Formula: {{ selectedAction.rollFormula }}
        </div>
        <div class="text-xs text-slate-300 whitespace-pre-line">
          {{ selectedAction.description }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Action, Rank } from '../types'
import { useActions } from '../composables/useActions'

interface ActionSelectorProps {
  selectedAction: Action | null
  weaponRank: Rank
  masteryRank: Rank
  disabled?: boolean
}

const props = defineProps<ActionSelectorProps>()
const emit = defineEmits<{
  actionChange: [action: Action | null]
  weaponRankChange: [rank: Rank]
  masteryRankChange: [rank: Rank]
}>()

const { actions, categories, fetchActions, getRankOptions, isLoading, error } = useActions()

const rankOptions = computed(() => getRankOptions())
const selectedCategory = ref<string>('')

onMounted(() => {
  fetchActions()
})

const filteredActions = computed(() => {
  if (!selectedCategory.value) return []
  return actions.filter(action => action.category === selectedCategory.value)
})

const onCategoryChange = (e: Event) => {
  const target = e.target as HTMLSelectElement
  selectedCategory.value = target.value
  // Reset action selection when category changes
  emit('actionChange', null)
}

const onActionChange = (e: Event) => {
  const target = e.target as HTMLSelectElement
  const actionName = target.value
  const action = actions.find(a => a.name === actionName) || null
  emit('actionChange', action)
}

const onWeaponRankChange = (e: Event) => {
  const target = e.target as HTMLSelectElement
  emit('weaponRankChange', target.value as Rank)
}

const onMasteryRankChange = (e: Event) => {
  const target = e.target as HTMLSelectElement
  emit('masteryRankChange', target.value as Rank)
}
</script>