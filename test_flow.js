const axios = require("axios");

const BASE_URL = "http://localhost:5000/api/v1";

async function runTests() {
  try {
    console.log("=== STARTING END-TO-END ROLE API TESTS (WITH FILE UPLOADS) ===");

    // 1. Login as SuperAdmin
    console.log("\n[1] Logging in as SuperAdmin...");
    const saLoginRes = await axios.post(`${BASE_URL}/user/login`, {
      email: "superadmin@mail.com",
      password: "12345678"
    });
    const saToken = saLoginRes.data.token;
    console.log("✓ SuperAdmin logged in successfully!");

    // Get TOKO ganang initial status
    const saHeaders = { Authorization: `Bearer ${saToken}` };
    const shopsRes = await axios.get(`${BASE_URL}/admin/shops`, { headers: saHeaders });
    const ganangShop = shopsRes.data.data.shops.find(s => s.nm_toko === "TOKO ganang");
    console.log(`Initial status of TOKO ganang (ID: ${ganangShop.id_shops}):`, ganangShop.status_verifikasi);

    // 2. Suspend TOKO ganang
    console.log("\n[2] Suspending TOKO ganang...");
    const suspendRes = await axios.put(
      `${BASE_URL}/admin/shops/${ganangShop.id_shops}/verify`,
      {
        status_verifikasi: "suspended",
        alasan_penangguhan: "Melanggar aturan platform CareKicks."
      },
      { headers: saHeaders }
    );
    console.log("✓ Suspend response:", suspendRes.data.message);

    // Verify it is suspended in DB
    const shopDetailRes = await axios.get(`${BASE_URL}/admin/shops/${ganangShop.id_shops}`, { headers: saHeaders });
    console.log("✓ TOKO ganang status verified after suspend:", shopDetailRes.data.data.status_verifikasi);
    console.log("✓ Alasan penangguhan:", shopDetailRes.data.data.alasan_penangguhan);

    // 3. Login as Customer (Nisa)
    console.log("\n[3] Logging in as Customer (Nisa)...");
    const nisaLoginRes = await axios.post(`${BASE_URL}/user/login`, {
      email: "nisa@mail.com",
      password: "12345678"
    });
    let nisaToken = nisaLoginRes.data.token;
    console.log("✓ Customer Nisa logged in successfully! Role:", nisaLoginRes.data.user.jenis_role);

    // 4. Register a store for Nisa with file uploads
    console.log("\n[4] Registering a new store for Nisa (with mandatory files)...");
    
    const regForm = new FormData();
    regForm.append("nm_toko", "Nisa Clean Shoes");
    regForm.append("desk_toko", "Cuci sepatu canvas premium.");
    regForm.append("alamat_toko", "Jl. Mawar Indah No. 5");
    regForm.append("spesialisasi", "Canvas");
    regForm.append("jam_buka", "09:00:00");
    regForm.append("jam_tutup", "21:00:00");

    // Add mock files
    const dummyImage = new Blob(["mock image data"], { type: "image/png" });
    regForm.append("foto_toko", dummyImage, "toko.png");
    regForm.append("foto_ktp", dummyImage, "ktp.png");

    const regRes = await axios.post(
      `${BASE_URL}/customer/shops/register`,
      regForm,
      {
        headers: {
          Authorization: `Bearer ${nisaToken}`
        }
      }
    );
    console.log("✓ Store registration submitted!");
    console.log("✓ New Store ID:", regRes.data.data.shop.id_shops);
    console.log("✓ New Store Status:", regRes.data.data.shop.status_verifikasi);

    const newShopId = regRes.data.data.shop.id_shops;

    // Login as Nisa again to verify her role stays customer with pending shop
    console.log("\n[4.5] Re-logging in as Nisa to check role stays customer...");
    const nisaLogin2Res = await axios.post(`${BASE_URL}/user/login`, {
      email: "nisa@mail.com",
      password: "12345678"
    });
    console.log("✓ Nisa role now:", nisaLogin2Res.data.user.jenis_role, "(should be customer)");
    console.log("✓ Nisa has_pending_shop:", nisaLogin2Res.data.user.has_pending_shop);
    console.log("✓ Nisa shop linked status:", nisaLogin2Res.data.user.shop.status_verifikasi);

    // 5. Login as Shop Admin (Ganang)
    console.log("\n[5] Logging in as Shop Admin (Ganang)...");
    const ganangLoginRes = await axios.post(`${BASE_URL}/user/login`, {
      email: "ganang@mail.com",
      password: "12345678"
    });
    const ganangToken = ganangLoginRes.data.token;
    console.log("✓ Ganang logged in. Shop status in payload:", ganangLoginRes.data.user.shop.status_verifikasi);

    // 6. Submit appeal as Ganang with proof file
    console.log("\n[6] Submitting appeal for Ganang's shop (with proof file)...");
    
    const appealForm = new FormData();
    appealForm.append("alasan_banding", "Saya telah menyesuaikan operasional toko sesuai standar.");
    
    const dummyProof = new Blob(["mock proof data"], { type: "image/png" });
    appealForm.append("foto_bukti", dummyProof, "bukti.png");

    const appealRes = await axios.post(
      `${BASE_URL}/admin/toko/appeal`,
      appealForm,
      {
        headers: {
          Authorization: `Bearer ${ganangToken}`
        }
      }
    );
    console.log("✓ Appeal response:", appealRes.data.message);

    // Check status in DB
    const ganangShopAfterAppeal = await axios.get(`${BASE_URL}/admin/shops/${ganangShop.id_shops}`, { headers: saHeaders });
    console.log("✓ TOKO ganang status verified after appeal:", ganangShopAfterAppeal.data.data.status_verifikasi);
    console.log("✓ Combined alasan_penangguhan/appeal field (should contain Bukti URL):", ganangShopAfterAppeal.data.data.alasan_penangguhan);

    // 7. Resolve as SuperAdmin: Approve Nisa's shop and accept Ganang's appeal
    console.log("\n[7] Resolving queues as SuperAdmin...");
    
    // Approve Nisa registration
    console.log("-> Approving Nisa Clean Shoes (ID: " + newShopId + ")...");
    const approveRegRes = await axios.put(
      `${BASE_URL}/admin/shops/${newShopId}/verify`,
      { status_verifikasi: "approved" },
      { headers: saHeaders }
    );
    console.log("✓ Approval response:", approveRegRes.data.message);

    // Accept Ganang's appeal
    console.log("-> Accepting Ganang's appeal (ID: " + ganangShop.id_shops + ")...");
    const approveAppealRes = await axios.put(
      `${BASE_URL}/admin/shops/${ganangShop.id_shops}/verify`,
      { status_verifikasi: "approved" },
      { headers: saHeaders }
    );
    console.log("✓ Appeal approval response:", approveAppealRes.data.message);

    // 8. Verify final states - check Nisa is now shops_admin after approval
    console.log("\n[8] Verifying final statuses...");
    const finalGanang = await axios.get(`${BASE_URL}/admin/shops/${ganangShop.id_shops}`, { headers: saHeaders });
    console.log("✓ TOKO ganang final status:", finalGanang.data.data.status_verifikasi);

    // Re-login as Nisa to verify role upgraded to shops_admin after approval
    const nisaLogin3Res = await axios.post(`${BASE_URL}/user/login`, {
      email: "nisa@mail.com",
      password: "12345678"
    });
    console.log("✓ Nisa role after approval:", nisaLogin3Res.data.user.jenis_role, "(should be shops_admin)");
    console.log("✓ Nisa shop status after approval:", nisaLogin3Res.data.user.shop.status_verifikasi);

    console.log("\n=== ALL ROLE END-TO-END FLOW TESTS COMPLETED SUCCESSFULLY ===");
  } catch (error) {
    console.error("\n❌ Test failed with error:", error.response ? error.response.data : error.message);
  }
}

runTests();
