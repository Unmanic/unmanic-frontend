<template>
  <q-btn
    v-bind="$attrs"
    outline
    color="secondary"
    :icon="icon || undefined"
    :icon-right="iconRight || undefined"
    :label="label"
    :dense="dense"
    @click="$emit('click', $event)"
  >
    <slot/>
  </q-btn>
</template>

<script setup>
defineProps({
  label: {
    type: String,
    default: ''
  },
  icon: {
    type: String,
    default: ''
  },
  iconRight: {
    type: String,
    default: ''
  },
  dense: {
    type: Boolean,
    default: false
  }
})

defineEmits(['click'])
</script>
