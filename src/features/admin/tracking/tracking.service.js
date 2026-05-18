const supabase = require("../../../core/config/supabase");

const WASH_STATUSES = new Set(["pending", "diproses", "selesai"]);
const DELIVERY_STATUSES = new Set(["siap_diantar", "diantar", "diterima"]);
const PICKUP_STATUSES = new Set(["siap_diambil", "diambil"]);

const normalizeStatus = (value) =>
	typeof value === "string" ? value.trim().toLowerCase() : value;

exports.getAllTracking = async (shopId, search = "", _status = "") => {
	let query = supabase
		.from("orders")
		.select(
			`
      id_orders,
      kode_order,
      status_order,
      metode_pengambilan,
      tgl_order,
      customers (
        nama
      ),
      detail_orders (
        id_detail_orders,
        merk,
        jenis_sepatu,
        total_harga
      )
    `,
		)
		.eq("id_shops", shopId)
		.eq("status_order", "selesai");

	if (search) {
		query = query.ilike("kode_order", `%${search}%`);
	}

	const { data, error } = await query.order("tgl_order", { ascending: false });

	if (error) throw error;
	return data;
};

exports.getTrackingDetail = async (orderId) => {
	const { data: order, error: orderError } = await supabase
		.from("orders")
		.select(
			`
      *,
      customers (nama, nomor_hp, alamat, latitude, longitude),
      detail_orders (*, services (*))
    `,
		)
		.eq("id_orders", orderId)
		.single();

	if (orderError) throw orderError;

	const { data: logs, error: logsError } = await supabase
		.from("tracking_logs")
		.select(
			`
      *,
      staff (
        id_staff,
        staff_profile (nama)
      )
    `,
		)
		.eq("id_orders", orderId)
		.order("waktu", { ascending: false });

	if (logsError) throw logsError;

	return {
		order,
		tracking_logs: logs,
	};
};

exports.updateStatus = async (orderId, shopId, payload) => {
	const {
		status,
		keterangan,
		latitude,
		longitude,
		id_staff,
		id_detail_orders,
		foto_type,
		is_validation,
	} = payload;

	const normalizedStatus = normalizeStatus(status);
	const orderUpdateData = {};

	if (
		normalizedStatus &&
		(DELIVERY_STATUSES.has(normalizedStatus) ||
			PICKUP_STATUSES.has(normalizedStatus))
	) {
		const { data: orderInfo, error: orderInfoError } = await supabase
			.from("orders")
			.select("status_order, metode_pengambilan")
			.eq("id_orders", orderId)
			.eq("id_shops", shopId)
			.single();

		if (orderInfoError) throw orderInfoError;

		const metodePengambilan = normalizeStatus(
			orderInfo.metode_pengambilan || "pickup",
		);
		const orderStatus = normalizeStatus(orderInfo.status_order);

		if (orderStatus !== "selesai") {
			throw new Error("Order belum selesai dicuci.");
		}

		if (
			DELIVERY_STATUSES.has(normalizedStatus) &&
			metodePengambilan !== "delivery"
		) {
			throw new Error(
				"Status pengantaran hanya untuk metode_pengambilan delivery.",
			);
		}

		if (
			PICKUP_STATUSES.has(normalizedStatus) &&
			metodePengambilan !== "pickup"
		) {
			throw new Error("Status pickup hanya untuk metode_pengambilan pickup.");
		}
	}

	if (normalizedStatus && WASH_STATUSES.has(normalizedStatus)) {
		orderUpdateData.status_order = normalizedStatus;
	}

	if (is_validation && payload.foto_url) {
		orderUpdateData.foto_validasi = payload.foto_url;
	}

	let orderData;

	if (Object.keys(orderUpdateData).length > 0) {
		const { data, error } = await supabase
			.from("orders")
			.update(orderUpdateData)
			.eq("id_orders", orderId)
			.eq("id_shops", shopId)
			.select()
			.single();

		if (error) throw error;
		orderData = data;
	} else {
		const { data, error } = await supabase
			.from("orders")
			.select("*")
			.eq("id_orders", orderId)
			.eq("id_shops", shopId)
			.single();

		if (error) throw error;
		orderData = data;
	}

	// 2. Add tracking log with geolocation
	const { error: logError } = await supabase.from("tracking_logs").insert([
		{
			id_orders: orderId,
			status: normalizedStatus || status,
			keterangan: keterangan,
			latitude: latitude,
			longitude: longitude,
			id_staff: id_staff,
			waktu: new Date().toISOString(),
		},
	]);

	if (logError) throw logError;

	// 3. Update detail_orders photo if provided (for processing phase)
	if (id_detail_orders && payload.foto_url && !is_validation) {
		const updateObj = {};
		if (foto_type === "sebelum") updateObj.foto_sebelum = payload.foto_url;
		if (foto_type === "sesudah") updateObj.foto_sesudah = payload.foto_url;

		if (Object.keys(updateObj).length > 0) {
			await supabase
				.from("detail_orders")
				.update(updateObj)
				.eq("id_detail_orders", id_detail_orders);
		}
	}

	return orderData;
};

exports.uploadImage = async (file) => {
	const timestamp = Date.now();
	const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase();
	const fileExt = file.originalname.split(".").pop();
	const fileName = `tracking_${timestamp}_${randomStr}.${fileExt}`;
	const filePath = `tracking/${fileName}`;

	const { data, error } = await supabase.storage
		.from("services")
		.upload(filePath, file.buffer, {
			contentType: file.mimetype,
		});

	if (error) throw error;

	const { data: publicUrlData } = supabase.storage
		.from("services")
		.getPublicUrl(filePath);

	return publicUrlData.publicUrl;
};

exports.deleteImage = async (url) => {
	try {
		const path = url.split("/storage/v1/object/public/services/")[1];
		if (path) {
			await supabase.storage.from("services").remove([path]);
		}
	} catch (error) {
		console.error("Failed to delete image:", error);
	}
};
