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
import { usePendingSms } from "../hooks/usePendingSms";
import { useSms } from "../hooks/useSms";
import { useSmsListener } from "../hooks/useSmsListener";
import { useSmsPermission } from "../hooks/useSmsPermission";
import { useAppForeground } from "../hooks/useAppForeground";
import { useSubmitSms } from "../hooks/useSubmitSms";
import type { ParsedSms } from "../types/sms";
import { BASE_URL } from "../api/client";
import { getApiKey } from "../utils/secureStore";
import { QrScanScreen } from "./QrScanScreen";

export function SmsScreen() {
  const { status, request } = useSmsPermission();
  const { smsList, loading, error, fetchSms } = useSms();
  const { submit, reset: resetSubmitted, getStatus } = useSubmitSms();
  const [liveIds, setLiveIds] = useState<Set<string>>(new Set());
  const [displayList, setDisplayList] = useState<ParsedSms[]>([]);
  const [apiKeyReady, setApiKeyReady] = useState<boolean | null>(null);

  useEffect(() => {
    getApiKey().then((key) => setApiKeyReady(key !== null));
  }, []);

  useEffect(() => {
    if (status === "granted") {
      fetchSms();
    }
  }, [status, fetchSms]);

  useEffect(() => {
    setDisplayList(smsList);
  }, [smsList]);

  const handleQrSuccess = useCallback(() => {
    setDisplayList([]);
    setLiveIds(new Set());
    resetSubmitted();
    setApiKeyReady(true);
    if (status === "granted") {
      fetchSms();
    }
  }, [resetSubmitted, status, fetchSms]);

  const handleLiveSms = useCallback((sms: ParsedSms) => {
    setDisplayList((prev) => {
      const exists = prev.some((s) => s.raw._id === sms.raw._id);
      if (exists) return prev;
      return [sms, ...prev];
    });
    setLiveIds((prev) => new Set(prev).add(sms.raw._id));
    submit(sms).catch(() => {});
  }, [submit]);

  useSmsListener(status === "granted" ? handleLiveSms : () => {});
  usePendingSms(status === "granted" ? handleLiveSms : () => {});
  useAppForeground(useCallback(() => {
    if (status === "granted") fetchSms();
  }, [status, fetchSms]));

  if (apiKeyReady === null) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <ActivityIndicator color="#d9b364" size="large" />
        </View>
      </SafeAreaView>
    );
  }

  if (!apiKeyReady) {
    return <QrScanScreen onSuccess={handleQrSuccess} />;
  }

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
          <ActivityIndicator color="#d9b364" size="large" />
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
      <View style={styles.urlBanner}>
        <Text style={styles.urlText} numberOfLines={1}>⚡ {BASE_URL}</Text>
      </View>
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
          <ActivityIndicator color="#d9b364" size="large" />
          <Text style={styles.emptySubtitle}>Scanning SMS inbox...</Text>
        </View>
      ) : (
        <FlatList
          data={displayList}
          keyExtractor={(item: ParsedSms) => item.raw._id}
          renderItem={({ item }: { item: ParsedSms }) => (
            <SmsCard
              item={item}
              isNew={liveIds.has(item.raw._id)}
              submitStatus={getStatus(item.raw._id)}
              onSend={() => submit(item)}
            />
          )}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={() => fetchSms()}
              tintColor="#d9b364"
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
    backgroundColor: "#faf9f7",
  },
  urlBanner: {
    backgroundColor: "#f5f3ef",
    paddingHorizontal: 16,
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: "#edeae4",
  },
  urlText: {
    color: "#78716c",
    fontSize: 11,
    fontFamily: "monospace",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#edeae4",
    backgroundColor: "#ffffff",
  },
  title: {
    color: "#433d38",
    fontSize: 20,
    fontWeight: "700",
  },
  subtitle: {
    color: "#78716c",
    fontSize: 13,
    marginTop: 2,
  },
  liveDot: {
    color: "#4a9e6a",
    fontSize: 10,
  },
  syncButton: {
    backgroundColor: "#d9b364",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  syncButtonText: {
    color: "#ffffff",
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
    color: "#433d38",
    fontSize: 18,
    fontWeight: "600",
  },
  emptySubtitle: {
    color: "#78716c",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
  button: {
    backgroundColor: "#d9b364",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 8,
  },
  buttonText: {
    color: "#ffffff",
    fontWeight: "600",
    fontSize: 15,
  },
});
