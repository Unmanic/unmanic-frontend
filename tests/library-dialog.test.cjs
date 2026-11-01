const assert = require('node:assert/strict')
const { test } = require('node:test')
const { readFileSync } = require('node:fs')
const { parse, compileScript } = require('@vue/compiler-sfc')
const { parse: parseJavaScript } = require('@babel/parser')
const vue = require('vue')

// Execute the compiled dialog setup without a browser or application services.
function loadDialog(requests) {
  const source = readFileSync('src/components/settings/library/LibraryConfigDialog.vue', 'utf8')
  const { descriptor } = parse(source)
  let script = compileScript(descriptor, { id: 'library-dialog-test' }).content
  const axios = async ({ data }) => {
    requests.push(data.id)
    return { data: {
      library_config: { id: data.id, name: 'Library ' + data.id, path: '/library',
        locked: false, enable_remote_only: false, enable_scanner: true,
        enable_inotify: false, enable_web_scanner: false, wait_for_library_ids: [2],
        priority_score: 0, tags: [] },
      plugins: { enabled_plugins: [] }
    } }
  }
  const modules = {
    vue,
    axios: { default: axios },
    quasar: { useQuasar: () => ({}), Loading: {} },
    'vue-i18n': { useI18n: () => ({ t: key => key }) },
    'src/composables/useMobile': { useMobile: () => ({ isMobile: vue.ref(false) }) },
    'src/js/unmanicGlobals': { getUnmanicApiUrl: () => '/settings/library/read' }
  }
  const names = []
  const values = []
  const imports = parseJavaScript(script, { sourceType: 'module' }).program.body
    .filter(node => node.type === 'ImportDeclaration')
  for (const declaration of imports) {
    const module = modules[declaration.source.value] || { default: {} }
    for (const specifier of declaration.specifiers) {
      names.push(specifier.local.name)
      values.push(module[specifier.imported?.name || 'default'])
    }
  }
  for (const declaration of imports.reverse()) {
    script = script.slice(0, declaration.start) + script.slice(declaration.end)
  }
  return new Function(...names, script.replace('export default', 'return'))(...values)
}

test('Library dialog initializes and reloads when another Library opens', async () => {
  const requests = []
  const component = loadDialog(requests)
  const props = vue.reactive({ libraryId: 9 })
  const dialog = component.setup(props, { expose() {}, emit() {} })
  await vue.nextTick()
  assert.equal(dialog.currentID.value, 9)
  assert.equal(dialog.name.value, 'Library 9')
  assert.deepEqual(dialog.waitForLibraryIds.value, [2])
  assert.ok(dialog.originalSnapshot.value)
  assert.equal(dialog.isDirty.value, false)
  props.libraryId = 14
  await vue.nextTick()
  await vue.nextTick()
  assert.deepEqual(requests, [9, 14])
  assert.equal(dialog.currentID.value, 14)
  assert.equal(dialog.name.value, 'Library 14')
  assert.equal(dialog.isDirty.value, false)
})
