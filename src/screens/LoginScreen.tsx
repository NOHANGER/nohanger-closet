import React, { useState, useContext } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator } from "react-native";
import { colors } from "../styles/colors";
import { typography } from "../styles/globalStyles";
import { AuthContext } from "../contexts/AuthContext";

const LoginScreen: React.FC = () => {
  const auth = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!auth) return null;

  const onSubmit = async () => {
    setError(null);
    setSubmitting(true);
    try {
      await auth.login(email.trim(), password);
    } catch (e: any) {
      setError(e?.message ?? "Login failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Welcome to Nohanger Closet</Text>
        <Text style={styles.subtitle}>Sign in to continue</Text>

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor={colors.text_gray_light}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          textContentType="username"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor={colors.text_gray_light}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          textContentType="password"
        />

        {!!error && <Text style={styles.error}>{error}</Text>}

        <TouchableOpacity style={styles.button} onPress={onSubmit} disabled={submitting}>
          {submitting ? <ActivityIndicator color="#000" /> : <Text style={styles.buttonText}>Continue</Text>}
        </TouchableOpacity>

        <Text style={styles.hint}>This is a local demo login. Hook up your real auth later.</Text>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.screen_background,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  card: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 1,
  },
  title: {
    fontFamily: typography.bold,
    fontSize: 22,
    color: colors.text_primary,
  },
  subtitle: {
    marginTop: 6,
    fontFamily: typography.regular,
    fontSize: 14,
    color: colors.text_gray,
  },
  input: {
    marginTop: 16,
    borderWidth: 1,
    borderColor: colors.border_gray,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 46,
    fontFamily: typography.regular,
    color: colors.text_primary,
    backgroundColor: colors.tag_light,
  },
  error: {
    marginTop: 10,
    color: colors.primary_red,
    fontFamily: typography.medium,
  },
  button: {
    marginTop: 20,
    height: 48,
    borderRadius: 10,
    backgroundColor: colors.primary_yellow,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    fontFamily: typography.semiBold,
    fontSize: 16,
    color: colors.text_primary,
  },
  hint: {
    marginTop: 12,
    fontSize: 12,
    color: colors.text_gray_light,
    fontFamily: typography.regular,
  },
});

export default LoginScreen;
