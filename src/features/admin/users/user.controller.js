const userService = require("./user.service");

const handleError = (res, error) => {
  return res.status(error.status || 400).json({
    success: false,
    message: error.message || "Terjadi kesalahan",
  });
};

exports.getUsers = async (req, res) => {
  try {
    const data = await userService.getUsers(req.query);

    return res.status(200).json({
      success: true,
      message: "Data pengguna berhasil diambil",
      data,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await userService.getUserById(req.params.id);

    return res.status(200).json({
      success: true,
      message: "Data pengguna berhasil diambil",
      data: user,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

exports.createUser = async (req, res) => {
  try {
    const user = await userService.createUser(req.body);

    return res.status(201).json({
      success: true,
      message: "Pengguna berhasil ditambahkan",
      data: user,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

exports.updateUser = async (req, res) => {
  try {
    const user = await userService.updateUser(req.params.id, req.body);

    return res.status(200).json({
      success: true,
      message: "Pengguna berhasil diperbarui",
      data: user,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

exports.deleteUser = async (req, res) => {
  try {
    await userService.deleteUser(req.params.id);

    return res.status(200).json({
      success: true,
      message: "Pengguna berhasil dihapus",
    });
  } catch (error) {
    return handleError(res, error);
  }
};
