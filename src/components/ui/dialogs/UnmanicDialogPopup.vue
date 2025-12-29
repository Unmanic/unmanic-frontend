<template>
  <q-dialog
    ref="dialogRef"
    backdrop-filter="grayscale(80%) blur(0.7px)"
    :position="mini ? 'standard' : (isMobile ? 'left' : 'standard')"
    :maximized="mini ? false : isMobile"
    :transition-show="mini ? 'scale' : (isMobile ? 'slide-right' : 'scale')"
    :transition-hide="mini ? 'scale' : (isMobile ? 'slide-left' : 'scale')"
    :persistent="mini || persistent"
    @shake="onShake"
    @hide="onDialogHide"
  >
    <q-card
      class="column no-wrap dialog-card"
      :class="{ 'mobile-layout': !mini && isMobile, 'mini-layout': mini }"
      :style="{ '--dialog-width': desktopWidth }"
      v-touch-swipe.touch.left="onSwipeLeft"
    >
      <!-- HEADER -->
      <q-card-section class="bg-card-head col-auto dialog-sticky-header q-py-sm">
        <div class="row items-center no-wrap">

          <!-- MOBILE/TABLET (lt-md OR mobile platform): Back/Close Left -->
          <template v-if="!mini && isMobile">
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
              :icon="action.icon"
              :label="action.label"
              :color="action.color || 'secondary'"
              outline
              :disable="action.disabled"
              :class="[{ 'dialog-attention': attentionActive }, index > 0 ? 'q-ml-xs' : 'q-ml-sm']"
              @click="triggerAction(action)"
            >
              <q-tooltip v-if="typeof action.tooltip === 'string'" class="bg-white text-primary">
                {{ action.tooltip }}
              </q-tooltip>
            </q-btn>

            <div class="text-h6 text-primary q-px-sm ellipsis col">
              {{ title }}
            </div>
          </template>

          <!-- DESKTOP (md+ AND desktop platform): Title Left, Close Right -->
          <template v-else>
            <div class="text-h6 text-primary col ellipsis">
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
              icon="close"
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
    default: '700px'
  },
  closeTooltip: {
    type: String,
    default: ''
  },
  persistent: {
    type: Boolean,
    default: false
  },
  mini: {
    type: Boolean,
    default: false
  },
  actions: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['ok', 'hide', 'action'])

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
  if (!props.persistent && !props.mini) {
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
  if (isMobile.value && !props.persistent && !props.mini) {
    hide()
  }
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
  z-index: 4001;
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
}

.dialog-card {
  width: var(--dialog-width);
  max-width: 95vw;
  height: calc(100vh - 48px);
  /* Apply custom drop-shadow */
  border: 1px solid color-mix(in srgb, var(--unmanic-grey-5), transparent 60%);
  border-radius: 4px;
  box-shadow: 2px 2px 10px rgba(189, 189, 189, 0.3);
}

.body--dark .dialog-card {
  box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.3);
}

.mini-layout {
  height: auto !important;
  max-height: 90vh;
}

/* Mobile view (XS and SM: < 1024px) */
@media (max-width: 1023px) {
  .dialog-card {
    width: 100vw;
    max-width: 92vw;
    height: 100%;
    /* Remove custom drop-shadow */
    border: none;
    border-radius: 0;
    box-shadow: none;
  }
}

.mobile-layout {
  width: 100vw !important;
  max-width: 92vw !important;
  height: 100% !important;
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
