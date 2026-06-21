package expo.modules.wealthreservesms

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.provider.Telephony

class SmsBroadcastReceiver : BroadcastReceiver() {
  override fun onReceive(context: Context, intent: Intent) {
    if (intent.action != Telephony.Sms.Intents.SMS_RECEIVED_ACTION) return

    val messages = Telephony.Sms.Intents.getMessagesFromIntent(intent) ?: return
    if (messages.isEmpty()) return

    val address = messages[0].originatingAddress ?: ""
    val date = messages[0].timestampMillis
    val body = buildString {
      for (m in messages) append(m.messageBody ?: "")
    }
    if (body.isBlank()) return

    val deliveredLive = SmsEventBus.emit(address, body, date)
    if (!deliveredLive) {
      SmsStore.append(context.applicationContext, address, body, date)
    }
  }
}
