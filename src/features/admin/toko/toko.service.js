const supabase = require("../../../core/config/supabase");
const shopAccess = require("../../../core/services/shop-access.service");

const DAY_NAMES = {
	1: "Senin",
	2: "Selasa",
	3: "Rabu",
	4: "Kamis",
	5: "Jumat",
	6: "Sabtu",
	7: "Minggu",
};

const getShopByUser = async (authUser) => (await shopAccess.getShopForUser(authUser)).shop;

const SHOP_SELECT =
	"id_shops, nm_toko, desk_toko, alamat_toko, lat_toko, long_toko, foto_toko, spesialisasi, tgl_berdiri";

const resolveStoragePath = (urlOrPath) => {
	if (!urlOrPath) return null;

	const publicPrefix = "/storage/v1/object/public/services/";
	if (urlOrPath.includes(publicPrefix)) {
		return urlOrPath.split(publicPrefix)[1];
	}

	if (urlOrPath.startsWith("http")) {
		return urlOrPath.split("/").pop();
	}

	return urlOrPath;
};

exports.uploadShopImage = async (file) => {
	if (!file) return null;

	const timestamp = Date.now();
	const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase();
	const fileExtension = file.originalname.split(".").pop();
	const fileName = `shop_${timestamp}_${randomStr}.${fileExtension}`;
	const filePath = `shops/${fileName}`;

	const { error } = await supabase.storage
		.from("services")
		.upload(filePath, file.buffer, {
			contentType: file.mimetype,
			upsert: false,
		});

	if (error) throw error;

	const { data: publicData } = supabase.storage
		.from("services")
		.getPublicUrl(filePath);

	return publicData.publicUrl;
};

exports.deleteShopImage = async (imageUrl) => {
	const path = resolveStoragePath(imageUrl);
	if (!path) return;

	try {
		const { error } = await supabase.storage.from("services").remove([path]);

		if (error) {
			console.error("Error deleting shop image:", error);
		}
	} catch (error) {
		console.error("Error deleting shop image:", error);
	}
};

exports.getShopProfile = async (authUser) => {
	const shop = await getShopByUser(authUser);
	const userId = shopAccess.getUserId(authUser);

	const { data: userData, error: userError } = await supabase
		.from("users")
		.select("email, no_hp")
		.eq("id_user", userId)
		.single();

	if (userError || !userData) {
		throw userError || new Error("User not found");
	}

	return {
		id_shops: shop.id_shops,
		nm_toko: shop.nm_toko,
		desk_toko: shop.desk_toko,
		alamat_toko: shop.alamat_toko,
		lat_toko: shop.lat_toko,
		long_toko: shop.long_toko,
		foto_toko: shop.foto_toko,
		spesialisasi: shop.spesialisasi,
		tgl_berdiri: shop.tgl_berdiri,
		jam_buka: shop.jam_buka,
		jam_tutup: shop.jam_tutup,
		status_verifikasi: shop.status_verifikasi,
		alasan_penangguhan: shop.alasan_penangguhan,
		email_toko: userData.email,
		wa_toko: userData.no_hp,
	};
};

exports.getOperatingHours = async (authUser) => {
	const shop = await getShopByUser(authUser);

	const { data, error } = await supabase
		.from("shop_operating_hours")
		.select(
			"id_shop_operating_hours, day_of_week, is_open, open_time, close_time",
		)
		.eq("id_shops", shop.id_shops)
		.order("day_of_week", { ascending: true });

	if (error) throw error;

	return (data || []).map((row) => ({
		...row,
		day_name: DAY_NAMES[row.day_of_week] || null,
	}));
};

exports.updateShopProfile = async (authUser, payload) => {
	const {
		nm_toko,
		desk_toko,
		alamat_toko,
		lat_toko,
		long_toko,
		spesialisasi,
		tgl_berdiri,
		file,
	} = payload;

	const shop = await getShopByUser(authUser);

	let fotoUrl;
	if (file) {
		if (shop.foto_toko) {
			await exports.deleteShopImage(shop.foto_toko);
		}
		fotoUrl = await exports.uploadShopImage(file);
	}

	const updateData = {};

	if (nm_toko !== undefined) updateData.nm_toko = nm_toko;
	if (desk_toko !== undefined) updateData.desk_toko = desk_toko;
	if (alamat_toko !== undefined) updateData.alamat_toko = alamat_toko;
	if (lat_toko !== undefined) updateData.lat_toko = lat_toko;
	if (long_toko !== undefined) updateData.long_toko = long_toko;
	if (spesialisasi !== undefined) updateData.spesialisasi = spesialisasi;
	if (tgl_berdiri !== undefined) updateData.tgl_berdiri = tgl_berdiri;
	if (fotoUrl !== undefined) updateData.foto_toko = fotoUrl;

	const { error } = await supabase
		.from("shops")
		.update(updateData)
		.eq("id_shops", shop.id_shops)
		.select(SHOP_SELECT)
		.single();

	if (error) throw error;

	return exports.getShopProfile(authUser);
};

exports.updateOperatingHours = async (authUser, hours) => {
	const shop = await getShopByUser(authUser);
	const now = new Date().toISOString();

	const payload = hours.map((item) => ({
		id_shops: shop.id_shops,
		day_of_week: item.day_of_week,
		is_open: item.is_open,
		open_time: item.open_time,
		close_time: item.close_time,
		updated_at: now,
	}));

	const { data, error } = await supabase
		.from("shop_operating_hours")
		.upsert(payload, { onConflict: "id_shops,day_of_week" })
		.select(
			"id_shop_operating_hours, day_of_week, is_open, open_time, close_time",
		);

	if (error) throw error;

	return (data || [])
		.sort((a, b) => a.day_of_week - b.day_of_week)
		.map((row) => ({
			...row,
			day_name: DAY_NAMES[row.day_of_week] || null,
		}));
};

exports.submitAppeal = async (authUser, { alasan_banding, file }) => {
	const shop = await getShopByUser(authUser);

	if (!alasan_banding || alasan_banding.trim() === "") {
		throw new Error("Alasan banding tidak boleh kosong");
	}

	if (shop.status_verifikasi !== "suspended") {
		throw new Error("Toko tidak dalam status ditangguhkan");
	}

	// 1. Upload proof file if exists
	let fotoUrl = null;
	if (file) {
		const timestamp = Date.now();
		const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase();
		const fileExtension = file.originalname.split(".").pop();
		const fileName = `appeal_${timestamp}_${randomStr}.${fileExtension}`;
		const filePath = `shops/${fileName}`;

		const { error: uploadError } = await supabase.storage
			.from("services")
			.upload(filePath, file.buffer, {
				contentType: file.mimetype,
				upsert: false,
			});

		if (uploadError) throw uploadError;

		const { data: publicData } = supabase.storage
			.from("services")
			.getPublicUrl(filePath);

		fotoUrl = publicData.publicUrl;
	}

	// Prepare updated alasan_penangguhan: combine original suspension reason with appeal message
	const originalReason = shop.alasan_penangguhan || "Ditangguhkan oleh SuperAdmin";
	let formattedReason = `Alasan Penangguhan: ${originalReason} | Banding: ${alasan_banding.trim()}`;
	if (fotoUrl) {
		formattedReason += ` | Bukti: ${fotoUrl}`;
	}

	const { data, error } = await supabase
		.from("shops")
		.update({
			status_verifikasi: "appealed",
			alasan_penangguhan: formattedReason
		})
		.eq("id_shops", shop.id_shops)
		.select()
		.single();

	if (error) throw error;
	return data;
};

