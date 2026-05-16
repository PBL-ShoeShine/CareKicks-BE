const trackingService = require("./tracking.service");
const supabase = require("../../../core/config/supabase");

// Helper to get shop id
const getShopIdByUser = async (userId) => {
	const { data, error } = await supabase
		.from("shops_admin")
		.select(
			`
      id_shops_admin,
      shops (
        id_shops
      )
    `,
		)
		.eq("id_user", userId)
		.single();

	if (error || !data || !data.shops || data.shops.length === 0) {
		throw new Error("Shop not found for this admin user");
	}

	return data.shops[0].id_shops;
};

exports.getAllTracking = async (req, res) => {
	try {
		const userId = req.user.id;
		const { search = "", status = "" } = req.query;

		const shopId = await getShopIdByUser(userId);

		const orders = await trackingService.getAllTracking(shopId, search, status);

		return res.status(200).json({
			success: true,
			message: "Tracking orders retrieved successfully",
			data: orders,
		});
	} catch (error) {
		console.error(error);
		return res.status(500).json({
			success: false,
			message: error.message,
		});
	}
};

exports.getTrackingDetail = async (req, res) => {
	try {
		const { id_orders } = req.params;

		const detail = await trackingService.getTrackingDetail(id_orders);

		return res.status(200).json({
			success: true,
			message: "Tracking detail retrieved successfully",
			data: detail,
		});
	} catch (error) {
		console.error(error);
		return res.status(500).json({
			success: false,
			message: error.message,
		});
	}
};

exports.updateTrackingStatus = async (req, res) => {
	try {
		const userId = req.user.id;
		const { id_orders } = req.params;
		const {
			status,
			keterangan,
			latitude,
			longitude,
			id_staff,
			id_detail_orders,
			foto_type,
			is_validation, // Flag if this is a validation/delivery photo
		} = req.body;
		const file = req.file;

		if (!status) {
			return res.status(400).json({
				success: false,
				message: "Status is required",
			});
		}

		const shopId = await getShopIdByUser(userId);

		let fotoUrl = null;
		if (file) {
			fotoUrl = await trackingService.uploadImage(file);
		}

		const updatedOrder = await trackingService.updateStatus(id_orders, shopId, {
			status,
			keterangan,
			latitude: latitude ? parseFloat(latitude) : null,
			longitude: longitude ? parseFloat(longitude) : null,
			id_staff,
			id_detail_orders,
			foto_type,
			foto_url: fotoUrl,
			is_validation: is_validation === "true" || is_validation === true,
		});

		return res.status(200).json({
			success: true,
			message: "Order status updated successfully",
			data: updatedOrder,
		});
	} catch (error) {
		console.error(error);
		return res.status(500).json({
			success: false,
			message: error.message,
		});
	}
};
