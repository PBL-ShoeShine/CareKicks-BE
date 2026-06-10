const { getDetailOrder } = require("./detail_order.service");
const supabase = require("../../../core/config/supabase");

const getDetailOrderHandler = async (req, res) => {
  try {
    const userId = req.user.id;
    const { orderId } = req.params;

    // lookup id_customers dari id_user
    const { data: customer, error: customerError } = await supabase
      .from("customers")
      .select("id_customers")
      .eq("id_user", userId)
      .single();

    if (customerError || !customer) {
      return res.status(404).json({
        status: "error",
        message: "Data customer tidak ditemukan",
      });
    }

    const data = await getDetailOrder(orderId, customer.id_customers);

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
