module.exports = {
  BankAccount: {
    type: "object",
    properties: {
      id_account: {
        type: "integer",
        description: "ID unik rekening bank",
        example: 1,
      },
      id_shops: {
        type: "integer",
        description: "ID toko pemilik rekening",
        example: 1,
      },
      nama_bank: {
        type: "string",
        description: "Nama bank (misal: BCA, Mandiri, BRI)",
        example: "BCA",
      },
      no_rek: {
        type: "string",
        description: "Nomor rekening bank",
        example: "1234567890",
      },
      atas_nama: {
        type: "string",
        description: "Nama pemilik rekening",
        example: "Shoes Clean Semarang",
      },
    },
  },
};
