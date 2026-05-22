const { getRiwayat } = require("./riwayat.service");

const getRiwayatHandler = async (req, res) => {
  try {
    const customerId = req.user.id; // dari middleware auth
    const { status, search } = req.query;

    const data = await getRiwayat(customerId, { status, search });

    return res.status(200).json({
      status: "success",
      data,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

module.exports = { getRiwayatHandler };