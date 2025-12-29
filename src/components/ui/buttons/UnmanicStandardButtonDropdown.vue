<template>
  <q-btn-dropdown
    v-bind="$attrs"
    outline
    color="secondary"
    :icon="icon || undefined"
    :icon-right="iconRight || undefined"
    :label="label"
    :dense="dense"
    :auto-close="autoClose"
    content-class="unmanic-dropdown-menu"
  >
    <slot/>
  </q-btn-dropdown>
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
  },
  autoClose: {
    type: Boolean,
    default: false
  }
})
</script>
