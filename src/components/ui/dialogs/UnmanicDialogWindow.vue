<template>
  <q-dialog
    ref="dialogRef"
    backdrop-filter="grayscale(80%) blur(4px)"
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
      :style="{ '--dialog-width': desktopWidth }"
      v-touch-swipe.touch.left="onSwipeLeft"
    >
      <!-- HEADER -->
      <q-card-section class="bg-card-head col-auto dialog-sticky-header q-py-sm">
        <div class="row items-center no-wrap">

          <!-- MOBILE/TABLET (lt-md OR mobile platform): Back/Close Left -->
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
              :class="[{ 'dialog-attention': attentionActive }, index > 0 ? 'q-ml-xs' : 'q-ml-sm']"
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

          <!-- DESKTOP (md+ AND desktop platform): Title Left, Arrow Close Right -->
          <template v-else>
            <div class="text-h6 text-primary q-mr-auto ellipsis">
              {{ title }}
            </div>

            <q-btn
              v-for="(action, index) in actions"
              :key="action.emit || action.label || index"
              outline
              :icon="action.icon"
              :label="action.label"
              :color="action.color || 'secondary'"
              :disable="action.disabled"
              :class="[{ 'dialog-attention': attentionActive }, index === 0 ? 'q-mr-sm' : 'q-ml-xs']"
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
    default: '95vw'
  },
  closeTooltip: {
    type: String,
    default: ''
  },
  persistent: {
    type: Boolean,
    default: false
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

const onSwipeLeft = () => {
  if (isMobile.value && !props.persistent) {
    hide()
  }
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

const triggerAction = (action) => {
  if (action) {
    const eventName = action.emit || 'action'
    emit(eventName)
  }
}

// Pass prop width to CSS
const desktopWidth = computed(() => props.width)

defineExpose({
  show,
  hide
})
</script>

<style scoped>
.dialog-sticky-header {
  position: sticky;
  top: 0;
  z-index: 100;
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
}

.dialog-card {
  width: var(--dialog-width);
  max-width: 98vw;
  height: calc(100vh - 48px);
  margin: 24px 0;
}

/* Mobile view (XS and SM: < 1024px) */
@media (max-width: 1023px) {
  .dialog-card {
    width: 100vw;
    max-width: 100vw;
    height: 100%;
    margin: 0;
  }
}

.mobile-layout {
  width: 100vw !important;
  max-width: 100vw !important;
  height: 100% !important;
  margin: 0 !important;
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
