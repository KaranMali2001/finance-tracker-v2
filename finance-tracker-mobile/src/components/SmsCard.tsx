import React, { useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import type { SmsSubmitStatus } from "../hooks/useSubmitSms";
import type { ParsedSms } from "../types/sms";
import { getParseFailureReason } from "../utils/parseFailureReason";

interface Props {
  item: ParsedSms;
  isNew?: boolean;
  submitStatus?: SmsSubmitStatus;
  onSend?: () => Promise<void>;
}

type SendStatus = "idle" | "sending" | "sent" | "error";

const TYPE_COLORS: Record<string, { text: string; bg: string }> = {
  debit:  { text: "#b85040", bg: "#b8504018" },
  credit: { text: "#4a9e6a", bg: "#4a9e6a18" },
};

export function SmsCard({ item, isNew, submitStatus, onSend }: Props) {
  const { parsed, raw } = item;
  const txnType = parsed.transaction.type;
  const colors = txnType ? TYPE_COLORS[txnType] : { text: "#78716c", bg: "#78716c18" };
  const [manualStatus, setManualStatus] = useState<SendStatus>("idle");

  const effectiveStatus: SendStatus = submitStatus ?? manualStatus;

  const date = new Date(Number(raw.date)).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  async function handleSend() {
    if (!onSend || effectiveStatus === "sending" || effectiveStatus === "sent") return;
    setManualStatus("sending");
    try {
      await onSend();
      setManualStatus("sent");
    } catch {
      setManualStatus("error");
    }
  }

  return (
    <View style={[styles.card, isNew && styles.cardNew]}>
      <View style={styles.header}>
        <Text style={styles.sender} numberOfLines={1}>{raw.address}</Text>
        <Text style={styles.date}>{date}</Text>
      </View>

      <View style={styles.row}>
        {txnType && (
          <View style={[styles.badge, { backgroundColor: colors.bg }]}>
            <Text style={[styles.badgeText, { color: colors.text }]}>
              {txnType.toUpperCase()}
            </Text>
          </View>
        )}
        {parsed.transaction.amount ? (
          <Text style={[styles.amount, { color: colors.text }]}>
            ₹{parsed.transaction.amount}
          </Text>
        ) : null}
      </View>

      {parsed.transaction.merchant ? (
        <Text style={styles.merchant} numberOfLines={1}>
          {parsed.transaction.merchant}
        </Text>
      ) : null}

      {parsed.account.number ? (
        <Text style={styles.accountInfo}>
          {parsed.account.type} ···{parsed.account.number}
        </Text>
      ) : null}

      {parsed.balance?.available ? (
        <Text style={styles.balance}>Avail. Bal: ₹{parsed.balance.available}</Text>
      ) : null}

      <Text style={styles.body} numberOfLines={3}>{raw.body}</Text>

      {(() => {
        const reason = getParseFailureReason(item);
        if (!reason) return null;
        return (
          <View style={styles.parseReason}>
            <Text style={styles.parseReasonText}>⚠ {reason}</Text>
          </View>
        );
      })()}

      <View style={styles.footer}>
        {effectiveStatus === "sending" && (
          <View style={[styles.pill, styles.pillSending]}>
            <ActivityIndicator size="small" color="#78716c" style={{ marginRight: 4 }} />
            <Text style={[styles.pillText, { color: "#78716c" }]}>Sending…</Text>
          </View>
        )}
        {effectiveStatus === "sent" && (
          <View style={[styles.pill, styles.pillSent]}>
            <Text style={[styles.pillText, { color: "#4a9e6a" }]}>✓ Sent to backend</Text>
          </View>
        )}
        {effectiveStatus === "error" && (
          <View style={[styles.pill, styles.pillError]}>
            <Text style={[styles.pillText, { color: "#b85040" }]}>✗ Failed</Text>
          </View>
        )}

        {onSend && effectiveStatus !== "sent" && (
          <TouchableOpacity
            style={[styles.sendBtn, effectiveStatus === "error" && styles.sendBtnError]}
            onPress={handleSend}
            disabled={effectiveStatus === "sending"}
          >
            {effectiveStatus === "sending" ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Text style={styles.sendBtnText}>
                {effectiveStatus === "error" ? "Retry" : "Send to Backend"}
              </Text>
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 14,
    marginHorizontal: 16,
    marginVertical: 6,
    gap: 6,
    borderWidth: 1,
    borderColor: "#edeae4",
    shadowColor: "#7a6050",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 2,
  },
  cardNew: {
    borderLeftWidth: 3,
    borderLeftColor: "#d9b364",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sender: {
    color: "#433d38",
    fontWeight: "600",
    fontSize: 13,
    flex: 1,
  },
  date: {
    color: "#78716c",
    fontSize: 11,
    marginLeft: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "700",
  },
  amount: {
    fontSize: 18,
    fontWeight: "700",
  },
  merchant: {
    color: "#605a55",
    fontSize: 13,
  },
  accountInfo: {
    color: "#78716c",
    fontSize: 12,
  },
  balance: {
    color: "#908880",
    fontSize: 12,
  },
  body: {
    color: "#908880",
    fontSize: 11,
    marginTop: 4,
    lineHeight: 16,
  },
  parseReason: {
    marginTop: 6,
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: "#fef3c7",
    borderRadius: 6,
    borderLeftWidth: 3,
    borderLeftColor: "#b45309",
  },
  parseReasonText: {
    color: "#92400e",
    fontSize: 11,
    fontWeight: "500",
  },
  footer: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  pillSending: { backgroundColor: "#f5f3ef" },
  pillSent:    { backgroundColor: "#4a9e6a18" },
  pillError:   { backgroundColor: "#b8504018" },
  pillText: {
    fontSize: 11,
    fontWeight: "600",
  },
  sendBtn: {
    flex: 1,
    backgroundColor: "#d9b364",
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: "center",
  },
  sendBtnError: {
    backgroundColor: "#b85040",
  },
  sendBtnText: {
    color: "#ffffff",
    fontWeight: "600",
    fontSize: 12,
  },
});
