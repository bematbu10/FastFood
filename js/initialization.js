// ===============================
// 🌐 LẤY SẢN PHẨM TỪ MYSQL
// ===============================
async function loadProductsFromDB() {
    try {
        const res = await fetch("http://localhost:3000/api/products");
        const products = await res.json();

        // Convert ảnh → thêm domain localhost
        const fixedProducts = products.map(p => ({
            ...p,
            img: `http://localhost:3000${p.img}`
        }));

        localStorage.setItem("products", JSON.stringify(fixedProducts));
        console.log("✅ Products loaded:", fixedProducts);
    } catch (error) {
        console.error("❌ Lỗi tải sản phẩm:", error);
    }
}

// ===============================
// 🌐 LẤY TÀI KHOẢN TỪ MYSQL
// ===============================
async function loadAccountsFromDB() {
    try {
        const res = await fetch("http://localhost:3000/api/accounts");
        let accounts = await res.json();

        // Bổ sung các trường FE cần
        accounts = accounts.map(acc => ({
            ...acc,
            cart: acc.cart ? acc.cart : [],   // Fix lỗi undefined
            role: acc.role ?? 0,
            status: acc.status ?? 1
        }));

        localStorage.setItem("accounts", JSON.stringify(accounts));
        console.log("✅ Accounts loaded:", accounts);
    } catch (err) {
        console.error("❌ Lỗi tải tài khoản:", err);
    }
}


// ===============================
// 👑 TẠO ADMIN NẾU CHƯA CÓ
// ===============================
function createAdminAccount() {
    let accounts = JSON.parse(localStorage.getItem("accounts")) || [];

    const adminExist = accounts.some(a => a.role === 1);
    if (!adminExist) {
        accounts.push({
            fullname: "Admin",
            phone: "0000000000",
            password: "admin123",
            address: "",
            email: "",
            status: 1,
            join: new Date(),
            cart: [],
            role: 1
        });

        localStorage.setItem("accounts", JSON.stringify(accounts));
        console.log("🔧 Admin created!");
    }
}

// ===============================
// 🚀 KHỞI TẠO ỨNG DỤNG
// ===============================
window.onload = async () => {
    console.log("=== 🚀 START INITIALIZATION ===");

    await loadProductsFromDB();
    await loadAccountsFromDB();
    showUser();
    createAdminAccount();

    console.log("=== ✅ DATA READY – BẮT ĐẦU main.js ===");
};
