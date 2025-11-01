const chai = require("chai");
const chaiHttp = require("chai-http");
const jwt = require("jsonwebtoken");
const App = require("../app");
const expect = chai.expect;
require("dotenv").config();

chai.use(chaiHttp);

describe("Products", () => {
  let app;
  let authToken;

  before(async () => {
    app = new App();
    await Promise.all([app.connectDB(), app.setupMessageBroker()]);

    try {
      // 🔐 Gửi yêu cầu đến Auth service để đăng nhập và lấy token
      const authRes = await chai
        .request("http://localhost:3000")
        .post("/login")
        .send({
          username: process.env.LOGIN_TEST_USER,
          password: process.env.LOGIN_TEST_PASSWORD,
        });

      // ✅ Lấy token từ các trường có thể
      authToken =
        authRes.body.accessToken ||
        authRes.body.token ||
        authRes.body.jwt ||
        (authRes.body.data && authRes.body.data.token);

      console.log("✅ Auth token received:", authToken);
    } catch (error) {
      console.warn("⚠️ Auth service not available or login failed:", error.message);
    }

    // 🔄 Nếu không lấy được token thật, tạo JWT giả để test không bị lỗi
    if (!authToken) {
      console.warn("⚠️ Using fallback JWT for CI tests...");
      authToken = jwt.sign(
        { id: "ci-test-user", role: "provider" },
        process.env.JWT_SECRET || "idontknow",
        { expiresIn: "1h" }
      );
    }

    // 🚀 Khởi động server product
    app.start();
  });

  after(async () => {
    await app.disconnectDB();
    app.stop();
  });

  describe("POST /products", () => {
    it("should create a new product", async () => {
      const product = {
        name: "Product 1",
        description: "Description of Product 1",
        price: 10,
      };

      const res = await chai
        .request(app.app)
        .post("/api/products")
        .set("Authorization", `Bearer ${authToken}`)
        .send(product);

      expect(res).to.have.status(201);
      expect(res.body).to.have.property("_id");
      expect(res.body).to.have.property("name", product.name);
      expect(res.body).to.have.property("description", product.description);
      expect(res.body).to.have.property("price", product.price);
    });

    it("should return an error if name is missing", async () => {
      const product = {
        description: "Description of Product 1",
        price: 10.99,
      };

      const res = await chai
        .request(app.app)
        .post("/api/products")
        .set("Authorization", `Bearer ${authToken}`)
        .send(product);

      expect(res).to.have.status(400);
    });
  });
});
