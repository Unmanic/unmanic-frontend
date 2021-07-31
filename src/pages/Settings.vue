<template>
  <div class="bg-grey-1 text-grey-8">
    <q-tabs inline-label align="left" class="fit">
      <q-route-tab
        @click="setpage('general')"
        :label="$t('navigation.general')"
        icon="settings"
        style="min-width:190px"/>
      <q-route-tab
        @click="setpage('container')"
        :label="$t('navigation.container')"
        icon="fa fa-file-archive"
        style="min-width:190px"/>
      <q-route-tab
        @click="setpage('video')"
        :label="$t('navigation.videoEncoding')"
        icon="fa fa-file-video"
        style="min-width:190px"/>
      <q-route-tab
        @click="setpage('audio')"
        :label="$t('navigation.audioEncoding')"
        icon="fa fa-file-audio"
        style="min-width:190px"/>
      <q-route-tab
        @click="setpage('advanced')"
        :label="$t('navigation.advancedOptions')"
        icon="fa fa-unlock"
        style="min-width:190px"/>
      <q-route-tab
        @click="setpage('plugins')"
        :label="$t('navigation.plugins')"
        icon="extension"
        style="min-width:190px"/>
    </q-tabs>
  </div>
  <q-page>
    <iframe
      id="this-iframe"
      class="this-iframe"
      ref="iframeRef"
      :src="iframeSrc"
      @load="resizeIframe"
      scrolling="no"
      frameborder="0"
      seamless="seamless"
      allowtransparency="true"
      :height="iframeHeight">
      Your browser is not supported. Sorry.
    </iframe>
  </q-page>
</template>

<script>

export default {
  data() {
    return {
      iframeSrc: '/settings/',
      iframeHeight: '0px',
    };
  },
  created() {
    console.debug('Component has been created!');
    window.addEventListener('message', this.resizeIframe);
    this.iframeSrc = '/settings/';
  },
  unmounted() {
    console.debug('Component has been destroyed!');
    window.removeEventListener('message', this.resizeIframe);
  },
  methods: {
    resizeIframe() {
      console.debug('Settings iframe resized')
      if (this.$refs.iframeRef) {
        if (this.$refs.iframeRef.contentWindow) {
          if (this.$refs.iframeRef.contentWindow.document) {
            if (this.$refs.iframeRef.contentWindow.document.body) {
              let newHeight = this.$refs.iframeRef.contentWindow.document.body.scrollHeight;
              this.iframeHeight = newHeight;
            }
          }
        }
      }
    },
    setpage(pageName) {
      this.iframeSrc = '/settings/?step=' + pageName;
    }
  }
}
</script>

<style>
.this-iframe {
  display: block;
  background: #000;
  border: none;
  /*height: 100vh;*/
  width: 100vw;
  z-index: 999999;
}
</style>
