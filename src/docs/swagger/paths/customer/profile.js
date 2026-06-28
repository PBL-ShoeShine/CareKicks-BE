module.exports = {
  "/customer/profile": {
    get: {
      tags: ["Customer - Profile"],
      summary: "Ambil data profil customer",
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description: "Data profil berhasil diambil",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CustomerProfileResponse" },
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
      },
    },
    put: {
      tags: ["Customer - Profile"],
      summary: "Update profil customer (nama, gender, birthday)",
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/UpdateCustomerProfileRequest" },
          },
        },
      },
      responses: {
        200: {
          description: "Profil berhasil diperbarui",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/SuccessResponse" },
            },
          },
        },
      },
    },
  },

  "/customer/profile/picture": {
    put: {
      tags: ["Customer - Profile"],
      summary: "Update foto profil customer",
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "multipart/form-data": {
            schema: {
              type: "object",
              properties: {
                image: {
                  type: "string",
                  format: "binary",
                  description: "File gambar foto profil",
                },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: "Foto profil berhasil diperbarui",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/SuccessResponse" },
            },
          },
        },
      },
    },
  },

  "/customer/profile/request-email-change": {
    post: {
      tags: ["Customer - Profile"],
      summary: "Request perubahan email (kirim link verifikasi)",
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/RequestEmailChangeRequest" },
          },
        },
      },
      responses: {
        200: {
          description: "Link verifikasi terkirim",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/SuccessResponse" },
            },
          },
        },
      },
    },
  },

  "/customer/profile/phone": {
    put: {
      tags: ["Customer - Profile"],
      summary: "Update nomor HP customer (butuh konfirmasi password)",
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/UpdateCustomerPhoneRequest" },
          },
        },
      },
      responses: {
        200: {
          description: "Nomor telepon berhasil diperbarui",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/SuccessResponse" },
            },
          },
        },
        400: {
          description: "Bad request - password salah atau nomor sudah digunakan",
        },
      },
    },
  },

  // PASSWORD ROUTES
  "/customer/profile/verify-old-password": {
    post: {
      tags: ["Customer - Profile"],
      summary: "Verifikasi password lama",
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/VerifyOldPasswordRequest" },
          },
        },
      },
      responses: {
        200: {
          description: "Password cocok",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/SuccessResponse" },
            },
          },
        },
      },
    },
  },

  "/customer/profile/change-password-direct": {
    put: {
      tags: ["Customer - Profile"],
      summary: "Ganti password langsung (menggunakan password lama)",
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/ChangePasswordDirectRequest" },
          },
        },
      },
      responses: {
        200: {
          description: "Password berhasil diganti",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/SuccessResponse" },
            },
          },
        },
      },
    },
  },

  "/customer/profile/request-otp": {
    post: {
      tags: ["Customer - Profile"],
      summary: "Request OTP untuk ganti password",
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/RequestOtpRequest" },
          },
        },
      },
      responses: {
        200: {
          description: "OTP terkirim",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/SuccessResponse" },
            },
          },
        },
      },
    },
  },

  "/customer/profile/verify-otp": {
    post: {
      tags: ["Customer - Profile"],
      summary: "Verifikasi kode OTP",
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/VerifyOtpRequest" },
          },
        },
      },
      responses: {
        200: {
          description: "OTP valid",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/SuccessResponse" },
            },
          },
        },
      },
    },
  },

  "/customer/profile/change-password-otp": {
    put: {
      tags: ["Customer - Profile"],
      summary: "Ganti password menggunakan OTP",
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/ChangePasswordOtpRequest" },
          },
        },
      },
      responses: {
        200: {
          description: "Password berhasil diganti",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/SuccessResponse" },
            },
          },
        },
      },
    },
  },

  // ADDRESS ROUTES
  "/customer/addresses": {
    get: {
      tags: ["Customer - Profile"],
      summary: "Ambil daftar alamat customer",
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description: "Daftar alamat berhasil diambil",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CustomerAddressListResponse" },
            },
          },
        },
      },
    },
    post: {
      tags: ["Customer - Profile"],
      summary: "Tambah alamat baru",
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/AddCustomerAddressRequest" },
          },
        },
      },
      responses: {
        201: {
          description: "Alamat berhasil ditambahkan",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  data: { $ref: "#/components/schemas/CustomerAddress" },
                },
              },
            },
          },
        },
      },
    },
  },

  "/customer/addresses/{id_address}": {
    put: {
      tags: ["Customer - Profile"],
      summary: "Update alamat customer",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "id_address",
          in: "path",
          required: true,
          schema: { type: "integer" },
        },
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/UpdateCustomerAddressRequest" },
          },
        },
      },
      responses: {
        200: {
          description: "Alamat berhasil diperbarui",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  data: { $ref: "#/components/schemas/CustomerAddress" },
                },
              },
            },
          },
        },
      },
    },
    delete: {
      tags: ["Customer - Profile"],
      summary: "Hapus alamat customer",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "id_address",
          in: "path",
          required: true,
          schema: { type: "integer" },
        },
      ],
      responses: {
        200: {
          description: "Alamat berhasil dihapus",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/SuccessResponse" },
            },
          },
        },
      },
    },
  },

  "/customer/addresses/{id_address}/default": {
    patch: {
      tags: ["Customer - Profile"],
      summary: "Set alamat sebagai default",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "id_address",
          in: "path",
          required: true,
          schema: { type: "integer" },
        },
      ],
      responses: {
        200: {
          description: "Alamat default berhasil diset",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/SuccessResponse" },
            },
          },
        },
      },
    },
  },
};
