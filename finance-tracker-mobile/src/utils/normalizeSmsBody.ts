export function normalizeSmsBody(body: string): string {
  return body
    .replace(/Rs\.(\d)/gi, "Rs. $1")
    .replace(/INR\.?(\d)/gi, "INR $1")
    .replace(/AvlBal:Rs\.?/gi, "AvlBal: Rs. ")
    .replace(/Avl Bal:Rs\.?/gi, "AvlBal: Rs. ")
    .replace(/Available Balance:Rs\.?/gi, "Available Balance: Rs. ")
    .replace(/Bal:Rs\.?/gi, "Bal: Rs. ")
    .replace(/\bDr\.\b/gi, "debited")
    .replace(/\bCr\.\b/gi, "credited")
    .replace(/\bSent\b/gi, "debited")
    .replace(/\bhas been used\b/gi, "debited")
    .replace(/\bpaid\b/gi, "debited")
    .replace(/\bspent\b/gi, "debited");
}
