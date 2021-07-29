<template>
  <q-layout view="hHh lpR fFf">

    <q-header reveal elevated class="bg-primary text-white" height-hint="98">
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

    <q-footer
      elevated
      class="bg-primary text-white gt-sm">
      <q-toolbar>
        <q-toolbar-title>
          <FooterData />
        </q-toolbar-title>
      </q-toolbar>
    </q-footer>

  </q-layout>
</template>

<script>
import { ref } from 'vue';
import Drawer from "components/Drawer";
import FooterData from "components/FooterData";

export default {
  components: { Drawer, FooterData },
  setup() {
    const rightDrawerOpen = ref(false)

    return {
      rightDrawerOpen,
      toggleRightDrawer() {
        rightDrawerOpen.value = !rightDrawerOpen.value
      }
    }
  }
}
</script>

<style>

</style>
