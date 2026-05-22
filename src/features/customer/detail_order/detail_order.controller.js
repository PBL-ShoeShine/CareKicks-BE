const { getDetailOrder } = require("./detail_order.service");

const getDetailOrderHandler = async (req, res) => {
  try {
    const customerId = req.user.id;
    const { orderId } = req.params;

    const data = await getDetailOrder(orderId, customerId);

    return res.status(200).json({
      status: "success",
      data,
    });
  } catch (error) {
    if (error.message === "Pesanan tidak ditemukan") {
      return res.status(404).json({
        status: "error",
        message: error.message,
      });
    }
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

module.exports = { getDetailOrderHandler };
