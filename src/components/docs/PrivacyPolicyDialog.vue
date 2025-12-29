<template>
  <UnmanicDialogWindow
    ref="dialogRef"
    :title="$t('headers.privacyPolicy')"
    @hide="onDialogHide"
  >
    <div class="privacy-dialog-content">
      <q-inner-loading :showing="isLoading">
        <q-spinner color="secondary" size="32px"/>
      </q-inner-loading>
      <div class="q-pa-md markdown-dialog-content privacy-dialog-body" v-html="privacyPolicyHtml"></div>
    </div>
  </UnmanicDialogWindow>
</template>

<script setup>
import { ref } from 'vue'
import UnmanicDialogWindow from 'components/ui/dialogs/UnmanicDialogWindow.vue'
import unmanicGlobals from 'src/js/unmanicGlobals'
import { markdownToHTML } from 'src/js/markupParser'

const emit = defineEmits(['hide'])

const dialogRef = ref(null)
const isLoading = ref(false)
const privacyPolicyHtml = ref('')

const show = () => {
  if (!dialogRef.value) {
    return
  }
  isLoading.value = true
  privacyPolicyHtml.value = ''
  dialogRef.value.show()
  unmanicGlobals.getUnmanicPrivacyPolicy()
    .then((privacyPolicy) => {
      privacyPolicyHtml.value = markdownToHTML(privacyPolicy)
    })
    .finally(() => {
      isLoading.value = false
    })
}

const hide = () => {
  if (dialogRef.value) {
    dialogRef.value.hide()
  }
}

const onDialogHide = () => {
  emit('hide')
}

defineExpose({
  show,
  hide
})
</script>

<style scoped>
.privacy-dialog-content {
  position: relative;
  min-height: 160px;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.privacy-dialog-body {
  overflow: auto;
  flex: 1;
  min-height: 0;
}

.markdown-dialog-content :deep(h1) {
  font-size: 2.125rem;
  line-height: 2.125rem;
}

.markdown-dialog-content :deep(h2) {
  font-size: 1.75rem;
  line-height: 1.75rem;
}

.markdown-dialog-content :deep(h3) {
  font-size: 1.5rem;
  line-height: 1.5rem;
}

.markdown-dialog-content :deep(h4) {
  font-size: 1.25rem;
  line-height: 1.5rem;
}

.markdown-dialog-content :deep(h5) {
  font-size: 1rem;
  line-height: 1.5rem;
}

.markdown-dialog-content :deep(h6) {
  font-size: 1rem;
  line-height: 1.5rem;
}
</style>
