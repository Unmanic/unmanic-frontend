<template>
  <SettingsNav v-bind:iframeSrc="iframeSrc" v-on:page="setIframeSrc"/>
  <q-page>
    <iframe
      v-if="page !== 'plugins'"
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

import SettingsNav from "components/SettingsNav";

export default {
  components: { SettingsNav },
  data() {
    return {
      page: '',
      iframeSrc: '/settings/',
      iframeHeight: '0px',
    };
  },
  created() {
    console.debug('Component has been created!');
    window.addEventListener('message', this.resizeIframe);
    this.setInitialPageFromParams();
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
    setIframeSrc(pageName) {
      this.page = pageName
      this.iframeSrc = '/settings/?step=' + pageName;
      this.$router.push('/unmanic-settings?step=' + pageName)
    },
    setInitialPageFromParams() {
      console.log(this.$route.query)
      if (typeof this.$route.query !== 'undefined') {
        if (typeof this.$route.query.step !== 'undefined') {
          this.iframeSrc = '/settings/?step=' + this.$route.query.step;
          return
        }
      }
      this.iframeSrc = '/settings/?step=general';
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
