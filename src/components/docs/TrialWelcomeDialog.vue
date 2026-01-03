<template>
  <UnmanicDialogPopup
    ref="dialogRef"
    :title="$t('headers.welcomeToUnmanic')"
    width="700px"
    :mini="true"
    @hide="onDialogHide"
  >
    <div class="trial-welcome q-pa-md">
      <div class="trial-welcome-hero">
        <div class="trial-welcome-kicker text-overline text-secondary">
          {{ $t('components.docs.trialWelcome.kicker') }}
        </div>
        <div class="text-h5 text-primary">
          {{ $t('components.docs.trialWelcome.heroTitle') }}
        </div>
        <div class="text-body1 q-mt-xs">
          {{ $t('components.docs.trialWelcome.welcomeMessage') }}
        </div>
        <div class="row q-gutter-xs q-mt-sm">
          <div class="trial-welcome-pill">
            <q-icon name="bolt" size="16px" class="q-mr-xs" />
            <span>{{ $t('components.docs.trialWelcome.trialInfo') }}</span>
          </div>
        </div>
      </div>

      <div class="row q-col-gutter-md q-mt-md">
        <div class="col-12 col-md-6">
          <div class="trial-welcome-section-title text-primary">
            {{ $t('components.docs.trialWelcome.centralTitle') }}
          </div>
          <p class="text-body2 q-mt-xs">
            {{ $t('components.docs.trialWelcome.centralBody') }}
            <ul class="trial-welcome-list">
                <li>{{ $t('components.docs.trialWelcome.centralPoints.logs') }}</li>
                <li>{{ $t('components.docs.trialWelcome.centralPoints.grafana') }}</li>
                <li>{{ $t('components.docs.trialWelcome.centralPoints.dashboards') }}</li>
            </ul>
          </p>
          <UnmanicStandardButton
            class="q-mt-sm"
            :label="$t('components.docs.trialWelcome.centralLinkLabel')"
            icon-right="open_in_new"
            href="https://central.unmanic.app"
            target="_blank"
            rel="noopener"
          />
        </div>

        <div class="col-12 col-md-6">
          <div class="trial-welcome-section-title text-primary">
            {{ $t('components.docs.trialWelcome.supportTitle') }}
          </div>
          <p class="text-body2 q-mt-xs">
            {{ $t('components.docs.trialWelcome.supportBody') }}
          </p>
          <div class="row q-gutter-sm q-mt-sm">
            <UnmanicStandardButton
              :label="$t('components.docs.trialWelcome.docsLinkLabel')"
              icon-right="open_in_new"
              href="https://docs.unmanic.app/docs/"
              target="_blank"
              rel="noopener"
            />
            <UnmanicStandardButton
              :label="$t('components.docs.trialWelcome.discordLinkLabel')"
              icon-right="open_in_new"
              href="https://unmanic.app/discord"
              target="_blank"
              rel="noopener"
            />
          </div>
        </div>
      </div>

      <div class="trial-welcome-limitations q-mt-md">
        <div class="text-subtitle2 text-primary">
          {{ $t('components.docs.trialWelcome.limitationsTitle') }}
        </div>
        <p class="text-body2 q-mt-xs">
          {{ $t('components.docs.trialWelcome.limitationsBody') }}
        </p>
        <UnmanicStandardButton
          class="q-mt-sm"
          :label="$t('components.docs.trialWelcome.limitationsLinkLabel')"
          icon-right="open_in_new"
          href="https://docs.unmanic.app/#feature-comparison"
          target="_blank"
          rel="noopener"
        />
      </div>

      <p class="q-mt-lg text-center text-italic">
        {{ $t('components.docs.trialWelcome.enjoy') }}
      </p>
    </div>
  </UnmanicDialogPopup>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import unmanicGlobals, { getUnmanicApiUrl } from 'src/js/unmanicGlobals'
import UnmanicDialogPopup from 'components/ui/dialogs/UnmanicDialogPopup.vue'
import UnmanicStandardButton from 'components/ui/buttons/UnmanicStandardButton.vue'

const dialogRef = ref(null)

const show = () => {
  if (dialogRef.value) {
    dialogRef.value.show()
  }
}

const hide = () => {
  if (dialogRef.value) {
    dialogRef.value.hide()
  }
}

const onDialogHide = () => {
  // Mark as viewed in settings
  const data = {
    settings: {
      trial_welcome_viewed: true
    }
  }
  axios({
    method: 'post',
    url: getUnmanicApiUrl('v2', 'settings/write'),
    data: data
  }).catch((error) => {
    console.error('Failed to save trial_welcome_viewed setting', error)
  })

  // TODO: Trigger intro.js guide here
}

const checkAndShow = async () => {
  try {
    // 1. Get Session Level
    const session = await unmanicGlobals.getUnmanicSession()
    if (session.level !== 9) {
      return // Not a trial user
    }

    // 2. Get Settings to check if already viewed
    const response = await axios.get(getUnmanicApiUrl('v2', 'settings/read'))
    const settings = response.data.settings

    // Check if explicitly true (it might be undefined if never set)
    if (settings.trial_welcome_viewed === true) {
      return // Already viewed
    }

    // 3. Show Dialog
    show()

  } catch (error) {
    console.error('Error checking trial welcome eligibility', error)
  }
}

onMounted(() => {
  checkAndShow()
})

defineExpose({
  show,
  hide
})
</script>

<style scoped>
.trial-welcome-hero {
  border-radius: 12px;
  padding: 20px;
  border: 1px solid color-mix(in srgb, var(--q-secondary), transparent 70%);
  background: linear-gradient(
    135deg,
    color-mix(in srgb, var(--q-secondary), transparent 85%),
    color-mix(in srgb, var(--q-info), transparent 90%)
  );
}

.trial-welcome-kicker {
  letter-spacing: 0.08em;
}

.trial-welcome-pill {
  display: inline-flex;
  align-items: center;
  padding: 6px 12px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--q-secondary), transparent 88%);
  color: var(--q-secondary);
  font-size: 0.9rem;
}

.trial-welcome-section-title {
  font-size: 1rem;
  font-weight: 600;
}

.trial-welcome-list {
  padding-left: 18px;
  margin: 8px 0 0;
}

.trial-welcome-limitations {
  border-top: 1px solid color-mix(in srgb, var(--q-secondary), transparent 85%);
  padding-top: 12px;
}

@media (max-width: 1023px) {
  .trial-welcome-hero {
    padding: 16px;
  }
}
</style>
