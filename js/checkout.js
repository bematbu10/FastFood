const PHIVANCHUYEN = 30000;
let priceFinal = document.getElementById("checkout-cart-price-final");
// Trang thanh toan
function thanhtoanpage(option, product) {
    // Xu ly ngay nhan hang
    let today = new Date();
    let ngaymai = new Date();
    let ngaykia = new Date();
    ngaymai.setDate(today.getDate() + 1);
    ngaykia.setDate(today.getDate() + 2);
    let dateorderhtml = `<a href="javascript:;" class="pick-date active" data-date="${today.toISOString().slice(0,10)}">
        <span class="text">Hôm nay</span>
        <span class="date">${today.getDate()}/${today.getMonth() + 1}</span>
        </a>
        <a href="javascript:;" class="pick-date" data-date="${ngaymai.toISOString().slice(0,10)}">
            <span class="text">Ngày mai</span>
            <span class="date">${ngaymai.getDate()}/${ngaymai.getMonth() + 1}</span>
        </a>

        <a href="javascript:;" class="pick-date" data-date="${ngaykia.toISOString().slice(0,10)}">
            <span class="text">Ngày kia</span>
            <span class="date">${ngaykia.getDate()}/${ngaykia.getMonth() + 1}</span>
    </a>`
    document.querySelector('.date-order').innerHTML = dateorderhtml;
    let pickdate = document.getElementsByClassName('pick-date')
    for (let i = 0; i < pickdate.length; i++) {
        pickdate[i].onclick = function () {
            document.querySelector(".pick-date.active").classList.remove("active");
            this.classList.add('active');
        }
    }

    let totalBillOrder = document.querySelector('.total-bill-order');
    let totalBillOrderHtml;
    // Xu ly don hang
    switch (option) {
        case 1: // Truong hop thanh toan san pham trong gio
            // Hien thi don hang
            showProductCart();
            // Tinh tien
            totalBillOrderHtml = `<div class="priceFlx">
            <div class="text">
                Tiền hàng 
                <span class="count">${getAmountCart()} món</span>
            </div>
            <div class="price-detail">
                <span id="checkout-cart-total">${vnd(getCartTotal())}</span>
            </div>
        </div>
        <div class="priceFlx chk-ship">
            <div class="text">Phí vận chuyển</div>
            <div class="price-detail chk-free-ship">
                <span>${vnd(PHIVANCHUYEN)}</span>
            </div>
        </div>`;
            // Tong tien
            priceFinal.innerText = vnd(getCartTotal() + PHIVANCHUYEN);
            break;
        case 2: // Truong hop mua ngay
            // Hien thi san pham
            showProductBuyNow(product);
            // Tinh tien
            totalBillOrderHtml = `<div class="priceFlx">
                <div class="text">
                    Tiền hàng 
                    <span class="count">${product.soluong} món</span>
                </div>
                <div class="price-detail">
                    <span id="checkout-cart-total">${vnd(product.soluong * product.price)}</span>
                </div>
            </div>
            <div class="priceFlx chk-ship">
                <div class="text">Phí vận chuyển</div>
                <div class="price-detail chk-free-ship">
                    <span>${vnd(PHIVANCHUYEN)}</span>
                </div>
            </div>`
            // Tong tien
            priceFinal.innerText = vnd((product.soluong * product.price) + PHIVANCHUYEN);
            break;
    }

    // Tinh tien
    totalBillOrder.innerHTML = totalBillOrderHtml;

    // Xu ly hinh thuc giao hang
    let giaotannoi = document.querySelector('#giaotannoi');
    let tudenlay = document.querySelector('#tudenlay');
    let tudenlayGroup = document.querySelector('#tudenlay-group');
    let chkShip = document.querySelectorAll(".chk-ship");

    tudenlay.addEventListener('click', () => {
        giaotannoi.classList.remove("active");
        tudenlay.classList.add("active");
        chkShip.forEach(item => {
            item.style.display = "none";
        });
        tudenlayGroup.style.display = "block";
        switch (option) {
            case 1:
                priceFinal.innerText = vnd(getCartTotal());
                break;
            case 2:
                priceFinal.innerText = vnd((product.soluong * product.price));
                break;
        }
    })

    giaotannoi.addEventListener('click', () => {
        tudenlay.classList.remove("active");
        giaotannoi.classList.add("active");
        tudenlayGroup.style.display = "none";
        chkShip.forEach(item => {
            item.style.display = "flex";
        });
        switch (option) {
            case 1:
                priceFinal.innerText = vnd(getCartTotal() + PHIVANCHUYEN);
                break;
            case 2:
                priceFinal.innerText = vnd((product.soluong * product.price) + PHIVANCHUYEN);
                break;
        }
    })

    // Su kien khu nhan nut dat hang
    document.querySelector(".complete-checkout-btn").onclick = () => {
        switch (option) {
            case 1:
                xulyDathang();
                break;
            case 2:
                xulyDathang(product);
                break;
        }
    }
}

// Hien thi hang trong gio
function showProductCart() {
    let currentuser = JSON.parse(localStorage.getItem('currentuser'));
    let listOrder = document.getElementById("list-order-checkout");
    let listOrderHtml = '';
    currentuser.cart.forEach(item => {
        let product = getProduct(item);
        listOrderHtml += `<div class="food-total">
        <div class="count">${product.soluong}x</div>
        <div class="info-food">
            <div class="name-food">${product.title}</div>
        </div>
    </div>`
    })
    listOrder.innerHTML = listOrderHtml;
}

// Hien thi hang mua ngay
function showProductBuyNow(product) {
    let listOrder = document.getElementById("list-order-checkout");
    let listOrderHtml = `<div class="food-total">
        <div class="count">${product.soluong}x</div>
        <div class="info-food">
            <div class="name-food">${product.title}</div>
        </div>
    </div>`;
    listOrder.innerHTML = listOrderHtml;
}

//Open Page Checkout
let nutthanhtoan = document.querySelector('.thanh-toan')
let checkoutpage = document.querySelector('.checkout-page');
nutthanhtoan.addEventListener('click', () => {
    checkoutpage.classList.add('active');

    thanhtoanpage(1);

    loadReceiverInfo();

    closeCart();
    body.style.overflow = "hidden"
})


// Đặt hàng ngay
function dathangngay() {
    let productInfo = document.getElementById("product-detail-content");
    let datHangNgayBtn = productInfo.querySelector(".button-dathangngay");
    datHangNgayBtn.onclick = () => {
        if (localStorage.getItem('currentuser')) {
            let productId = datHangNgayBtn.getAttribute("data-product");
            let soluong = parseInt(productInfo.querySelector(".buttons_added .input-qty").value);
            let notevalue = productInfo.querySelector("#popup-detail-note").value;
            let ghichu = notevalue == "" ? "Không có ghi chú" : notevalue;
            let products = JSON.parse(localStorage.getItem('products'));
            let a = products.find(item => item.id == productId);
            a.soluong = parseInt(soluong);
            a.note = ghichu;
            checkoutpage.classList.add('active');
            thanhtoanpage(2, a);
            loadReceiverInfo();  
            closeCart();
            body.style.overflow = "hidden"
        } else {
            toast({ title: 'Warning', message: 'Chưa đăng nhập tài khoản !', type: 'warning', duration: 3000 });
        }
    }
}

// Close Page Checkout
function closecheckout() {
    checkoutpage.classList.remove('active');
    body.style.overflow = "auto"
}

// Thong tin cac don hang da mua - Xu ly khi nhan nut dat hang
async function xulyDathang(product) {
    let currentUser = JSON.parse(localStorage.getItem("currentuser"));
    if (!currentUser) {
        toast({ title: "Warning", message: "Bạn chưa đăng nhập!", type: "warning" });
        return;
    }

    let diachinhan = "";
    let hinhthucgiao = "";
    let thoigiangiao = "";

    let giaotannoi = document.querySelector("#giaotannoi");
    let tudenlay = document.querySelector("#tudenlay");

    if (giaotannoi.classList.contains("active")) {
        diachinhan = document.querySelector("#diachinhan").value;
        hinhthucgiao = "Giao tận nơi";
    }

    if (tudenlay.classList.contains("active")) {
        let c1 = document.querySelector("#chinhanh-1");
        let c2 = document.querySelector("#chinhanh-2");
        if (c1.checked) diachinhan = "273 An Dương Vương, Phường 3, Quận 5";
        if (c2.checked) diachinhan = "04 Tôn Đức Thắng, Phường Bến Nghé, Quận 1";
        hinhthucgiao = "Tự đến lấy";
    }

    let ngayNhan = document.querySelector(".pick-date.active").getAttribute("data-date");
    let tennguoinhan = document.querySelector("#tennguoinhan").value;
    let sdtnhan = document.querySelector("#sdtnhan").value;

    if (tennguoinhan === "" || sdtnhan === "" || diachinhan === "") {
        toast({ title: "Warning", message: "Vui lòng nhập đầy đủ thông tin!", type: "warning" });
        return;
    }

    // Chuẩn bị list product
    let cartItems = [];

    if (!product) {
        // Đặt từ giỏ
        currentUser.cart.forEach(item => {
            let p = getProduct(item);
            cartItems.push({
                id: p.id,
                soluong: p.soluong,
                price: p.price,
                note: p.note
            });
        });
    } else {
        cartItems.push({
            id: product.id,
            soluong: product.soluong,
            price: getpriceProduct(product.id),
            note: product.note
        });
    }

    function formatToMySQLDatetime(date) {
        return new Date(date).toISOString().slice(0, 19).replace("T", " ");
    }


    // Tính tổng tiền
    let tongtien = cartItems.reduce((sum, item) => sum + item.soluong * item.price, 0);

    let orderPayload = {
        user_id: currentUser.id,
        tong_tien: tongtien,
        ghi_chu: document.querySelector(".note-order").value || "",
        ngay_dat: formatToMySQLDatetime(new Date()),
        ngay_giao_hang: formatToMySQLDatetime(ngayNhan),

        trang_thai: 0,
        hinh_thuc: hinhthucgiao,
        thoi_gian_giao: "",

        dia_chi_nhan: diachinhan,
        ten_nguoi_nhan: tennguoinhan,
        sdt_nguoi_nhan: sdtnhan,
        list_product: cartItems
    };

    console.log("📦 Sending order →", orderPayload);

    try {
        const res = await fetch("http://localhost:3000/api/create-order", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(orderPayload)
        });

        const data = await res.json();

        if (data.order_id) {
            toast({ title: "Success", message: "Đặt hàng thành công!", type: "success" });

            // Xóa giỏ
            currentUser.cart = [];
            localStorage.setItem("currentuser", JSON.stringify(currentUser));

            setTimeout(() => {
                window.location = "/";
            }, 1500);
        } else {
            toast({ title: "Error", message: "Lỗi tạo đơn hàng!", type: "error" });
        }
    } catch (err) {
        console.error("❌ Lỗi tạo đơn:", err);
        toast({ title: "Error", message: "Không thể kết nối server!", type: "error" });
    }
}

function loadReceiverInfo() {
    let user = JSON.parse(localStorage.getItem("currentuser"));
    if (!user) return;

    document.getElementById("tennguoinhan").value = user.fullname || "";
    document.getElementById("sdtnhan").value = user.phone || "";
    document.getElementById("diachinhan").value = user.address || "";
}


function getpriceProduct(id) {
    let products = JSON.parse(localStorage.getItem('products'));
    let sp = products.find(item => {
        return item.id == id;
    })
    return sp.price;
}