const service = require("./user.service");

exports.register = async (req, res) => {
  try {
    const result = await service.register(req.body);
    res.json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const result = await service.login(req.body);
    res.json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.updateProfilePhoto = async (req, res) => {
  try {
    const idUser = req.user.id_user;
    const data = await service.updateProfilePhoto(idUser, req.file);

    res.json({
      message: "Foto profil berhasil diperbarui",
      data,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
