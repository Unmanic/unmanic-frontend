<template>
  <q-card class="fullscreen">
    <q-card-section class="bg-grey-2">
      <div class="row items-center no-wrap">
        <div class="col-auto">
          <q-btn
            color="grey-7"
            dense
            round
            flat
            icon="arrow_back" v-close-popup>
            <q-tooltip class="bg-white text-primary">{{ $t('tooltips.back') }}</q-tooltip>
          </q-btn>
        </div>
        <div class="col">
          <div class="text-h6 text-secondary">
            <q-icon name="extension"/>
            {{ $t('headers.pluginFlow') }}
          </div>
        </div>
      </div>
    </q-card-section>

    <q-card-section class="q-pa-none">
      <q-page
        style="width: 100%">
        <iframe
          style="width: 100%"
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
    </q-card-section>
  </q-card>
</template>

<script>
export default {
  name: 'PluginFlowIframe',
  data() {
    return {
      page: '',
      iframeSrc: '/plugin-flow/',
      iframeHeight: '0px',
    };
  },
  created() {
    console.debug('Component has been created!');
    window.addEventListener('message', this.resizeIframe);
  },
  unmounted() {
    console.debug('Component has been destroyed!');
    window.removeEventListener('message', this.resizeIframe);
  },
  methods: {
    resizeIframe() {
      console.debug('Plugin flow iframe resized')
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
    }
  }
}
</script>
