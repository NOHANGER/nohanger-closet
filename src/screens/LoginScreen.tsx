import React, { useState, useContext } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator } from "react-native";
import { colors } from "../styles/colors";
import { typography } from "../styles/globalStyles";
import { AuthContext } from "../contexts/AuthContext";

const LoginScreen: React.FC = () => {
  const auth = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!auth) return null;

  const onSubmit = async () => {
    setError(null);
    setSubmitting(true);
    try {
      if (isSignUp) {
        if (password.length < 6) throw new Error("Password must be at least 6 characters");
        if (password !== confirmPassword) throw new Error("Passwords do not match");
        await auth.signup(email.trim(), password, { displayName });
      } else {
        await auth.login(email.trim(), password);
      }
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
        <View style={styles.segment}>
          <TouchableOpacity style={[styles.segmentBtn, !isSignUp && styles.segmentBtnActive]} onPress={() => setIsSignUp(false)}>
            <Text style={[styles.segmentText, !isSignUp && styles.segmentTextActive]}>Sign In</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.segmentBtn, isSignUp && styles.segmentBtnActive]} onPress={() => setIsSignUp(true)}>
            <Text style={[styles.segmentText, isSignUp && styles.segmentTextActive]}>Sign Up</Text>
          </TouchableOpacity>
        </View>

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
        {isSignUp && (
          <TextInput
            style={styles.input}
            placeholder="Display name (optional)"
            placeholderTextColor={colors.text_gray_light}
            value={displayName}
            onChangeText={setDisplayName}
          />
        )}
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor={colors.text_gray_light}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          textContentType="password"
        />
        {isSignUp && (
          <TextInput
            style={styles.input}
            placeholder="Confirm Password"
            placeholderTextColor={colors.text_gray_light}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            textContentType="password"
          />
        )}

        {!!error && <Text style={styles.error}>{error}</Text>}

        <TouchableOpacity style={styles.button} onPress={onSubmit} disabled={submitting}>
          {submitting ? <ActivityIndicator color="#000" /> : <Text style={styles.buttonText}>{isSignUp ? "Create Account" : "Continue"}</Text>}
        </TouchableOpacity>
        <Text style={styles.hint}>
          Demo only: accounts are stored locally on this device. Use a backend to support real multi-device accounts.
        </Text>
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
  segment: {
    flexDirection: "row",
    marginTop: 12,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: colors.border_gray,
    borderRadius: 10,
    overflow: "hidden",
  },
  segmentBtn: { flex: 1, alignItems: "center", paddingVertical: 10, backgroundColor: "#fff" },
  segmentBtnActive: { backgroundColor: colors.light_yellow },
  segmentText: { fontFamily: typography.medium, color: colors.text_gray },
  segmentTextActive: { color: colors.text_primary },
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
