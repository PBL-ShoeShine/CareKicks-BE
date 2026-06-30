const tokoService = require("./toko.service");

exports.getShopProfile = async (req, res) => {
	try {
		const profile = await tokoService.getShopProfile(req.user);

		return res.status(200).json({
			success: true,
			message: "Shop profile retrieved successfully",
			data: profile,
		});
	} catch (error) {
		console.error(error);
		return res.status(500).json({
			success: false,
			message: error.message,
		});
	}
};

exports.getOperatingHours = async (req, res) => {
	try {
		const hours = await tokoService.getOperatingHours(req.user);

		return res.status(200).json({
			success: true,
			message: "Shop operating hours retrieved successfully",
			data: hours,
		});
	} catch (error) {
		console.error(error);
		return res.status(500).json({
			success: false,
			message: error.message,
		});
	}
};

const parseTimeToMinutes = (value) => {
	const match = /^([01]\d|2[0-3]):([0-5]\d)(?::([0-5]\d))?$/.exec(value);
	if (!match) return null;
	const hours = Number(match[1]);
	const minutes = Number(match[2]);
	return hours * 60 + minutes;
};

exports.updateShopProfile = async (req, res) => {
	try {
		const {
			nm_toko,
			desk_toko,
			alamat_toko,
			lat_toko,
			long_toko,
			spesialisasi,
			tgl_berdiri,
		} = req.body || {};
		const file = req.file;

		const isLatProvided = lat_toko !== undefined;
		const isLongProvided = long_toko !== undefined;
		const parsedLat =
			lat_toko === "" || lat_toko === null
				? null
				: isLatProvided
					? Number.parseFloat(lat_toko)
					: undefined;
		const parsedLong =
			long_toko === "" || long_toko === null
				? null
				: isLongProvided
					? Number.parseFloat(long_toko)
					: undefined;

		if (isLatProvided && Number.isNaN(parsedLat)) {
			return res.status(400).json({
				success: false,
				message: "lat_toko must be a valid number",
			});
		}

		if (isLongProvided && Number.isNaN(parsedLong)) {
			return res.status(400).json({
				success: false,
				message: "long_toko must be a valid number",
			});
		}

		const hasUpdates =
			nm_toko !== undefined ||
			desk_toko !== undefined ||
			alamat_toko !== undefined ||
			isLatProvided ||
			isLongProvided ||
			spesialisasi !== undefined ||
			tgl_berdiri !== undefined ||
			Boolean(file);

		if (!hasUpdates) {
			return res.status(400).json({
				success: false,
				message: "No profile fields to update",
			});
		}

		const updated = await tokoService.updateShopProfile(req.user, {
			nm_toko,
			desk_toko,
			alamat_toko,
			lat_toko: parsedLat,
			long_toko: parsedLong,
			spesialisasi,
			tgl_berdiri,
			file,
		});

		return res.status(200).json({
			success: true,
			message: "Shop profile updated successfully",
			data: updated,
		});
	} catch (error) {
		console.error(error);
		return res.status(500).json({
			success: false,
			message: error.message,
		});
	}
};

exports.updateOperatingHours = async (req, res) => {
	try {
		const { hours } = req.body || {};

		if (!Array.isArray(hours) || hours.length !== 7) {
			return res.status(400).json({
				success: false,
				message: "hours must be an array with 7 entries",
			});
		}

		const seenDays = new Set();
		const normalized = hours.map((item) => {
			const day = Number(item?.day_of_week);
			if (!Number.isInteger(day) || day < 1 || day > 7) {
				throw new Error("day_of_week must be an integer between 1 and 7");
			}

			if (seenDays.has(day)) {
				throw new Error("day_of_week must be unique");
			}
			seenDays.add(day);

			if (typeof item?.is_open !== "boolean") {
				throw new Error("is_open must be a boolean");
			}

			const openTime = item.open_time === "" ? null : (item.open_time ?? null);
			const closeTime =
				item.close_time === "" ? null : (item.close_time ?? null);

			if ((openTime && !closeTime) || (!openTime && closeTime)) {
				throw new Error("open_time and close_time must be provided together");
			}

			if (openTime && closeTime) {
				const openMinutes = parseTimeToMinutes(openTime);
				const closeMinutes = parseTimeToMinutes(closeTime);
				if (openMinutes === null || closeMinutes === null) {
					throw new Error("open_time and close_time must be HH:MM or HH:MM:SS");
				}
				if (openMinutes >= closeMinutes) {
					throw new Error("open_time must be earlier than close_time");
				}
			}

			return {
				day_of_week: day,
				is_open: item.is_open,
				open_time: openTime,
				close_time: closeTime,
			};
		});

		const updated = await tokoService.updateOperatingHours(req.user, normalized);

		return res.status(200).json({
			success: true,
			message: "Shop operating hours updated successfully",
			data: updated,
		});
	} catch (error) {
		console.error(error);
		return res.status(400).json({
			success: false,
			message: error.message,
		});
	}
};

exports.submitAppeal = async (req, res) => {
	try {
		const { alasan_banding } = req.body || {};
		const data = await tokoService.submitAppeal(req.user, { alasan_banding, file: req.file });

		return res.status(200).json({
			success: true,
			message: "Pengajuan banding berhasil diajukan",
			data,
		});
	} catch (error) {
		console.error(error);
		return res.status(400).json({
			success: false,
			message: error.message || "Gagal mengajukan banding",
		});
	}
};

