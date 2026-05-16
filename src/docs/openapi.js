const openapi = {
	openapi: "3.0.3",
	info: {
		title: "CareKicks API",
		version: "1.0.0",
		description: "API documentation for CareKicks backend.",
	},
	servers: [
		{
			url: "/api/v1",
			description: "Base API",
		},
	],
	tags: [
		{
			name: "Admin Tracking",
			description: "Admin tracking orders",
		},
		{
			name: "User Auth",
			description: "User registration and login",
		},
	],
	components: {
		securitySchemes: {
			bearerAuth: {
				type: "http",
				scheme: "bearer",
				bearerFormat: "JWT",
			},
		},
		schemas: {
			ErrorResponse: {
				type: "object",
				properties: {
					success: { type: "boolean" },
					message: { type: "string" },
					error_code: { type: "string" },
				},
				required: ["success", "message"],
			},
			ErrorMessageResponse: {
				type: "object",
				properties: {
					message: { type: "string" },
				},
				required: ["message"],
			},
			User: {
				type: "object",
				properties: {
					id_user: { type: "integer" },
					username: { type: "string" },
					password: {
						type: "string",
						description: "Hashed password stored in DB.",
					},
					jenis_role: { type: "string" },
					path_gambar: { type: "string", nullable: true },
					no_hp: { type: "string", nullable: true },
					nama: { type: "string", nullable: true },
					email: { type: "string", nullable: true },
				},
			},
			AuthRegisterRequest: {
				type: "object",
				properties: {
					nama: { type: "string" },
					no_hp: { type: "string" },
					email: { type: "string" },
					password: { type: "string" },
				},
				required: ["email", "password"],
			},
			AuthLoginRequest: {
				type: "object",
				properties: {
					email: { type: "string" },
					password: { type: "string" },
				},
				required: ["email", "password"],
			},
			AuthResponse: {
				type: "object",
				properties: {
					message: { type: "string" },
					token: { type: "string" },
					user: { $ref: "#/components/schemas/User" },
				},
				required: ["message", "token", "user"],
			},
			CustomerSummary: {
				type: "object",
				properties: {
					nama: { type: "string" },
				},
			},
			CustomerDetail: {
				type: "object",
				properties: {
					nama: { type: "string" },
					nomor_hp: { type: "string", nullable: true },
					alamat: { type: "string", nullable: true },
					latitude: { type: "number", nullable: true },
					longitude: { type: "number", nullable: true },
				},
			},
			Service: {
				type: "object",
				properties: {
					id_services: { type: "integer" },
					id_shops: { type: "integer" },
					nama_layanan: { type: "string" },
					harga: { type: "number", nullable: true },
					estimasi_waktu: { type: "string", nullable: true },
					deskripsi: { type: "string", nullable: true },
					is_active: { type: "boolean" },
					foto_layanan: { type: "string", nullable: true },
				},
			},
			DetailOrderSummary: {
				type: "object",
				properties: {
					id_detail_orders: { type: "integer" },
					merk: { type: "string", nullable: true },
					jenis_sepatu: { type: "string", nullable: true },
					total_harga: { type: "number", nullable: true },
				},
			},
			DetailOrder: {
				type: "object",
				properties: {
					id_detail_orders: { type: "integer" },
					id_orders: { type: "integer" },
					id_services: { type: "integer" },
					foto_sebelum: { type: "string", nullable: true },
					merk: { type: "string", nullable: true },
					jenis_sepatu: { type: "string", nullable: true },
					warna: { type: "string", nullable: true },
					foto_seblum: { type: "string", nullable: true },
					review: { type: "string", nullable: true },
					foto_sesudah: { type: "string", nullable: true },
					total_harga: { type: "number", nullable: true },
				},
			},
			DetailOrderWithService: {
				allOf: [
					{ $ref: "#/components/schemas/DetailOrder" },
					{
						type: "object",
						properties: {
							services: { $ref: "#/components/schemas/Service" },
						},
					},
				],
			},
			Order: {
				type: "object",
				properties: {
					id_orders: { type: "integer" },
					kode_order: { type: "string" },
					id_customer: { type: "integer" },
					id_shops: { type: "integer" },
					id_staff: { type: "integer", nullable: true },
					tgl_order: { type: "string", format: "date-time" },
					status_order: { type: "string" },
					metode_order: { type: "string", nullable: true },
					metode_bayar: { type: "string", nullable: true },
					upload_bkt_byr: { type: "string", nullable: true },
					alamat_pengantaran: { type: "string", nullable: true },
					lat_order: { type: "number", nullable: true },
					long_order: { type: "number", nullable: true },
					qr_image: { type: "string", nullable: true },
					link_qr: { type: "string", nullable: true },
					total_ongkir: { type: "number", nullable: true },
					status_pembayaran: { type: "string", nullable: true },
					catatan_pengiriman: { type: "string", nullable: true },
					foto_validasi: { type: "string", nullable: true },
				},
			},
			OrderWithRelations: {
				allOf: [
					{ $ref: "#/components/schemas/Order" },
					{
						type: "object",
						properties: {
							customers: { $ref: "#/components/schemas/CustomerDetail" },
							detail_orders: {
								type: "array",
								items: { $ref: "#/components/schemas/DetailOrderWithService" },
							},
						},
					},
				],
			},
			StaffProfileSummary: {
				type: "object",
				properties: {
					nama: { type: "string" },
				},
			},
			StaffSummary: {
				type: "object",
				properties: {
					id_staff: { type: "integer" },
					staff_profile: { $ref: "#/components/schemas/StaffProfileSummary" },
				},
			},
			TrackingLog: {
				type: "object",
				properties: {
					id_tracking_logs: { type: "integer" },
					status: { type: "string" },
					id_staff: { type: "integer", nullable: true },
					id_orders: { type: "integer" },
					waktu: { type: "string", format: "date-time" },
					keterangan: { type: "string", nullable: true },
					latitude: { type: "number", nullable: true },
					longitude: { type: "number", nullable: true },
					staff: { $ref: "#/components/schemas/StaffSummary" },
				},
			},
			TrackingOrderSummary: {
				type: "object",
				properties: {
					id_orders: { type: "integer" },
					kode_order: { type: "string" },
					status_order: { type: "string" },
					tgl_order: { type: "string", format: "date-time" },
					customers: { $ref: "#/components/schemas/CustomerSummary" },
					detail_orders: {
						type: "array",
						items: { $ref: "#/components/schemas/DetailOrderSummary" },
					},
				},
			},
			TrackingListResponse: {
				type: "object",
				properties: {
					success: { type: "boolean" },
					message: { type: "string" },
					data: {
						type: "array",
						items: { $ref: "#/components/schemas/TrackingOrderSummary" },
					},
				},
				required: ["success", "message", "data"],
			},
			TrackingDetailData: {
				type: "object",
				properties: {
					order: { $ref: "#/components/schemas/OrderWithRelations" },
					tracking_logs: {
						type: "array",
						items: { $ref: "#/components/schemas/TrackingLog" },
					},
				},
				required: ["order", "tracking_logs"],
			},
			TrackingDetailResponse: {
				type: "object",
				properties: {
					success: { type: "boolean" },
					message: { type: "string" },
					data: { $ref: "#/components/schemas/TrackingDetailData" },
				},
				required: ["success", "message", "data"],
			},
			TrackingUpdateResponse: {
				type: "object",
				properties: {
					success: { type: "boolean" },
					message: { type: "string" },
					data: { $ref: "#/components/schemas/Order" },
				},
				required: ["success", "message", "data"],
			},
		},
	},
	paths: {
		"/user/register": {
			post: {
				tags: ["User Auth"],
				summary: "Register user",
				requestBody: {
					required: true,
					content: {
						"application/json": {
							schema: { $ref: "#/components/schemas/AuthRegisterRequest" },
						},
					},
				},
				responses: {
					200: {
						description: "Register berhasil",
						content: {
							"application/json": {
								schema: { $ref: "#/components/schemas/AuthResponse" },
							},
						},
					},
					400: {
						description: "Bad request",
						content: {
							"application/json": {
								schema: { $ref: "#/components/schemas/ErrorMessageResponse" },
							},
						},
					},
				},
			},
		},
		"/user/login": {
			post: {
				tags: ["User Auth"],
				summary: "Login user",
				requestBody: {
					required: true,
					content: {
						"application/json": {
							schema: { $ref: "#/components/schemas/AuthLoginRequest" },
						},
					},
				},
				responses: {
					200: {
						description: "Login berhasil",
						content: {
							"application/json": {
								schema: { $ref: "#/components/schemas/AuthResponse" },
							},
						},
					},
					400: {
						description: "Bad request",
						content: {
							"application/json": {
								schema: { $ref: "#/components/schemas/ErrorMessageResponse" },
							},
						},
					},
				},
			},
		},
		"/admin/tracking": {
			get: {
				tags: ["Admin Tracking"],
				summary: "List tracking orders",
				security: [{ bearerAuth: [] }],
				parameters: [
					{
						name: "search",
						in: "query",
						description: "Filter by kode_order (partial match).",
						schema: { type: "string" },
					},
					{
						name: "status",
						in: "query",
						description: "Filter by status_order.",
						schema: { type: "string" },
					},
				],
				responses: {
					200: {
						description: "Tracking orders retrieved successfully",
						content: {
							"application/json": {
								schema: { $ref: "#/components/schemas/TrackingListResponse" },
								example: {
									success: true,
									message: "Tracking orders retrieved successfully",
									data: [
										{
											id_orders: 101,
											kode_order: "ORD20260516ABCD",
											status_order: "washing",
											tgl_order: "2026-05-16T08:15:30.000Z",
											customers: { nama: "Budi" },
											detail_orders: [
												{
													id_detail_orders: 501,
													merk: "Nike",
													jenis_sepatu: "Sneakers",
													total_harga: 120000,
												},
											],
										},
									],
								},
							},
						},
					},
					401: {
						description: "Unauthorized",
						content: {
							"application/json": {
								schema: { $ref: "#/components/schemas/ErrorResponse" },
							},
						},
					},
					500: {
						description: "Server error",
						content: {
							"application/json": {
								schema: { $ref: "#/components/schemas/ErrorResponse" },
							},
						},
					},
				},
			},
		},
		"/admin/tracking/{id_orders}": {
			get: {
				tags: ["Admin Tracking"],
				summary: "Get tracking detail for an order",
				security: [{ bearerAuth: [] }],
				parameters: [
					{
						name: "id_orders",
						in: "path",
						required: true,
						schema: { type: "integer" },
					},
				],
				responses: {
					200: {
						description: "Tracking detail retrieved successfully",
						content: {
							"application/json": {
								schema: { $ref: "#/components/schemas/TrackingDetailResponse" },
								example: {
									success: true,
									message: "Tracking detail retrieved successfully",
									data: {
										order: {
											id_orders: 101,
											kode_order: "ORD20260516ABCD",
											id_customer: 33,
											id_shops: 2,
											id_staff: 5,
											tgl_order: "2026-05-16T08:15:30.000Z",
											status_order: "washing",
											metode_order: "offline",
											metode_bayar: "cash",
											upload_bkt_byr: null,
											alamat_pengantaran: null,
											lat_order: null,
											long_order: null,
											qr_image: "qr_ORD20260516ABCD.png",
											link_qr:
												"https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=ORD20260516ABCD",
											total_ongkir: 0,
											status_pembayaran: "pending",
											catatan_pengiriman: null,
											foto_validasi: null,
											customers: {
												nama: "Budi",
												nomor_hp: "08123456789",
												alamat: "Jl. Mawar No. 12",
												latitude: -6.2,
												longitude: 106.8,
											},
											detail_orders: [
												{
													id_detail_orders: 501,
													id_orders: 101,
													id_services: 3,
													foto_sebelum:
														"https://cdn.example.com/tracking/sebelum.jpg",
													merk: "Nike",
													jenis_sepatu: "Sneakers",
													warna: "Hitam",
													foto_seblum: null,
													review: null,
													foto_sesudah: null,
													total_harga: 120000,
													services: {
														id_services: 3,
														id_shops: 2,
														nama_layanan: "Deep Clean",
														harga: 120000,
														estimasi_waktu: "2 hari",
														deskripsi: "Cuci mendalam untuk sepatu",
														is_active: true,
														foto_layanan: null,
													},
												},
											],
										},
										tracking_logs: [
											{
												id_tracking_logs: 9001,
												status: "washing",
												id_staff: 5,
												id_orders: 101,
												waktu: "2026-05-16T09:00:00.000Z",
												keterangan: "Sedang dicuci",
												latitude: -6.2,
												longitude: 106.8,
												staff: {
													id_staff: 5,
													staff_profile: { nama: "Andi" },
												},
											},
										],
									},
								},
							},
						},
					},
					401: {
						description: "Unauthorized",
						content: {
							"application/json": {
								schema: { $ref: "#/components/schemas/ErrorResponse" },
							},
						},
					},
					500: {
						description: "Server error",
						content: {
							"application/json": {
								schema: { $ref: "#/components/schemas/ErrorResponse" },
							},
						},
					},
				},
			},
			post: {
				tags: ["Admin Tracking"],
				summary: "Update tracking status and add log",
				security: [{ bearerAuth: [] }],
				parameters: [
					{
						name: "id_orders",
						in: "path",
						required: true,
						schema: { type: "integer" },
					},
				],
				requestBody: {
					required: true,
					content: {
						"multipart/form-data": {
							schema: {
								type: "object",
								required: ["status"],
								properties: {
									status: { type: "string" },
									keterangan: { type: "string" },
									latitude: { type: "number" },
									longitude: { type: "number" },
									id_staff: { type: "integer" },
									id_detail_orders: { type: "integer" },
									foto_type: {
										type: "string",
										enum: ["sebelum", "sesudah"],
										description:
											"Use 'sebelum' or 'sesudah' for washing photos.",
									},
									is_validation: {
										type: "boolean",
										description:
											"Set true for delivery validation photo (accepts true/false or 'true'/'false').",
									},
									foto: {
										type: "string",
										format: "binary",
										description: "Optional image upload.",
									},
								},
							},
							example: {
								status: "washing",
								keterangan: "Sedang dicuci",
								latitude: -6.2,
								longitude: 106.8,
								id_staff: 5,
								id_detail_orders: 501,
								foto_type: "sebelum",
								is_validation: false,
								foto: "<binary file>",
							},
						},
					},
				},
				responses: {
					200: {
						description: "Order status updated successfully",
						content: {
							"application/json": {
								schema: { $ref: "#/components/schemas/TrackingUpdateResponse" },
								example: {
									success: true,
									message: "Order status updated successfully",
									data: {
										id_orders: 101,
										kode_order: "ORD20260516ABCD",
										id_customer: 33,
										id_shops: 2,
										id_staff: 5,
										tgl_order: "2026-05-16T08:15:30.000Z",
										status_order: "washing",
										metode_order: "offline",
										metode_bayar: "cash",
										upload_bkt_byr: null,
										alamat_pengantaran: null,
										lat_order: null,
										long_order: null,
										qr_image: "qr_ORD20260516ABCD.png",
										link_qr:
											"https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=ORD20260516ABCD",
										total_ongkir: 0,
										status_pembayaran: "pending",
										catatan_pengiriman: null,
										foto_validasi: null,
									},
								},
							},
						},
					},
					400: {
						description: "Bad request",
						content: {
							"application/json": {
								schema: { $ref: "#/components/schemas/ErrorResponse" },
							},
						},
					},
					401: {
						description: "Unauthorized",
						content: {
							"application/json": {
								schema: { $ref: "#/components/schemas/ErrorResponse" },
							},
						},
					},
					500: {
						description: "Server error",
						content: {
							"application/json": {
								schema: { $ref: "#/components/schemas/ErrorResponse" },
							},
						},
					},
				},
			},
		},
	},
};

module.exports = openapi;
