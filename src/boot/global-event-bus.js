/*
* References:
*   https://github.com/quasarframework/quasar/discussions/9220
*   https://v3.vuejs.org/guide/migration/events-api.html#event-bus
* */
import emitter from 'tiny-emitter/instance'

export default ({ app }) => {
  app.config.globalProperties.$global = {
    $on: (...args) => emitter.on(...args),
    $once: (...args) => emitter.once(...args),
    $off: (...args) => emitter.off(...args),
    $emit: (...args) => emitter.emit(...args)
  }
}
