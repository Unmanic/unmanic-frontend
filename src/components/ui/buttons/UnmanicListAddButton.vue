<template>
  <q-btn
    outline
    dense
    round
    color="secondary"
    icon="add"
    @click="$emit('click', $event)"
  >
    <q-tooltip v-if="tooltip" class="bg-white text-primary">
      {{ tooltip }}
    </q-tooltip>
  </q-btn>
</template>

<script setup>
defineProps({
  tooltip: {
    type: String,
    default: ''
  }
})

defineEmits(['click'])
</script>
