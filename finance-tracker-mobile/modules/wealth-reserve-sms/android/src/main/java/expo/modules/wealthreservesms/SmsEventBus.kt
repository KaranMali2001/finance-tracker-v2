package expo.modules.wealthreservesms

object SmsEventBus {
  @Volatile
  private var listener: ((address: String, body: String, date: Long) -> Unit)? = null

  fun setListener(l: ((address: String, body: String, date: Long) -> Unit)?) {
    listener = l
  }

  fun emit(address: String, body: String, date: Long): Boolean {
    val current = listener ?: return false
    current(address, body, date)
    return true
  }
}
