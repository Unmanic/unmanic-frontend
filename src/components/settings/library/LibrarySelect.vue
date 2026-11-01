<template>
  <q-select
    outlined
    color="primary"
    multiple
    use-chips
    emit-value
    map-options
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    :options="options"
    option-value="id"
    option-label="name"
    :label="label"
    :hint="hint"
    :loading="loading"
    :disable="disabled || loading"/>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import axios from 'axios'
import { getUnmanicApiUrl } from 'src/js/unmanicGlobals'

const props = defineProps({
  modelValue: { type: Array, default: () => [] },
  libraryId: { type: Number, default: null },
  label: { type: String, required: true },
  hint: { type: String, default: '' },
  disabled: { type: Boolean, default: false }
})
defineEmits(['update:modelValue'])

const libraries = ref([])
const loading = ref(false)
const options = computed(() => libraries.value.filter(library => library.id !== props.libraryId))

watch(() => props.libraryId, async () => {
  loading.value = true
  try {
    const response = await axios.get(getUnmanicApiUrl('v2', 'settings/libraries'))
    libraries.value = response.data.libraries
  } finally {
    loading.value = false
  }
}, { immediate: true })
</script>
