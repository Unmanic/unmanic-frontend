<template>
  <q-dialog
    ref="dialogRef"
    backdrop-filter="grayscale(80%) blur(1px)"
    :position="isMobile ? 'left' : 'right'"
    :maximized="isMobile"
    :transition-show="isMobile ? 'slide-right' : 'slide-left'"
    :transition-hide="isMobile ? 'slide-left' : 'slide-right'"
    full-height
    :persistent="persistent"
    @shake="onShake"
    @hide="onDialogHide"
  >
    <q-card
      class="column no-wrap dialog-card"
      :class="{ 'mobile-layout': isMobile }"
      :style="{ '--dialog-width': requestedWidth }"
      v-touch-swipe.touch.left="onSwipeLeft"
    >
      <!-- HEADER -->
      <q-card-section class="bg-card-head col-auto dialog-sticky-header q-py-sm">
        <div class="row items-center no-wrap">

          <!-- MOBILE HEADER (lt-md OR mobile platform): Left Close Button -->
          <template v-if="isMobile">
            <q-btn
              outline dense round
              icon="arrow_back"
              color="grey-7"
              :class="{ 'dialog-attention': attentionActive }"
              @click="hide"
            >
              <q-tooltip class="bg-white text-primary no-wrap" style="max-width: none;">
                {{ closeTooltip || $t('tooltips.close') }}
              </q-tooltip>
            </q-btn>

            <q-btn
              v-for="(action, index) in actions"
              :key="action.emit || action.label || index"
              outline
              :icon="action.icon"
              :label="action.label"
              :color="action.color || 'secondary'"
              :disable="action.disabled"
              :class="[
                { 'dialog-attention': attentionActive },
                index > 0 ? 'q-ml-xs' : 'q-ml-sm',
                index === actions.length - 1 ? 'q-mr-sm' : ''
              ]"
              @click="triggerAction(action)"
            >
              <q-tooltip v-if="typeof action.tooltip === 'string'" class="bg-white text-primary">
                {{ action.tooltip }}
              </q-tooltip>
            </q-btn>

            <q-space/>

            <div class="text-h6 text-primary q-px-sm ellipsis">
              {{ title }}
            </div>

            <q-space/>
          </template>

          <!-- DESKTOP HEADER (md+ AND desktop platform): Right Close Button -->
          <template v-else>
            <div class="text-h6 text-primary q-mr-auto ellipsis">
              {{ title }}
            </div>

            <!-- Action Button (Desktop) -->
            <q-btn
              v-for="(action, index) in actions"
              :key="action.emit || action.label || index"
              outline
              :icon="action.icon"
              :label="action.label"
              :color="action.color || 'secondary'"
              :disable="action.disabled"
              :class="[
                { 'dialog-attention': attentionActive },
                index === 0 ? 'q-mr-sm' : 'q-ml-xs',
                index === actions.length - 1 ? 'q-mr-sm' : ''
              ]"
              @click="triggerAction(action)"
            >
              <q-tooltip v-if="typeof action.tooltip === 'string'" class="bg-white text-primary">
                {{ action.tooltip }}
              </q-tooltip>
            </q-btn>

            <q-btn
              outline dense round
              icon="arrow_forward"
              color="grey-7"
              :class="{ 'dialog-attention': attentionActive }"
              @click="hide"
            >
              <q-tooltip class="bg-white text-primary no-wrap" style="max-width: none;">
                {{ closeTooltip || $t('tooltips.close') }}
              </q-tooltip>
            </q-btn>
          </template>

        </div>
      </q-card-section>

      <!-- CONTENT -->
      <q-card-section class="col scroll q-pa-none">
        <slot></slot>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useMobile } from 'src/composables/useMobile'

const props = defineProps({
  title: {
    type: String,
    default: ''
  },
  width: {
    type: String,
    default: '1000px'
  },
  persistent: {
    type: Boolean,
    default: false
  },
  closeTooltip: {
    type: String,
    default: ''
  },
  actions: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['ok', 'hide', 'action', 'save', 'reset'])

const { isMobile } = useMobile()
const dialogRef = ref(null)
const attentionActive = ref(false)
let attentionTimer = null

const show = () => {
  dialogRef.value.show()
}

const hide = () => {
  dialogRef.value.hide()
}

const onDialogHide = () => {
  emit('hide')
}

const onShake = () => {
  if (!props.persistent) {
    return
  }
  attentionActive.value = true
  if (attentionTimer) {
    clearTimeout(attentionTimer)
  }
  attentionTimer = setTimeout(() => {
    attentionActive.value = false
    attentionTimer = null
  }, 2400)
}

const onSwipeLeft = () => {
  if (isMobile.value && !props.persistent) {
    hide()
  }
}

const triggerAction = (action) => {
  if (action) {
    const eventName = action.emit || 'action'
    emit(eventName)
  }
}

// Bind the prop to CSS
const requestedWidth = computed(() => props.width)

defineExpose({
  show,
  hide
})
</script>

<style scoped>
.dialog-sticky-header {
  position: sticky;
  top: 0;
  z-index: 4001;
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
}

.dialog-card {
  width: var(--dialog-width);
  max-width: 100vw;
  /* Apply custom drop-shadow */
  border: 1px solid color-mix(in srgb, var(--unmanic-grey-5), transparent 60%);
  border-radius: 4px;
  box-shadow: 2px 2px 10px rgba(189, 189, 189, 0.3);
}

.body--dark .dialog-card {
  box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.3);
}

/* Mobile view (XS and SM: < 1024px) OR forced mobile layout */
@media (max-width: 1023px) {
  .dialog-card {
    width: 100vw;
    /* Remove custom drop-shadow */
    border: none;
    border-radius: 0;
    box-shadow: none;
  }
}

.mobile-layout {
  width: 100vw !important;
}

.dialog-attention {
  animation: dialog-attention-flash 0.8s ease-in-out 3;
}

@keyframes dialog-attention-flash {
  0% {
    box-shadow: 0 0 0 0 rgba(25, 118, 210, 0.65);
  }
  50% {
    box-shadow: 0 0 0 6px rgba(25, 118, 210, 0.25);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(25, 118, 210, 0);
  }
}
</style>
