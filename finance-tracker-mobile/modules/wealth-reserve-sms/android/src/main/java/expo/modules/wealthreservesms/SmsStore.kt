package expo.modules.wealthreservesms

import android.content.Context
import org.json.JSONArray
import org.json.JSONObject

object SmsStore {
  private const val PREFS = "wealth_reserve_sms_store"
  private const val KEY = "pending"
  private const val MAX_ENTRIES = 200

  @Synchronized
  fun append(context: Context, address: String, body: String, date: Long) {
    val prefs = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
    val arr = JSONArray(prefs.getString(KEY, "[]"))
    arr.put(
      JSONObject().apply {
        put("address", address)
        put("body", body)
        put("date", date)
      }
    )
    while (arr.length() > MAX_ENTRIES) {
      arr.remove(0)
    }
    prefs.edit().putString(KEY, arr.toString()).apply()
  }

  @Synchronized
  fun drain(context: Context): List<Map<String, Any>> {
    val prefs = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
    val arr = JSONArray(prefs.getString(KEY, "[]"))
    val out = ArrayList<Map<String, Any>>(arr.length())
    for (i in 0 until arr.length()) {
      val o = arr.getJSONObject(i)
      out.add(
        mapOf(
          "address" to o.optString("address"),
          "body" to o.optString("body"),
          "date" to o.optLong("date")
        )
      )
    }
    prefs.edit().putString(KEY, "[]").apply()
    return out
  }
}
