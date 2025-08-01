<template>
  <div v-if="rolls.length === 0" class="text-slate-400 text-center py-4">
    No rolls in this room yet. Be the first!
  </div>
  <div v-else class="mt-6">
    <h3 class="text-lg font-semibold text-white mb-2">Roll History ({{ rolls.length }} rolls)</h3>
    <div 
      class="space-y-3 max-h-[50rem] overflow-y-auto p-3 bg-slate-700/50 rounded-md thin-scrollbar" 
      aria-live="polite"
      ref="scrollContainer"
    >
      <div
        v-for="roll in displayedRolls" 
        :key="roll.id" 
        class="p-3 bg-transparentbg rounded-md shadow text-sm"
      >
        <div class="flex justify-between items-center">
          <div class="flex items-center space-x-2">
            <div v-if="roll.avatarUrl" class="w-6 h-6 rounded-full overflow-hidden bg-slate-600 flex-shrink-0">
              <img :src="roll.avatarUrl" :alt="`${roll.userName} avatar`" class="w-full h-full object-cover" />
            </div>
            <div v-else class="w-6 h-6 rounded-full bg-slate-600 flex items-center justify-center flex-shrink-0">
              <span class="text-slate-300 text-xs font-medium">{{ roll.userName.charAt(0).toUpperCase() }}</span>
            </div>
            <span class="font-semibold text-white">{{ roll.userName }}</span>
          </div>
          <span class="text-xs text-slate-400">
            {{ getFormattedTime(roll.timestamp) }}
          </span>
        </div>
        <p class="mt-1 text-slate-200">
          <span v-if="isActionRoll(roll)">
            Used <span class="font-bold text-white">{{ getActionName(roll) }}</span>
            <div class="mt-1">
              <span v-if="roll.rawDiceResult !== undefined" class="text-sm">
                Raw dice: <span class="font-bold text-white">{{ roll.rawDiceResult }}</span>, 
              </span>
              Final result: <span class="font-bold text-lg text-amber-400">{{ roll.result }}</span>
            </div>
            <span class="text-xs text-slate-400 block mt-1">
              WR: {{ getWeaponRank(roll) }}, MR: {{ getMasteryRank(roll) }}
              <span v-if="getRollFormula(roll)" class="block font-mono">{{ getRollFormula(roll) }}</span>
            </span>
            <!-- Detailed roll breakdown -->
            <div v-if="roll.rollDetails?.breakdown" class="mt-2 p-2 bg-slate-900/50 rounded text-xs font-mono text-green-400">
              <div class="text-slate-300 mb-1">Calculation:</div>
              <div class="break-all">{{ roll.rollDetails.breakdown }}</div>
            </div>
          </span>
          <span v-else>
            Rolled a <span class="font-bold text-lg text-amber-400">{{ roll.result }}</span> on a {{ getDiceLabel(roll.diceType) }}
          </span>
        </p>
        <p v-if="roll.comment" class="mt-1 text-xs text-slate-400 italic">
          Comment: {{ roll.comment }}
        </p>
      </div>
      
      <!-- Load more button for large lists -->
      <div v-if="rolls.length > displayLimit && displayedRolls.length < rolls.length" class="text-center py-4">
        <button 
          @click="loadMore"
          class="px-4 py-2 bg-[#a7357b] hover:bg-sky-700 text-white rounded-md text-sm transition-colors"
        >
          Load More ({{ rolls.length - displayedRolls.length }} remaining)
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Roll, ActionRoll } from '../types'
import { DICE_OPTIONS, RANK_OPTIONS } from '../constants'

interface RollHistoryProps {
  rolls: Roll[]
}

const props = defineProps<RollHistoryProps>()

// Pagination for performance with large lists
const displayLimit = ref(50) // Start with 50 rolls
const scrollContainer = ref<HTMLElement>()

const displayedRolls = computed(() => {
  return props.rolls.slice(0, displayLimit.value)
})

const loadMore = () => {
  displayLimit.value += 25 // Load 25 more rolls
}

// Memoized date formatting cache
const dateFormatCache = new Map<string, string>()

const getFormattedTime = (timestamp: Date) => {
  const key = timestamp.toISOString()
  
  if (!dateFormatCache.has(key)) {
    const date = new Date(timestamp)
    const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    const dateStr = date.toLocaleDateString()
    dateFormatCache.set(key, `${timeStr} - ${dateStr}`)
  }
  
  return dateFormatCache.get(key)!
}

const getDiceLabel = (diceValue: number) => {
  const option = DICE_OPTIONS.find(opt => opt.value === diceValue)
  return option ? option.label : `D${diceValue}`
}

// Type guard to check if a roll is an action roll
const isActionRoll = (roll: Roll): roll is ActionRoll => {
  return 'actionName' in roll
}

const getActionName = (roll: Roll) => {
  if (isActionRoll(roll)) {
    return roll.actionName
  }
  return ''
}

const getWeaponRank = (roll: Roll) => {
  if (isActionRoll(roll)) {
    const rankOption = RANK_OPTIONS.find(r => r.value === roll.weaponRank)
    return `${roll.weaponRank} (+${rankOption?.bonus || 0})`
  }
  return ''
}

const getMasteryRank = (roll: Roll) => {
  if (isActionRoll(roll)) {
    const rankOption = RANK_OPTIONS.find(r => r.value === roll.masteryRank)
    return `${roll.masteryRank} (+${rankOption?.bonus || 0})`
  }
  return ''
}

const getRollFormula = (roll: Roll) => {
  if (isActionRoll(roll)) {
    return roll.rollFormula
  }
  return ''
}

</script>