import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Platform,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SmsCard } from "../components/SmsCard";
import { useSms } from "../hooks/useSms";
import { useSmsListener } from "../hooks/useSmsListener";
import { useSmsPermission } from "../hooks/useSmsPermission";
import type { ParsedSms } from "../types/sms";

export function SmsScreen() {
  const { status, request } = useSmsPermission();
  const { smsList, loading, error, fetchSms } = useSms();
  const [liveIds, setLiveIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (status === "granted") {
      fetchSms();
    }
  }, [status, fetchSms]);

  const [displayList, setDisplayList] = useState<ParsedSms[]>([]);

  useEffect(() => {
    setDisplayList(smsList);
  }, [smsList]);

  const handleLiveSms = useCallback((sms: ParsedSms) => {
    setDisplayList((prev) => {
      const exists = prev.some((s) => s.raw._id === sms.raw._id);
      if (exists) return prev;
      return [sms, ...prev];
    });
    setLiveIds((prev) => new Set(prev).add(sms.raw._id));
  }, []);

  useSmsListener(status === "granted" ? handleLiveSms : () => {});

  if (Platform.OS !== "android") {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <Text style={styles.emptyTitle}>Android Only</Text>
          <Text style={styles.emptySubtitle}>
            SMS reading is only supported on Android.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (status === "pending") {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <ActivityIndicator color="#6366f1" size="large" />
          <Text style={styles.emptySubtitle}>Requesting permission...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (status === "denied" || status === "never_ask_again") {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <Text style={styles.emptyTitle}>Permission Required</Text>
          <Text style={styles.emptySubtitle}>
            SMS permission is needed to detect bank transactions.
          </Text>
          <TouchableOpacity style={styles.button} onPress={request}>
            <Text style={styles.buttonText}>Grant Permission</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <Text style={styles.emptyTitle}>Error</Text>
          <Text style={styles.emptySubtitle}>{error}</Text>
          <TouchableOpacity style={styles.button} onPress={() => fetchSms()}>
            <Text style={styles.buttonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Transaction SMS</Text>
          <Text style={styles.subtitle}>
            {displayList.length} messages · live
            <Text style={styles.liveDot}> ●</Text>
          </Text>
        </View>
        <TouchableOpacity
          style={styles.syncButton}
          onPress={() => fetchSms()}
          disabled={loading}
        >
          <Text style={styles.syncButtonText}>
            {loading ? "Scanning..." : "Refresh"}
          </Text>
        </TouchableOpacity>
      </View>

      {loading && displayList.length === 0 ? (
        <View style={styles.center}>
          <ActivityIndicator color="#6366f1" size="large" />
          <Text style={styles.emptySubtitle}>Scanning SMS inbox...</Text>
        </View>
      ) : (
        <FlatList
          data={displayList}
          keyExtractor={(item: ParsedSms) => item.raw._id}
          renderItem={({ item }: { item: ParsedSms }) => (
            <SmsCard item={item} isNew={liveIds.has(item.raw._id)} />
          )}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={() => fetchSms()}
              tintColor="#6366f1"
            />
          }
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={styles.emptyTitle}>No Transactions Found</Text>
              <Text style={styles.emptySubtitle}>
                No bank SMS detected in your inbox.
              </Text>
            </View>
          }
          contentContainerStyle={
            displayList.length === 0 ? styles.emptyContainer : styles.list
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#1e293b",
  },
  title: {
    color: "#f1f5f9",
    fontSize: 20,
    fontWeight: "700",
  },
  subtitle: {
    color: "#64748b",
    fontSize: 13,
    marginTop: 2,
  },
  liveDot: {
    color: "#22c55e",
    fontSize: 10,
  },
  syncButton: {
    backgroundColor: "#6366f1",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  syncButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 13,
  },
  list: {
    paddingVertical: 8,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    padding: 32,
  },
  emptyContainer: {
    flex: 1,
  },
  emptyTitle: {
    color: "#e2e8f0",
    fontSize: 18,
    fontWeight: "600",
  },
  emptySubtitle: {
    color: "#64748b",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
  button: {
    backgroundColor: "#6366f1",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 8,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 15,
  },
});
