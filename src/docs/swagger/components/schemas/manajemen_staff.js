module.exports = {
  StaffItem: {
    type: "object",
    properties: {
      id_staff: { type: "integer" },
      email: { type: "string", format: "email" },
      // HAPUS role: ...
      status: { type: "string", enum: ["AKTIF", "CUTI", "NONAKTIF"] },
      id_shops: { type: "integer" },
      staff_profile: {
        type: "object",
        properties: {
          nama: { type: "string" },
          no_hp: { type: "string", nullable: true },
        },
      },
    },
  },

  StaffRegisterRequest: {
    type: "object",
    required: ["nama", "email", "password", "no_hp"], // Hapus "role" dari required
    properties: {
      nama: { type: "string" },
      email: { type: "string", format: "email" },
      password: { type: "string", format: "password" },
      no_hp: { type: "string" },
      // HAPUS role: ...
    },
  },

  StaffUpdateRequest: {
    type: "object",
    properties: {
      nama: { type: "string" },
      no_hp: { type: "string" },
      status: { type: "string", enum: ["AKTIF", "CUTI", "NONAKTIF"] },
      // HAPUS role: ...
    },
  },

  // Update juga bagian 'example' di StaffListResponse, StaffDetailResponse, StaffRegisterResponse, StaffUpdateResponse
  // agar tidak menyertakan field "role".
};
