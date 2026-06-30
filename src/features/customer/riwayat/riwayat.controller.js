const { getRiwayat } = require("./riwayat.service");
const supabase = require("../../../core/config/supabase");

const getRiwayatHandler = async (req, res) => {
  try {
    const userId = req.user.id;
    const { status, search } = req.query;

    const { data: customer, error: customerError } = await supabase
      .from("customers")
      .select("id_customers")
      .eq("id_user", userId)
      .single();


    if (customerError || !customer) {
      return res.status(200).json({
        status: "success",
        data: [], 
      });
    }

    const data = await getRiwayat(customer.id_customers, { status, search });

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