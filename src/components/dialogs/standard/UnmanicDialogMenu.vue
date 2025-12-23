<template>
  <q-dialog
    ref="dialogRef"
    :position="isMobile ? 'left' : 'right'"
    :maximized="isMobile"
    :transition-show="isMobile ? 'slide-right' : 'slide-left'"
    :transition-hide="isMobile ? 'slide-left' : 'slide-right'"
    full-height
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
              flat dense round
              icon="arrow_back"
              color="grey-7"
              @click="hide"
            />

            <q-space/>

            <div class="text-h6 text-blue-10 q-px-sm ellipsis">
              {{ title }}
            </div>

            <q-space/>

            <!-- Action Button (Mobile) -->
            <q-btn
              v-if="action"
              :icon="action.icon"
              :label="action.label"
              flat dense
              color="primary"
              @click="triggerAction"
            />
            <!-- Spacer if no action, to center title if needed, or just let it flex -->
            <div v-else style="width: 28px;"></div>
          </template>

          <!-- DESKTOP HEADER (md+ AND desktop platform): Right Close Button -->
          <template v-else>
            <!-- Action Button (Desktop) -->
            <q-btn
              v-if="action"
              :icon="action.icon"
              :label="action.label"
              flat dense
              color="primary"
              class="q-mr-sm"
              @click="triggerAction"
            />

            <div class="text-h6 text-blue-10 q-mr-auto ellipsis">
              {{ title }}
            </div>

            <q-btn
              flat dense round
              icon="arrow_forward"
              color="grey-7"
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
    default: '900px'
  },
  action: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['ok', 'hide', 'action'])

const { isMobile } = useMobile()
const dialogRef = ref(null)

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
  if (isMobile.value) {
    hide()
  }
}

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

/* Intermediate size for Medium screens (1024px - 1439px) */
/* Only apply if NOT in forced mobile layout */
@media (min-width: 1024px) and (max-width: 1439px) {
  .dialog-card:not(.mobile-layout) {
    width: 750px;
  }
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
</style>