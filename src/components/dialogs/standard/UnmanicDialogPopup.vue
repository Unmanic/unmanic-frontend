<template>
  <q-dialog
    ref="dialogRef"
    :position="isMobile ? 'left' : 'standard'"
    :maximized="isMobile"
    :transition-show="isMobile ? 'slide-right' : 'scale'"
    :transition-hide="isMobile ? 'slide-left' : 'scale'"
    :persistent="persistent"
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
              @click="hide"
            >
              <q-tooltip class="bg-white text-primary no-wrap" style="max-width: none;">
                {{ closeTooltip || $t('tooltips.close') }}
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
              outline dense round
              icon="close"
              color="grey-7"
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
  }
})

const emit = defineEmits(['ok', 'hide'])

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
  if (isMobile.value && !props.persistent) {
    hide()
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
  max-width: 95vw;
  height: calc(100vh - 48px);
}

/* Mobile view (XS and SM: < 1024px) */
@media (max-width: 1023px) {
  .dialog-card {
    width: 100vw;
    max-width: 92vw;
    height: 100%;
  }
}

.mobile-layout {
  width: 100vw !important;
  max-width: 92vw !important;
  height: 100% !important;
}
</style>
