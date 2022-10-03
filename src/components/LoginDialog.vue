<template>
  <q-dialog
    ref="loginDialogRef"
    v-model="showDialog">
    <q-card>
      <q-card-section class="row items-center q-pb-sm">
        <div class="text-h6">{{ $t('headers.login') }}</div>
        <q-space/>
        <q-btn icon="close" flat round dense v-close-popup/>
      </q-card-section>

      <q-separator/>

      <q-card-section style="max-height: 50vh" class="scroll">
        <q-list>

          <q-item
            clickable v-ripple
            @click="loginWithGithub">
            <q-item-section avatar>
              <q-icon color="grey-8" name="fab fa-github"/>
            </q-item-section>

            <q-item-section>{{ $t('navigation.loginWithGitHub') }}</q-item-section>
          </q-item>

          <q-item
            clickable v-ripple
            @click="loginWithDiscord">
            <q-item-section avatar>
              <q-icon color="grey-8" name="fab fa-discord"/>
            </q-item-section>

            <q-item-section>{{ $t('navigation.loginWithDiscord') }}</q-item-section>
          </q-item>

          <q-item
            clickable v-ripple
            @click="loginWithPatreon">
            <q-item-section avatar>
              <q-icon color="grey-8" name="fab fa-patreon"/>
            </q-item-section>

            <q-item-section>{{ $t('navigation.loginWithPatreon') }}</q-item-section>
          </q-item>

        </q-list>
      </q-card-section>

      <q-separator/>
    </q-card>
  </q-dialog>
</template>

<script>
import { ref } from 'vue'
import unmanicGlobals from "src/js/unmanicGlobals";

export default {
  name: 'LoginDialog',
  props: {},
  emits: [
    // REQUIRED
    'ok', 'hide', 'path'
  ],
  methods: {
    // following method is REQUIRED
    // (don't change its name --> "show")
    show() {
      this.$refs.loginDialogRef.show();
    },

    // following method is REQUIRED
    // (don't change its name --> "hide")
    hide() {
      this.$refs.loginDialogRef.hide();
    },

    onDialogHide() {
      // required to be emitted
      // when QDialog emits "hide" event
      this.$emit('ok', {})
      this.$emit('hide')
    },

    loginWithPatreon() {
      unmanicGlobals.loginWithPatreon(this.$t)
    },

    loginWithGithub() {
      unmanicGlobals.loginWithGitHub(this.$t)
    },

    loginWithDiscord() {
      unmanicGlobals.loginWithDiscord(this.$t)
    }
  },
  watch: {},
  data: function () {
    return {
      showDialog: ref(false),
    }
  }
}
</script>
