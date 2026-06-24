require("dotenv").config();
const service = require("../src/features/user/user.service");

async function run() {
  try {
    const result = await service.login({
      email: "dewangga@mail.com",
      password: "12345678"
    });
    console.log("LOGIN RESULT:", JSON.stringify(result, null, 2));
  } catch (error) {
    console.error("LOGIN ERROR:", error);
  }
}

run();
