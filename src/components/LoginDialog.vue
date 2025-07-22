<template>
  <q-dialog ref="loginDialogRef" v-model="showDialog">
    <q-card>
      <q-card-section class="row items-center q-pb-sm">
        <div class="text-h6">{{ $t('headers.login') }}</div>
        <q-space/>
        <q-btn icon="close" flat round dense v-close-popup/>
      </q-card-section>

      <q-separator/>

      <q-card-section>
        <div>
          <p>
            Unmanic is a free and open‑source product brought to you by Streaming Tech.
            While basic features can be used without logging in, signing in unlocks additional features if you support
            any of the Streaming Tech open‑source projects.
          </p>
          <p>
            Supporting these projects is simple:
          </p>
          <ul>
            <li>
              <strong>GitHub:</strong> Contributing—even a small documentation fix—on our repositories
              (github.com/Unmanic, github.com/Steam-Headless, or github.com/DeckSetting) bumps your account to a
              supporter tier for a month.
            </li>
            <li>
              <strong>Discord:</strong> Being active and helpful in our Discord server earns reputation points and
              upgrades your account to a supporter tier.
            </li>
            <li>
              <strong>Patreon:</strong> Financially backing the project on Patreon unlocks exclusive channels in Discord
              for discussing future developments and elevates your account to a supporter tier.
            </li>
          </ul>
          <p>
            Your unique login code has been generated below. Please click the button to open a new window where you can
            enter this code to authenticate and link this installation to your account.
          </p>
          <div class="row justify-center">
            <q-spinner v-if="!userCode" class="text-h3 q-mt-md q-mb-md"/>
            <div v-else class="text-h3 q-mt-md q-mb-md">{{ userCode }}</div>
          </div>
          <q-btn
            :disabled="!verificationUri"
            dense
            class="full-width q-mt-sm q-ml-lg"
            color="primary"
            label="Login with Streaming Tech"
            icon-right="open_in_new"
            @click="loginRemotely"
          />
          <div class="q-mt-md">
            <q-linear-progress :value="timerProgress" color="primary" size="10px" :class="userCode ? '' : 'disabled' "/>
            <div class="text-center q-mt-sm" :class="userCode ? '' : 'invisible' ">
              Time remaining: {{ formattedTime }}
            </div>
          </div>
          <p class="q-pt-lg text-caption">
            <strong>Note:</strong> Streaming Tech is the umbrella organisation for all open-source GitHub projects by
            Josh Sunnex (Josh.5).
            <br> Sponsorship funds (e.g., via Patreon) are used to hire or contract outside help, maintain
            infrastructure, and fuel my coffee addiction.
            <br> Supporting Unmanic also sustains our wider free and open-source development.
          </p>
        </div>
      </q-card-section>

      <q-separator/>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { onMounted, ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import unmanicGlobals, { getUnmanicApiUrl } from 'src/js/unmanicGlobals'
import { useRouter } from "vue-router";
import axios from "axios";

const router = useRouter()
const { t } = useI18n()

const props = defineProps({})

const emit = defineEmits(['ok', 'hide', 'path'])

// Reactive references
const showDialog = ref(false)
const userCode = ref('')
const verificationUri = ref('')
const loginDialogRef = ref(null)
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
  loginDialogRef.value.show()
}

function hide() {
  loginDialogRef.value.hide()
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

onMounted(() => {
  getAppAuthCode()
})
</script>
