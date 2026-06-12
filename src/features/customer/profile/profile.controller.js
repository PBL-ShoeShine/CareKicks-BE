const profileService = require("./profile.services");
const supabase = require("../../../core/config/supabase");

const customerProfileController = {
  // =========================================================================
  // GET PROFILE
  // =========================================================================
  getProfile: async (req, res) => {
    try {
      const id_user = req.user?.id_user;
      if (!id_user) {
        return res
          .status(401)
          .json({ success: false, message: "Sesi tidak valid." });
      }
      const data = await profileService.getProfile(id_user);
      return res.status(200).json({ success: true, data });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  // =========================================================================
  // UPDATE PROFILE (nama, gender, birthday)
  // =========================================================================
  updateProfile: async (req, res) => {
    try {
      const id_user = req.user?.id_user;
      if (!id_user) {
        return res
          .status(401)
          .json({ success: false, message: "Sesi tidak valid." });
      }
      await profileService.updateProfile(id_user, req.body);
      return res
        .status(200)
        .json({ success: true, message: "Profil berhasil disimpan." });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  // =========================================================================
  // REQUEST EMAIL CHANGE
  // =========================================================================
  requestEmailChange: async (req, res) => {
    try {
      const id_user = req.user?.id_user;
      const { email } = req.body;

      if (!id_user) {
        return res
          .status(401)
          .json({ success: false, message: "Sesi tidak valid." });
      }
      if (!email || !email.trim()) {
        return res
          .status(400)
          .json({ success: false, message: "Email wajib diisi." });
      }

      const result = await profileService.requestEmailChange(id_user, email);
      return res
        .status(200)
        .json({ success: true, ...result, isWaitingVerification: true });
    } catch (error) {
      return res.status(400).json({ success: false, message: error.message });
    }
  },

  // =========================================================================
  // UPDATE NO HP
  // =========================================================================
  updateNoHp: async (req, res) => {
    try {
      const id_user = req.user?.id_user;
      const { no_hp, password } = req.body;

      if (!id_user) {
        return res
          .status(401)
          .json({ success: false, message: "Sesi tidak valid." });
      }
      if (!no_hp || !password) {
        return res
          .status(400)
          .json({
            success: false,
            message: "Nomor telepon dan kata sandi wajib diisi.",
          });
      }

      const result = await profileService.updateNoHp(
        id_user,
        no_hp.trim(),
        password,
      );
      return res.status(200).json({ success: true, ...result });
    } catch (error) {
      return res.status(400).json({ success: false, message: error.message });
    }
  },

  // =========================================================================
  // UPDATE PROFILE PICTURE
  // =========================================================================
  updateProfilePicture: async (req, res) => {
    try {
      const id_user = req.user?.id_user;
      if (!id_user) {
        return res
          .status(401)
          .json({ success: false, message: "Sesi tidak valid." });
      }
      if (!req.file) {
        return res
          .status(400)
          .json({ success: false, message: "File gambar tidak ditemukan." });
      }

      const file = req.file;
      const ext = file.originalname.split(".").pop() || "jpg";
      const filePath = `profile/${id_user}/${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("services")
        .upload(filePath, file.buffer, {
          contentType: file.mimetype,
          upsert: true,
        });

      if (uploadError) {
        throw new Error("Gagal mengunggah gambar: " + uploadError.message);
      }

      const { data: publicUrlData } = supabase.storage
        .from("services")
        .getPublicUrl(filePath);

      const publicUrl = publicUrlData.publicUrl;

      // Update tabel users
      const { error: updateDbError } = await supabase
        .from("users")
        .update({ path_gambar: publicUrl })
        .eq("id_user", id_user);

      if (updateDbError) {
        throw new Error(
          "Gagal menyimpan URL ke database: " + updateDbError.message,
        );
      }

      // ✅ FIX: Sinkronisasi update foto ke tabel customers
      const { error: updateCustomerError } = await supabase
        .from("customers")
        .update({ foto: publicUrl })
        .eq("id_user", id_user);

      if (updateCustomerError) {
        console.warn(
          "Peringatan: Gagal sinkronisasi foto ke tabel customers:",
          updateCustomerError.message,
        );
      }

      return res.status(200).json({
        success: true,
        message: "Foto profil berhasil diperbarui.",
        url: publicUrl,
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },
};

module.exports = customerProfileController;
