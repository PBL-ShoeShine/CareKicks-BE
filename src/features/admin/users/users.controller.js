const usersService = require("./users.service");

exports.getUsers = async (req, res, next) => {
  try {
    const { search, page, limit } = req.query;
    const data = await usersService.getUsers({
      search: search || "",
      page: parseInt(page, 10) || 1,
      limit: parseInt(limit, 10) || 10
    });
    return res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    next(error);
  }
};

exports.createUser = async (req, res, next) => {
  try {
    const data = await usersService.createUser(req.body);
    return res.status(201).json({
      success: true,
      message: "User berhasil dibuat",
      data
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

exports.updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = await usersService.updateUser(id, req.body);
    return res.status(200).json({
      success: true,
      message: "User berhasil diperbarui",
      data
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = await usersService.deleteUser(id);
    return res.status(200).json({
      success: true,
      message: data.message
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};
