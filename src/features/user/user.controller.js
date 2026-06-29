const service = require("./user.service");

exports.register = async (req, res) => {
  try {
    const result = await service.register(req.body);
    res.json(result);
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.verifyRegisterOtp = async (req, res) => {
  try {
    const result = await service.verifyRegisterOtp(req.body);
    res.json(result);
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.resendRegisterOtp = async (req, res) => {
  try {
    const result = await service.resendRegisterOtp(req.body);
    res.json(result);
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const result = await service.login(req.body);
    res.json(result);
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.updateProfilePhoto = async (req, res) => {
  try {
    const idUser = req.user.id_user;
    const data = await service.updateProfilePhoto(idUser, req.file);
    res.json({ message: "Foto profil berhasil diperbarui", data });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.checkRole = async (req, res) => {
  try {
    const idUser = req.user.id_user || req.user.id;
    const data = await service.checkRole(idUser);
    res.json({ success: true, data });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};