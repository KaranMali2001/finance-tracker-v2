package expo.modules.wealthreservesms

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class SmsReceiverModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("SmsReceiver")

    Events("onSmsReceived")

    Function("startListening") {
      SmsEventBus.setListener { address, body, date ->
        sendEvent(
          "onSmsReceived",
          mapOf(
            "address" to address,
            "body" to body,
            "date" to date
          )
        )
      }
    }

    Function("stopListening") {
      SmsEventBus.setListener(null)
    }

    OnDestroy {
      SmsEventBus.setListener(null)
    }
  }
}
