
const express = require("express");
const mysql = require("mysql2/promise");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = 3000;

const db = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "1234",
    database: "four_chicken",
    port: 3306,
    charset: "utf8mb4"
});

app.use(cors());
app.use(express.json());


app.post("/api/create-order", async (req, res) => {
    const {
        user_id,
        tong_tien,
        ghi_chu,
        ngay_dat,
        trang_thai,
        hinh_thuc,
        thoi_gian_giao,
        ngay_giao_hang,
        dia_chi_nhan,
        ten_nguoi_nhan,
        sdt_nguoi_nhan,
        list_product
    } = req.body;

    if (!user_id || !list_product || list_product.length === 0) {
        return res.status(400).json({ message: "Thiếu dữ liệu đơn hàng!" });
    }

    try {
        // 1️⃣ Lưu vào bảng DON_HANG
        const [orderResult] = await db.execute(
            `INSERT INTO don_hang 
            (user_id, tong_tien, ghi_chu, ngay_dat, trang_thai, hinh_thuc, thoi_gian_giao, ngay_giao_hang, dia_chi_nhan, ten_nguoi_nhan, sdt_nguoi_nhan)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                user_id,
                tong_tien,
                ghi_chu,
                ngay_dat,
                trang_thai,
                hinh_thuc,
                thoi_gian_giao,
                ngay_giao_hang,
                dia_chi_nhan,
                ten_nguoi_nhan,
                sdt_nguoi_nhan
            ]
        );

        const order_id = orderResult.insertId;

        // 2️⃣ Lưu vào bảng CHI_TIET_DON_HANG
        for (let item of list_product) {
            await db.execute(
                `INSERT INTO chi_tiet_don_hang (order_id, product_id, so_luong, don_gia, thanh_tien, note)
                 VALUES (?, ?, ?, ?, ?, ?)`,
                [
                    order_id,
                    item.id,
                    item.soluong,
                    item.price,
                    (item.price * item.soluong),
                    item.note
                ]
            );
        }

        res.status(200).json({
            message: "Tạo đơn hàng thành công!",
            order_id: order_id
        });

    } catch (err) {
        console.log("❌ Lỗi tạo đơn hàng:", err);
        res.status(500).json({ message: "Lỗi server!" });
    }
});

app.get("/api/orders", async (req, res) => {
    try {
        const [rows] = await db.execute("SELECT * FROM don_hang ORDER BY id DESC");
        res.json(rows);
    } catch (e) {
        res.status(500).json({ message: "Lỗi tải đơn hàng!" });
    }
});

app.get("/api/order-detail/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const [rows] = await db.execute(
            "SELECT * FROM chi_tiet_don_hang WHERE order_id = ?", [id]
        );
        res.json(rows);
    } catch (e) {
        res.status(500).json({ message: "Lỗi tải chi tiết đơn hàng!" });
    }
});

app.put("/api/orders/:id/status", async (req, res) => {
    try {
        const id = req.params.id;
        const { trang_thai } = req.body;

        await db.execute(
            "UPDATE don_hang SET trang_thai = ? WHERE id = ?",
            [trang_thai, id]
        );

        res.json({ message: "Cập nhật trạng thái thành công!" });
    } catch (err) {
        res.status(500).json({ message: "Lỗi server!", error: err.message });
    }
});

app.get("/api/order-detail", async (req, res) => {
    try {
        const [rows] = await db.execute("SELECT * FROM chi_tiet_don_hang");
        res.json(rows);
    } catch (err) {
        res.status(500).json({ message: "Lỗi tải chi tiết đơn hàng!" });
    }
});

app.get("/api/products", async (req, res) => {
    try {
        const [rows] = await db.query("SELECT * FROM san_pham ORDER BY id DESC");
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


app.get("/api/products/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const [rows] = await db.query("SELECT * FROM san_pham WHERE id = ?", [id]);
        res.json(rows[0] || null);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post("/api/products", async (req, res) => {
    try {
        const { title, img, category, price, desc, status } = req.body;

        const sql = `
                INSERT INTO san_pham (title, img, category, price, description, status)
                VALUES (?, ?, ?, ?, ?, ?)
            `;
        await db.query(sql, [title, img, category, price, desc, status]);

        res.json({ message: "Thêm sản phẩm thành công!" });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put("/api/products/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const { title, img, category, price, desc } = req.body;

        const sql = `
                UPDATE san_pham
                SET title=?, img=?, category=?, price=?, description=?
                WHERE id=?
            `;
        await db.query(sql, [title, img, category, price, desc, id]);

        res.json({ message: "Cập nhật sản phẩm thành công!" });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete("/api/products/:id", async (req, res) => {
    try {
        const id = req.params.id;

        await db.query("UPDATE san_pham SET status = 0 WHERE id = ?", [id]);

        res.json({ message: "Xóa sản phẩm thành công!" });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put("/api/products/:id/restore", async (req, res) => {
    try {
        const id = req.params.id;

        await db.query("UPDATE san_pham SET status = 1 WHERE id = ?", [id]);

        res.json({ message: "Khôi phục sản phẩm thành công!" });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get("/api/test-db", async (req, res) => {
    try {
        const [rows] = await db.query("SELECT 1 + 1 AS res");
        res.json({ message: "OK", result: rows[0].res });
    } catch (err) {
        res.status(500).json({ message: "FAIL", error: err.message });
    }
});

app.get("/api/accounts", async (req, res) => {
    try {
        const [rows] = await db.query("SELECT * FROM tai_khoan");
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post("/api/login", async (req, res) => {
    try {
        const { phone, password } = req.body;

        const sql = `SELECT * FROM tai_khoan WHERE phone = ? AND password = ? LIMIT 1`;
        const [rows] = await db.query(sql, [phone, password]);

        if (rows.length === 0) {
            return res.status(400).json({ message: "Sai tài khoản hoặc mật khẩu!" });
        }

        res.json({ message: "Đăng nhập thành công!", user: rows[0] });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post("/api/accounts", async (req, res) => {
    try {
        const { fullname, phone, password, email, address, status, role } = req.body;

        const sql = `
            INSERT INTO tai_khoan (fullname, phone, password, email, address, status, role, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
        `;

        const [result] = await db.query(sql, [
            fullname, phone, password, email, address, status, role
        ]);

        res.json({
            message: "Tạo tài khoản thành công!",
            id: result.insertId
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.use("/products", express.static(path.join(__dirname, "assets/img/products")));

app.use(express.static(__dirname));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(PORT, () => {
    console.log(`🔥 Server chạy tại http://localhost:${PORT}`);
});
