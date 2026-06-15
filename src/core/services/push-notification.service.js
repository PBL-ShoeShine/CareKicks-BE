const fs = require("fs");
const path = require("path");
const admin = require("firebase-admin");
const { getMessaging } = require("firebase-admin/messaging");
const supabase = require("../config/supabase");

let firebaseApp = null;

const getFirebaseApp = () => {
  if (firebaseApp) return firebaseApp;

  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;

  try {
    if (serviceAccountJson) {
      firebaseApp = admin.initializeApp({
        credential: admin.cert(JSON.parse(serviceAccountJson)),
      });
      return firebaseApp;
    }

    if (serviceAccountPath) {
      firebaseApp = admin.initializeApp({
        credential: admin.applicationDefault(),
      });
      return firebaseApp;
    }

    const fallbackServiceAccountPath = path.resolve(
      process.cwd(),
      "firebase-service-account.json",
    );
    if (fs.existsSync(fallbackServiceAccountPath)) {
      firebaseApp = admin.initializeApp({
        credential: admin.cert(require(fallbackServiceAccountPath)),
      });
      return firebaseApp;
    }
  } catch (error) {
    console.error("Firebase init error:", error);
  }

  return null;
};

const sendToUser = async (idUser, notification, data = {}) => {
  const app = getFirebaseApp();
  if (!app) {
    console.warn("Firebase credential belum dikonfigurasi. Push dilewati.");
    return { sent: 0, skipped: true };
  }

  const { data: tokenRows, error } = await supabase
    .from("user_fcm_tokens")
    .select("fcm_token")
    .eq("id_user", idUser)
    .eq("is_active", true);

  if (error) {
    console.error("Fetch FCM token error:", error);
    return { sent: 0, error: error.message };
  }

  const tokens = (tokenRows || []).map((row) => row.fcm_token).filter(Boolean);
  if (tokens.length === 0) {
    console.warn("Push dilewati: FCM token aktif tidak ditemukan", { idUser });
    return { sent: 0, noTokens: true };
  }

  const messageData = Object.fromEntries(
    Object.entries(data).map(([key, value]) => [key, String(value ?? "")]),
  );

  const response = await getMessaging(app).sendEachForMulticast({
    tokens,
    notification,
    data: messageData,
  });

  const invalidTokens = [];
  response.responses.forEach((result, index) => {
    const code = result.error?.code;
    if (
      code === "messaging/invalid-registration-token" ||
      code === "messaging/registration-token-not-registered"
    ) {
      invalidTokens.push(tokens[index]);
    }
  });

  if (invalidTokens.length > 0) {
    await supabase
      .from("user_fcm_tokens")
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .in("fcm_token", invalidTokens);
  }

  return { sent: response.successCount, failed: response.failureCount };
};

module.exports = { sendToUser };
