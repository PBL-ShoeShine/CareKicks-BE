const axios = require("axios");

const BASE_URL = "http://localhost:5000/api/v1";

async function login(email, password) {
  console.log(`Logging in as ${email}...`);
  const res = await axios.post(`${BASE_URL}/user/login`, { email, password });
  console.log(`✓ ${email} logged in. Role: ${res.data.user.jenis_role}`);
  return res.data.token;
}

async function registerNisa() {
  try {
    const token = await login("nisa@mail.com", "12345678");
    console.log("Submitting store registration for Nisa...");

    const form = new FormData();
    form.append("nm_toko", "Nisa Clean Shoes");
    form.append("desk_toko", "Cuci sepatu canvas premium.");
    form.append("alamat_toko", "Jl. Mawar Indah No. 5");
    form.append("spesialisasi", "Canvas");
    form.append("jam_buka", "09:00:00");
    form.append("jam_tutup", "21:00:00");

    const dummyImage = new Blob(["mock image data"], { type: "image/png" });
    form.append("foto_toko", dummyImage, "toko.png");
    form.append("foto_ktp", dummyImage, "ktp.png");

    const res = await axios.post(`${BASE_URL}/customer/shops/register`, form, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log("✓ Registration Response Status:", res.status);
    console.log("✓ Shop Registered:", res.data.data.shop.nm_toko);
    console.log("✓ Verification Status:", res.data.data.shop.status_verifikasi);
    console.log("✓ Shop ID:", res.data.data.shop.id_shops);
  } catch (error) {
    console.error("❌ Register Nisa failed:", error.response ? error.response.data : error.message);
  }
}

async function appealGanang() {
  try {
    const token = await login("ganang@mail.com", "12345678");
    console.log("Submitting appeal for Ganang...");

    const form = new FormData();
    form.append("alasan_banding", "Saya telah menyesuaikan operasional toko sesuai standar.");
    const dummyProof = new Blob(["mock proof data"], { type: "image/png" });
    form.append("foto_bukti", dummyProof, "bukti.png");

    const res = await axios.post(`${BASE_URL}/admin/toko/appeal`, form, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log("✓ Appeal Response Status:", res.status);
    console.log("✓ Message:", res.data.message);
  } catch (error) {
    console.error("❌ Appeal Ganang failed:", error.response ? error.response.data : error.message);
  }
}

const action = process.argv[2];

if (action === "--register-nisa") {
  registerNisa();
} else if (action === "--appeal-ganang") {
  appealGanang();
} else {
  console.log("Usage: node trigger_api_helper.js [--register-nisa | --appeal-ganang]");
}
