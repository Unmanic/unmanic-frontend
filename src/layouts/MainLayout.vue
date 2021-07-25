<template>
  <q-layout view="hHh lpR fFf">

    <q-header reveal elevated class="bg-dark text-white" height-hint="98">
      <q-toolbar>
        <q-toolbar-title>
          <q-avatar rounded size="2rem" font-size="82px">

            <img src="~assets/unmanic-logo-white.png">
          </q-avatar>
        </q-toolbar-title>

        <q-btn dense flat round icon="menu" @click="toggleRightDrawer"/>
      </q-toolbar>

      <q-tabs align="left">
        <q-route-tab to="/unmanic-dashboard" label="Dashboard" icon="home"/>
        <q-route-tab to="/unmanic-settings" label="Settings" icon="settings"/>
        <q-route-tab to="/unmanic-plugins" label="Plugins" icon="extension"/>
      </q-tabs>
    </q-header>

    <q-drawer v-model="rightDrawerOpen" side="right" overlay elevated>
      <!-- drawer content -->
    </q-drawer>

    <q-page-container>
      <router-view/>
    </q-page-container>

    <q-footer elevated class="bg-dark text-white">
      <q-toolbar>
        <q-toolbar-title>
          <div>
            <p class="text-subtitle1">
              <br>
              Version - {{ unmanicVersion }}
              <br>
              2018 © Unmanic by Josh Sunnex.
              ·
              <a title="Privacy Policy" href="#" target="_blank" data-toggle="modal"
                 data-target="#privacy-policy-popup">
                Privacy Policy
              </a>
            </p>
          </div>
        </q-toolbar-title>
      </q-toolbar>
    </q-footer>

  </q-layout>
</template>

<script>
import {ref} from 'vue';
import unmanicGlobals from "src/js/unmanicGlobals";
import {api} from "boot/axios";

export default {
  data() {
    return {
      unmanicVersion: ''
    }
  },
  setup() {
    const rightDrawerOpen = ref(false)

    return {
      rightDrawerOpen,
      toggleRightDrawer() {
        rightDrawerOpen.value = !rightDrawerOpen.value
      }
    }
  },
  created: function () {
    this.unmanicVersion = 'UNSET';
    if (unmanicGlobals.unmanicVersion === '') {
      api.get(unmanicGlobals.getUnmanicApiUrl('v2', 'version/read'))
        .then((response) => {
          this.unmanicVersion = response.data.version;
          unmanicGlobals.unmanicVersion = this.unmanicVersion;
        })
        .catch(() => {
        })
    } else {
      this.unmanicVersion = unmanicGlobals.unmanicVersion;
    }
  }
}
</script>
