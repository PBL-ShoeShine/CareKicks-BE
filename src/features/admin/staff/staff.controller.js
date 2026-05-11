const StaffService = require('./staff.service');

class StaffController {
  // 1. Tambah Staff
  async createStaff(req, res) {
    try {
      const { nama, email, no_hp, id_shops, role } = req.body;

      const result = await StaffService.registerStaff({
        nama,
        email,
        no_hp,
        id_shops,
        role
      });

      res.status(201).json({ success: true, data: result });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  // 2. List Staff
  async getStaffList(req, res) {
    try {
      const { search } = req.query;
      const result = await StaffService.getAllStaff(search);

      res.status(200).json({ success: true, data: result });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // 3. Detail Staff
  async getStaffById(req, res) {
    try {
      const result = await StaffService.getStaffById(req.params.id);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      res.status(404).json({ success: false, message: "Staff tidak ditemukan" });
    }
  }

  // 4. Update Profile/Status Staff
  async updateStaffStatus(req, res) {
    try {
      const { id } = req.params; 
      const updateData = req.body; // Mengambil seluruh JSON yang dikirim di Postman

      const result = await StaffService.updateStaffProfile(id, updateData);

      res.status(200).json({
        success: true,
        message: "Berhasil update data staff",
        data: result
      });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  // 5. Hapus Staff
  async deleteStaff(req, res) {
    try {
      const { id } = req.params;
      await StaffService.deleteStaff(id);

      res.status(200).json({
        success: true,
        message: "Staff deleted successfully"
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = new StaffController();