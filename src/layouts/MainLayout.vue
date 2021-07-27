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

      <!--TODO: Remove styling once new frontend is 100% in use-->
      <q-tabs inline-label align="left" class="fit" style="min-height:64px">
        <q-route-tab to="/unmanic-dashboard" :label="$t('navigation.dashboard')" icon="home" style="min-width:190px"/>
<!--        <q-route-tab to="/unmanic-settings" :label="$t('navigation.settings')" icon="settings"/>
        <q-route-tab to="/unmanic-plugins" :label="$t('navigation.plugins')" icon="extension"/>-->
        <q-route-tab to="/settings/" exact :label="$t('navigation.settings')" icon="settings" style="min-width:190px"/>
        <q-route-tab to="/plugins/" exact :label="$t('navigation.plugins')" icon="extension" style="min-width:190px"/>
      </q-tabs>
    </q-header>

    <q-drawer v-model="rightDrawerOpen" side="right" overlay elevated>
      <Drawer/>
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
import { ref } from 'vue';
import unmanicGlobals from "src/js/unmanicGlobals";
import Drawer from "components/Drawer";

export default {
  components: { Drawer },
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
    unmanicGlobals.getUnmanicVersion().then((version) => {
      this.unmanicVersion = version;
    })
  }
}
</script>
