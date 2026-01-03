<template>
  <div :class="['admonition', `admonition-${type}`]">
    <div class="admonition-heading">
      <h5>
        <div class="admonition-icon">
          <q-icon :name="iconName" />
        </div>
        {{ displayTitle }}
      </h5>
    </div>
    <div class="admonition-content">
      <slot></slot>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  type: {
    type: String,
    default: 'note',
    validator: (value) => ['note', 'tip', 'warning', 'caution', 'important'].includes(value)
  },
  title: {
    type: String,
    required: false,
    default: null
  }
})

const { t } = useI18n()

const displayTitle = computed(() => {
  if (props.title) return props.title
  return t(`components.admonitions.${props.type}`)
})

const iconName = computed(() => {
  switch (props.type) {
    case 'tip':
      return 'lightbulb'
    case 'warning':
      return 'warning'
    case 'caution':
      return 'error'
    case 'important':
      return 'campaign'
    default:
      return 'info'
  }
})
</script>
