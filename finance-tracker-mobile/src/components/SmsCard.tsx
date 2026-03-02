import React from "react";
import {
  StyleSheet,
  Text,
  View,
} from "react-native";
import type { ParsedSms } from "../types/sms";

interface Props {
  item: ParsedSms;
  isNew?: boolean;
}

const TYPE_COLORS: Record<string, string> = {
  debit: "#ef4444",
  credit: "#22c55e",
};

export function SmsCard({ item, isNew }: Props) {
  const { parsed, raw } = item;
  const txnType = parsed.transaction.type;
  const typeColor = txnType ? TYPE_COLORS[txnType] : "#94a3b8";
  const date = new Date(Number(raw.date)).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <View style={[styles.card, isNew && styles.cardNew]}>
      <View style={styles.header}>
        <Text style={styles.sender} numberOfLines={1}>
          {raw.address}
        </Text>
        <Text style={styles.date}>{date}</Text>
      </View>

      <View style={styles.row}>
        {txnType && (
          <View style={[styles.badge, { backgroundColor: typeColor + "20" }]}>
            <Text style={[styles.badgeText, { color: typeColor }]}>
              {txnType.toUpperCase()}
            </Text>
          </View>
        )}
        {parsed.transaction.amount ? (
          <Text style={[styles.amount, { color: typeColor }]}>
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
        <Text style={styles.balance}>
          Avail. Bal: ₹{parsed.balance.available}
        </Text>
      ) : null}

      <Text style={styles.body} numberOfLines={3}>
        {raw.body}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#1e293b",
    borderRadius: 12,
    padding: 14,
    marginHorizontal: 16,
    marginVertical: 6,
    gap: 6,
  },
  cardNew: {
    borderLeftWidth: 3,
    borderLeftColor: "#6366f1",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sender: {
    color: "#e2e8f0",
    fontWeight: "600",
    fontSize: 13,
    flex: 1,
  },
  date: {
    color: "#64748b",
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
    color: "#cbd5e1",
    fontSize: 13,
  },
  accountInfo: {
    color: "#64748b",
    fontSize: 12,
  },
  balance: {
    color: "#64748b",
    fontSize: 12,
  },
  body: {
    color: "#475569",
    fontSize: 11,
    marginTop: 4,
    lineHeight: 16,
  },
});
