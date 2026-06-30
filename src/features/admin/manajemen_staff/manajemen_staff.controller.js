const ManajemenStaffService = require("./manajemen_staff.service");

class ManajemenStaffController {
  // 1. Tambah Staff
  async createStaff(req, res) {
    try {
      const { nama, email, no_hp, password } = req.body;

      const result = await ManajemenStaffService.registerStaff(req.user, {
        nama,
        email,
        no_hp,
        password,
        status: "AKTIF",
      });

      // Menggunakan 200 agar konsisten dengan endpoint lain jika diinginkan
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  // 2. List Staff
  async getStaffList(req, res) {
    try {
      const { search } = req.query;
      const result = await ManajemenStaffService.getAllStaff(req.user, search);

      res.status(200).json({ success: true, data: result });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // 3. Detail Staff
  async getStaffById(req, res) {
    try {
      const result = await ManajemenStaffService.getStaffById(
        req.user,
        req.params.id,
      );
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      res
        .status(404)
        .json({ success: false, message: "Staff tidak ditemukan" });
    }
  }

  // 4. Update Profile/Status Staff
  async updateStaffStatus(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      // Service akan menangani update hanya pada field yang diizinkan (nama, email, no_hp, status)
      const result = await ManajemenStaffService.updateStaffProfile(
        req.user,
        id,
        updateData,
      );

      res.status(200).json({
        success: true,
        message: "Berhasil update data staff",
        data: result,
      });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  // 5. Hapus Staff
  async deleteStaff(req, res) {
    try {
      const { id } = req.params;
      await ManajemenStaffService.deleteStaff(req.user, id);

      res.status(200).json({
        success: true,
        message: "Staff berhasil dihapus",
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = new ManajemenStaffController();
