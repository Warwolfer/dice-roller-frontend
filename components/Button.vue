<template>
  <button
    :class="[
      baseStyles,
      variantStyles,
      sizeStyles,
      $attrs.class
    ]"
    v-bind="$attrs"
  >
    <slot />
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger'
  size?: 'sm' | 'md' | 'lg'
}

const props = withDefaults(defineProps<ButtonProps>(), {
  variant: 'primary',
  size: 'md'
})

const baseStyles = 'font-semibold rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed'

const variantStyles = computed(() => {
  switch (props.variant) {
    case 'primary':
      return 'bg-[#a7357b] hover:bg-sky-700 text-white focus:ring-sky-500'
    case 'secondary':
      return 'bg-slate-600 hover:bg-slate-700 text-slate-100 focus:ring-slate-500'
    case 'danger':
      return 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500'
    default:
      return 'bg-[#a7357b] hover:bg-sky-700 text-white focus:ring-sky-500'
  }
})

const sizeStyles = computed(() => {
  switch (props.size) {
    case 'sm':
      return 'px-3 py-1.5 text-xs'
    case 'md':
      return 'px-4 py-2 text-sm'
    case 'lg':
      return 'px-6 py-2 text-base'
    default:
      return 'px-4 py-2 text-sm'
  }
})
</script>