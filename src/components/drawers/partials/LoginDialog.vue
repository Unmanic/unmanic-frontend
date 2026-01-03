<template>
  <UnmanicDialogPopup
    ref="dialogRef"
    :title="$t('headers.login')"
    width="720px"
    :mini="true"
    @hide="onDialogHide"
  >
    <div class="q-pa-md">
      <p>
        {{ $t('components.loginDialog.intro') }}
      </p>
      <p>
        {{ $t('components.loginDialog.supportIntro') }}
      </p>
      <ul>
        <li>
          <strong>{{ $t('components.loginDialog.support.github.title') }}</strong>
          {{ $t('components.loginDialog.support.github.body') }}
        </li>
        <li>
          <strong>{{ $t('components.loginDialog.support.discord.title') }}</strong>
          {{ $t('components.loginDialog.support.discord.body') }}
        </li>
        <li>
          <strong>{{ $t('components.loginDialog.support.patreon.title') }}</strong>
          {{ $t('components.loginDialog.support.patreon.body') }}
        </li>
      </ul>
      <p>
        {{ $t('components.loginDialog.codePrompt') }}
      </p>
      <div class="row justify-center">
        <q-spinner v-if="!userCode" class="text-h3 q-mt-md q-mb-md"/>
        <span
          v-else
          class="text-h3 q-mt-md q-mb-md login-code-text"
          @click="copyUserCode"
        >
          {{ userCode }}
          <q-tooltip class="bg-white text-primary no-wrap">
            {{ $t('navigation.copy') }}
          </q-tooltip>
        </span>
      </div>
      <q-btn
        :disabled="!verificationUri"
        dense
        class="full-width q-mt-sm"
        color="primary"
        :label="$t('components.loginDialog.loginButton')"
        icon-right="open_in_new"
        @click="loginRemotely"
      />
      <div class="q-mt-md">
        <q-linear-progress :value="timerProgress" color="primary" size="10px" :class="userCode ? '' : 'disabled' "/>
        <div class="text-center q-mt-sm" :class="userCode ? '' : 'invisible' ">
          {{ $t('components.loginDialog.timeRemaining', { time: formattedTime }) }}
        </div>
      </div>
      <p class="q-pt-lg text-caption">
        <strong>{{ $t('components.loginDialog.noteTitle') }}</strong>
        {{ $t('components.loginDialog.noteLineOne') }}
        <br>
        {{ $t('components.loginDialog.noteLineTwo') }}
        <br>
        {{ $t('components.loginDialog.noteLineThree') }}
      </p>
    </div>
  </UnmanicDialogPopup>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import unmanicGlobals, { getUnmanicApiUrl } from 'src/js/unmanicGlobals'
import axios from "axios"
import { copyToClipboard, useQuasar } from 'quasar'
import UnmanicDialogPopup from 'components/ui/dialogs/UnmanicDialogPopup.vue'

const { t } = useI18n()
const $q = useQuasar()

const emit = defineEmits(['ok', 'hide', 'path'])

// Reactive references
const userCode = ref('')
const verificationUri = ref('')
const dialogRef = ref(null)
const remainingTime = ref(1)
const totalTime = ref(1)
let timerInterval = null

// Computed properties for progress bar and timer text
const timerProgress = computed(() =>
  totalTime.value > 0 ? remainingTime.value / totalTime.value : 0
)
const formattedTime = computed(() => {
  const minutes = Math.floor(remainingTime.value / 60)
  const seconds = remainingTime.value % 60
  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`
})

function show() {
  getAppAuthCode()
  if (dialogRef.value) {
    dialogRef.value.show()
  }
}

function hide() {
  if (dialogRef.value) {
    dialogRef.value.hide()
  }
}

function onDialogHide() {
  emit('ok', {})
  emit('hide')
}

function startCountdown(expiresIn) {
  totalTime.value = expiresIn
  remainingTime.value = expiresIn
  if (timerInterval) clearInterval(timerInterval)
  timerInterval = setInterval(() => {
    if (remainingTime.value > 0) {
      remainingTime.value--
      // Check session every 5 seconds
      if (remainingTime.value % 5 === 0) {
        axios({
          method: 'get',
          url: getUnmanicApiUrl('v2', 'session/state')
        }).then((response) => {
          console.log(response.data.level)
          if (response.data && response.data.level && response.data.level > 0) {
            if (response.data.level !== 9) {
              location.reload();
            } else {
              console.log("Detected Trial Session. Ignoring.")
            }
          }
        }).catch(() => {
          console.error("Failed to get session state.")
        })
      }
    } else {
      clearInterval(timerInterval)
      hide()
    }
  }, 1000)
}

function setAuthCodeFromData(data) {
  userCode.value = data.user_code
  verificationUri.value = data.verification_uri
  startCountdown(data.expires_in)
}

function getAppAuthCode() {
  unmanicGlobals.loginGetAppAuthCode(t, setAuthCodeFromData)
}

function loginRemotely() {
  if (verificationUri.value) {
    window.open(verificationUri.value, '_blank')
  }
}

function copyUserCode() {
  if (!userCode.value) {
    return
  }
  copyToClipboard(userCode.value)
    .then(() => {
      $q.notify({
        color: 'secondary',
        position: 'top',
        message: t('notifications.copied'),
        timeout: 200
      })
    })
    .catch(() => {
      // fail
    })
}

defineExpose({
  show,
  hide
})
</script>
