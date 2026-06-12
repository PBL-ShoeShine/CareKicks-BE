const alamatService = require("./alamat.services");

const alamatController = {
  getAlamat: async (req, res) => {
    try {
      const id_user = req.user?.id_user;
      if (!id_user)
        return res
          .status(401)
          .json({ success: false, message: "Sesi tidak valid." });

      const data = await alamatService.getAlamat(id_user);
      return res.status(200).json({ success: true, data });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  addAlamat: async (req, res) => {
    try {
      const id_user = req.user?.id_user;
      if (!id_user)
        return res
          .status(401)
          .json({ success: false, message: "Sesi tidak valid." });

      const data = await alamatService.addAlamat(id_user, req.body);
      return res
        .status(201)
        .json({ success: true, message: "Alamat berhasil ditambahkan.", data });
    } catch (error) {
      return res.status(400).json({ success: false, message: error.message });
    }
  },

  updateAlamat: async (req, res) => {
    try {
      const id_user = req.user?.id_user;
      const { id_address } = req.params;
      if (!id_user)
        return res
          .status(401)
          .json({ success: false, message: "Sesi tidak valid." });

      const data = await alamatService.updateAlamat(
        id_address,
        id_user,
        req.body,
      );
      return res
        .status(200)
        .json({ success: true, message: "Alamat berhasil diperbarui.", data });
    } catch (error) {
      return res.status(400).json({ success: false, message: error.message });
    }
  },

  setDefault: async (req, res) => {
    try {
      const id_user = req.user?.id_user;
      const { id_address } = req.params;
      if (!id_user)
        return res
          .status(401)
          .json({ success: false, message: "Sesi tidak valid." });

      await alamatService.setDefault(id_address, id_user);
      return res
        .status(200)
        .json({ success: true, message: "Alamat default berhasil diubah." });
    } catch (error) {
      return res.status(400).json({ success: false, message: error.message });
    }
  },

  deleteAlamat: async (req, res) => {
    try {
      const id_user = req.user?.id_user;
      const { id_address } = req.params;
      if (!id_user)
        return res
          .status(401)
          .json({ success: false, message: "Sesi tidak valid." });

      await alamatService.deleteAlamat(id_address, id_user);
      return res
        .status(200)
        .json({ success: true, message: "Alamat berhasil dihapus." });
    } catch (error) {
      return res.status(400).json({ success: false, message: error.message });
    }
  },
};

module.exports = alamatController;
