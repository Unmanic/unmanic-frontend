<template>
  <q-dialog
    ref="dialogRef"
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
            />

            <q-btn
              v-if="action"
              :icon="action.icon"
              :label="action.label"
              :color="actionColor"
              outline
              :class="{ 'dialog-attention': attentionActive }"
              @click="triggerAction"
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
              outline
              v-if="action"
              :icon="action.icon"
              :label="action.label"
              :color="actionColor"
              :class="{ 'dialog-attention': attentionActive }"
              class="q-mr-sm"
              @click="triggerAction"
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
              <q-tooltip class="bg-white text-primary">{{ $t('tooltips.close') }}</q-tooltip>
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
  action: {
    type: Object,
    default: null
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

const actionColor = computed(() => props.action?.color || 'secondary')

const triggerAction = () => {
  if (props.action) {
    const eventName = props.action.emit || 'action'
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
  z-index: 100;
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
}

.dialog-card {
  width: var(--dialog-width);
  max-width: 100vw;
}

/* Mobile view (XS and SM: < 1024px) OR forced mobile layout */
@media (max-width: 1023px) {
  .dialog-card {
    width: 100vw;
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
