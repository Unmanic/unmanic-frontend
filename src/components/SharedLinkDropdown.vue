<template>
  <q-btn-dropdown
    v-if="canShow"
    flat
    dense
    no-caps
    content-class="unmanic-dropdown-menu"
    :label="currentLabel"
    :icon="currentIcon"
    color="white"
    content-style="z-index: 6002"
  >
    <q-list>
      <!-- Local Option -->
      <q-item clickable v-close-popup @click="setTarget('local')">
        <q-item-section avatar>
          <q-icon name="computer"/>
        </q-item-section>
        <q-item-section>
          <q-item-label>{{ localLabel }}</q-item-label>
          <q-item-label caption>{{ $t('components.sharedLinkDropdown.thisInstallation') }}</q-item-label>
        </q-item-section>
        <q-item-section side v-if="!isRemote">
          <q-icon name="check" color="primary"/>
        </q-item-section>
      </q-item>

      <q-separator/>

      <!-- Remote Options -->
      <q-item
        v-for="link in availableLinks"
        :key="link.uuid"
        clickable
        v-close-popup
        :disable="!link.available"
        @click="setTarget(link.uuid)"
      >
        <q-item-section avatar>
          <q-icon name="cloud" :color="link.available ? 'primary' : 'grey'"/>
        </q-item-section>
        <q-item-section>
          <q-item-label :class="!link.available ? 'text-grey' : ''">{{ link.name }}</q-item-label>
          <q-item-label caption v-if="link.address">{{ link.address }}</q-item-label>
        </q-item-section>
        <q-item-section side v-if="currentTarget === link.uuid">
          <q-icon name="check" color="primary"/>
        </q-item-section>
      </q-item>
    </q-list>
  </q-btn-dropdown>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { sharedLinksStore } from 'src/js/sharedLinksStore'
import unmanicGlobals from 'src/js/unmanicGlobals'

const { t } = useI18n()
const canShow = ref(false)

const currentTarget = computed(() => sharedLinksStore.target)
const availableLinks = computed(() => sharedLinksStore.availableLinks)
const localName = computed(() => sharedLinksStore.localName)

const isRemote = computed(() => currentTarget.value !== 'local')

const localLabel = computed(() => {
  return localName.value ? localName.value : t('components.sharedLinkDropdown.local')
})

const currentLabel = computed(() => {
  if (!isRemote.value) return localLabel.value
  const link = availableLinks.value.find(l => l.uuid === currentTarget.value)
  return link ? link.name : t('components.sharedLinkDropdown.unknownRemote')
})

const currentIcon = computed(() => {
  return isRemote.value ? 'cloud' : 'computer'
})

const setTarget = (target) => {
  sharedLinksStore.setTarget(target)
}

onMounted(async () => {
  try {
    const session = await unmanicGlobals.getUnmanicSession()
    if (session.level > 1) {
      await sharedLinksStore.fetchLinks()
      if (sharedLinksStore.availableLinks.length > 0) {
        canShow.value = true
      }
    }
  } catch (e) {
    console.error("Error initializing SharedLinkDropdown", e)
  }
})
</script>
