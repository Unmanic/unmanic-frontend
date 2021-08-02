<template>
  <div class="bg-grey-1 text-grey-8">
    <q-tabs inline-label align="left" class="fit">
      <q-route-tab
        exact append
        to=""
        @click="setPage('general')"
        :label="$t('navigation.general')"
        icon="settings"
        style="min-width:190px"/>
      <q-route-tab
        exact append
        to=""
        @click="setPage('container')"
        :label="$t('navigation.container')"
        icon="fa fa-file-archive"
        style="min-width:190px"/>
      <q-route-tab
        exact append
        to=""
        @click="setPage('video')"
        :label="$t('navigation.videoEncoding')"
        icon="fa fa-file-video"
        style="min-width:190px"/>
      <q-route-tab
        exact append
        to=""
        @click="setPage('audio')"
        :label="$t('navigation.audioEncoding')"
        icon="fa fa-file-audio"
        style="min-width:190px"/>
      <q-route-tab
        exact append
        to=""
        @click="setPage('advanced')"
        :label="$t('navigation.advancedOptions')"
        icon="fa fa-unlock"
        style="min-width:190px"/>
      <q-route-tab
        to="/unmanic-settings-plugins"
        :label="$t('navigation.plugins')"
        icon="extension"
        style="min-width:190px"/>
    </q-tabs>
  </div>
</template>

<script>
export default {
  // name: 'ComponentName',
  setup() {
    return {}
  },
  props: ['value'],
  methods: {
    setPage(value) {
      this.$emit('page', value)
    }
  },
}
</script>
