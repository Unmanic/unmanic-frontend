<template>
  <q-btn
    flat
    dense
    round
    :size="size"
    :color="color"
    :icon="icon"
    :disable="disable"
    @click="$emit('click', $event)"
  >
    <q-tooltip v-if="tooltip" class="bg-white text-primary">
      {{ tooltip }}
    </q-tooltip>
    <slot/>
  </q-btn>
</template>

<script setup>
defineProps({
  icon: {
    type: String,
    required: true
  },
  color: {
    type: String,
    default: 'secondary'
  },
  size: {
    type: String,
    default: '12px'
  },
  tooltip: {
    type: String,
    default: ''
  },
  disable: {
    type: Boolean,
    default: false
  }
})

defineEmits(['click'])
</script>
