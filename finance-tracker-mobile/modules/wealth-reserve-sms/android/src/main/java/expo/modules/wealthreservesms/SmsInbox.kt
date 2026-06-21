package expo.modules.wealthreservesms

import android.content.Context
import android.provider.Telephony

object SmsInbox {
  fun list(context: Context, maxCount: Int): List<Map<String, String>> {
    val out = ArrayList<Map<String, String>>()
    val projection = arrayOf(
      Telephony.Sms._ID,
      Telephony.Sms.ADDRESS,
      Telephony.Sms.BODY,
      Telephony.Sms.DATE,
      Telephony.Sms.DATE_SENT
    )
    val cursor = context.contentResolver.query(
      Telephony.Sms.Inbox.CONTENT_URI,
      projection,
      null,
      null,
      "${Telephony.Sms.DATE} DESC LIMIT $maxCount"
    ) ?: return out

    cursor.use { c ->
      val idIdx = c.getColumnIndexOrThrow(Telephony.Sms._ID)
      val addrIdx = c.getColumnIndexOrThrow(Telephony.Sms.ADDRESS)
      val bodyIdx = c.getColumnIndexOrThrow(Telephony.Sms.BODY)
      val dateIdx = c.getColumnIndexOrThrow(Telephony.Sms.DATE)
      val dateSentIdx = c.getColumnIndexOrThrow(Telephony.Sms.DATE_SENT)
      while (c.moveToNext()) {
        out.add(
          mapOf(
            "_id" to c.getString(idIdx).orEmpty(),
            "address" to c.getString(addrIdx).orEmpty(),
            "body" to c.getString(bodyIdx).orEmpty(),
            "date" to c.getString(dateIdx).orEmpty(),
            "date_sent" to c.getString(dateSentIdx).orEmpty()
          )
        )
      }
    }
    return out
  }
}
