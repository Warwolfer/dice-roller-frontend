<template>
  <div v-if="rolls.length === 0" class="text-slate-400 text-center py-4">
    No rolls in this room yet. Be the first!
  </div>
  <div v-else class="mt-6">
    <h3 class="text-lg font-semibold text-sky-400 mb-2">Roll History</h3>
    <ul class="space-y-3 max-h-96 overflow-y-auto p-3 bg-slate-700/50 rounded-md thin-scrollbar" aria-live="polite">
      <li v-for="roll in rolls" :key="roll.id" class="p-3 bg-slate-800 rounded-md shadow text-sm">
        <div class="flex justify-between items-center">
          <span class="font-semibold text-sky-300">{{ roll.userName }}</span>
          <span class="text-xs text-slate-400">
            {{ formatTime(roll.timestamp) }} - {{ formatDate(roll.timestamp) }}
          </span>
        </div>
        <p class="mt-1 text-slate-200">
          <span v-if="isActionRoll(roll)">
            Used <span class="font-bold text-sky-400">{{ getActionName(roll) }}</span>
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
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { Roll, ActionRoll } from '../types'
import { DICE_OPTIONS, RANK_OPTIONS } from '../constants'

interface RollHistoryProps {
  rolls: Roll[]
}

defineProps<RollHistoryProps>()

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

const formatTime = (timestamp: Date) => {
  return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

const formatDate = (timestamp: Date) => {
  return new Date(timestamp).toLocaleDateString()
}
</script>