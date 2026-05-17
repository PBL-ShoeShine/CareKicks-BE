const profileService = require("./profile.service");

exports.getProfileAdmin = async (req, res) => {
  try {
    const idUser = req.user.id;

    const data = await profileService.getProfileData(idUser);

    return res.status(200).json({
      success: true,
      message: "Profil berhasil diambil",
      data,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.updateProfileAdmin = async (req, res) => {
  try {
    const idUser = req.user.id;
    const { nama, no_hp, email } = req.body;

    const data = await profileService.updateProfileData(idUser, {
      nama,
      no_hp,
      email,
    });

    return res.status(200).json({
      success: true,
      message: "Profil berhasil diperbarui",
      data,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.updateProfilePicture = async (req, res) => {
  try {
    const idUser = req.user.id;
    const { imageUrl } = req.body;

    if (!imageUrl) {
      return res.status(400).json({
        success: false,
        message: "URL gambar harus disediakan",
      });
    }

    const data = await profileService.updateProfilePicture(idUser, imageUrl);

    return res.status(200).json({
      success: true,
      message: "Foto profil berhasil diperbarui",
      data,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
