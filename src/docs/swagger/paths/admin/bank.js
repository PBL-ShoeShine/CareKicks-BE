// docs/swagger/paths/admin/bank.js
module.exports = {
  "/admin/bank-accounts": {
    get: {
      tags: ["Admin Toko"],
      summary: "Admin: Ambil daftar semua rekening bank toko",
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description: "Daftar rekening bank toko",
          content: {
            "application/json": {
              schema: {
                type: "array",
                items: { $ref: "#/components/schemas/BankAccount" },
              },
            },
          },
        },
      },
    },
    post: {
      tags: ["Admin Toko"],
      summary: "Admin: Tambah rekening bank baru",
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/BankAccount" },
          },
        },
      },
      responses: { 201: { description: "Rekening berhasil dibuat" } },
    },
  },
  "/admin/bank-accounts/{id}": {
    put: {
      tags: ["Admin Toko"],
      summary: "Admin: Update rekening bank",
      parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string" } },
      ],
      responses: { 200: { description: "Rekening berhasil diupdate" } },
    },
    delete: {
      tags: ["Admin Toko"],
      summary: "Admin: Hapus rekening bank",
      parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string" } },
      ],
      responses: { 200: { description: "Rekening berhasil dihapus" } },
    },
  },
};
