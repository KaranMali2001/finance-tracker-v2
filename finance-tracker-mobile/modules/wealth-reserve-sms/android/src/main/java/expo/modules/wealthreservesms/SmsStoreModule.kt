package expo.modules.wealthreservesms

import expo.modules.kotlin.exception.Exceptions
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class SmsStoreModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("SmsStore")

    AsyncFunction("drainPending") {
      val context = appContext.reactContext ?: throw Exceptions.ReactContextLost()
      SmsStore.drain(context.applicationContext)
    }

    AsyncFunction("listInbox") { maxCount: Int ->
      val context = appContext.reactContext ?: throw Exceptions.ReactContextLost()
      SmsInbox.list(context.applicationContext, maxCount)
    }
  }
}
