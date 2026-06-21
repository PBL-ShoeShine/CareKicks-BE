module.exports = {
  "/admin/metode_pembayaran": {
    get: {
      tags: ["Admin Metode Pembayaran"],
      summary: "Ambil daftar semua metode pembayaran toko",
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description: "Berhasil mengambil data",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/PaymentMethodResponse" },
            },
          },
        },
      },
    },
    post: {
      tags: ["Admin Metode Pembayaran"],
      summary: "Tambah metode pembayaran baru",
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["tipe_pembayaran", "nama_bank", "no_rek", "atas_nama"],
              properties: {
                tipe_pembayaran: { type: "string", example: "Transfer Bank" },
                nama_bank: { type: "string", example: "Mandiri" },
                no_rek: { type: "string", example: "0987654321" },
                atas_nama: { type: "string", example: "CareKicks" },
                is_default: { type: "boolean", example: false },
              },
            },
          },
        },
      },
      responses: {
        201: {
          description: "Berhasil ditambahkan",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/PaymentMethodSingleResponse",
              },
            },
          },
        },
      },
    },
  },
  "/admin/metode_pembayaran/{id}": {
    put: {
      tags: ["Admin Metode Pembayaran"],
      summary: "Update data metode pembayaran",
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: "id", in: "path", required: true, schema: { type: "integer" } },
      ],
      requestBody: {
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                nama_bank: { type: "string" },
                no_rek: { type: "string" },
                atas_nama: { type: "string" },
                is_default: { type: "boolean" },
              },
            },
          },
        },
      },
      responses: { 200: { description: "Berhasil diupdate" } },
    },
    delete: {
      tags: ["Admin Metode Pembayaran"],
      summary: "Hapus metode pembayaran",
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: "id", in: "path", required: true, schema: { type: "integer" } },
      ],
      responses: { 200: { description: "Berhasil dihapus" } },
    },
  },
  "/admin/metode_pembayaran/{id}/status": {
    patch: {
      tags: ["Admin Metode Pembayaran"],
      summary: "Ubah status Aktif/Nonaktif",
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: "id", in: "path", required: true, schema: { type: "integer" } },
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["is_active"],
              properties: { is_active: { type: "boolean" } },
            },
          },
        },
      },
      responses: { 200: { description: "Status berhasil diubah" } },
    },
  },
  "/admin/metode_pembayaran/{id}/qris-image": {
    put: {
      tags: ["Admin Metode Pembayaran"],
      summary: "Upload gambar QRIS",
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: "id", in: "path", required: true, schema: { type: "integer" } },
      ],
      requestBody: {
        required: true,
        content: {
          "multipart/form-data": {
            schema: {
              type: "object",
              required: ["image"],
              properties: {
                image: {
                  type: "string",
                  format: "binary",
                  description: "File gambar QRIS",
                },
              },
            },
          },
        },
      },
      responses: { 200: { description: "QRIS berhasil diunggah" } },
    },
  },
};
