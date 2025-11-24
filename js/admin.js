async function loadProductsFromDB() {
    try {
        const res = await fetch("http://localhost:3000/api/products");
        if (!res.ok) throw new Error("Không thể tải dữ liệu từ DB");

        let data = await res.json();

        data = data.map(p => ({
            id: p.id,
            title: p.title,
            img: p.img,
            category: p.category,
            price: p.price,
            desc: p.description,
            status: p.status
        }));


        localStorage.setItem("products", JSON.stringify(data));
        showProduct();
        console.log("🔥 Đã load sản phẩm từ MySQL vào localStorage");

    } catch (err) {
        console.error("❌ Lỗi load sản phẩm:", err);
    }
}

async function loadOrdersFromDB() {
    const res = await fetch("http://localhost:3000/api/orders");
    let data = await res.json();
    localStorage.setItem("order", JSON.stringify(data));
}

async function loadOrderDetailsFromDB() {
    const res = await fetch("http://localhost:3000/api/order-detail");
    let data = await res.json();
    localStorage.setItem("orderDetails", JSON.stringify(data));
}



function checkLogin() {
    let currentUser = JSON.parse(localStorage.getItem("currentuser"));
    if (currentUser == null || currentUser.role == 0) {
        document.querySelector("body").innerHTML = `<div class="access-denied-section">
            <img class="access-denied-img" src="./assets/img/access-denied.webp" alt="">
        </div>`
    } else {
        document.getElementById("name-acc").innerHTML = currentUser.fullname;
    }
}


//do sidebar open and close
const menuIconButton = document.querySelector(".menu-icon-btn");
const sidebar = document.querySelector(".sidebar");
menuIconButton.addEventListener("click", () => {
    sidebar.classList.toggle("open");
});

// log out admin user

// let toogleMenu = document.querySelector(".profile");
// let mune = document.querySelector(".profile-cropdown");
// toogleMenu.onclick = function () {
// mune.classList.toggle("active");
// };


// tab for section
const sidebars = document.querySelectorAll(".sidebar-list-item.tab-content");
const sections = document.querySelectorAll(".section");

for (let i = 0; i < sidebars.length; i++) {
    sidebars[i].onclick = function () {
        document.querySelector(".sidebar-list-item.active").classList.remove("active");
        document.querySelector(".section.active").classList.remove("active");
        sidebars[i].classList.add("active");
        sections[i].classList.add("active");
    };
}

const closeBtn = document.querySelectorAll('.section');
console.log(closeBtn[0])
for (let i = 0; i < closeBtn.length; i++) {
    closeBtn[i].addEventListener('click', (e) => {
        sidebar.classList.add("open");
    })
}

// Get amount product
function getAmoumtProduct() {
    let products = localStorage.getItem("products") ? JSON.parse(localStorage.getItem("products")) : [];
    return products.length;
}

// Get amount user
function getAmoumtUser() {
    let accounts = localStorage.getItem("accounts") ? JSON.parse(localStorage.getItem("accounts")) : [];
    return accounts.filter(item => item.role == 0).length;
}

// Get amount user
function getMoney() {
    let tongtien = 0;
    let orders = localStorage.getItem("order") ? JSON.parse(localStorage.getItem("order")) : [];
    orders.forEach(item => {
        tongtien += Number(item.tong_tien) || 0;

    });
    return tongtien;
}

document.getElementById("amount-user").innerHTML = getAmoumtUser();
document.getElementById("amount-product").innerHTML = getAmoumtProduct();
document.getElementById("doanh-thu").innerHTML = vnd(getMoney());

// Doi sang dinh dang tien VND
function vnd(price) {
    return price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
}
// Phân trang 
let perPage = 12;
let currentPage = 1;
let totalPage = 0;
let perProducts = [];

function displayList(productAll, perPage, currentPage) {
    let start = (currentPage - 1) * perPage;
    let end = (currentPage - 1) * perPage + perPage;
    let productShow = productAll.slice(start, end);
    showProductArr(productShow);
}

function setupPagination(productAll, perPage) {
    document.querySelector('.page-nav-list').innerHTML = '';
    let page_count = Math.ceil(productAll.length / perPage);
    for (let i = 1; i <= page_count; i++) {
        let li = paginationChange(i, productAll, currentPage);
        document.querySelector('.page-nav-list').appendChild(li);
    }
}

function paginationChange(page, productAll, currentPage) {
    let node = document.createElement(`li`);
    node.classList.add('page-nav-item');
    node.innerHTML = `<a href="#">${page}</a>`;
    if (currentPage == page) node.classList.add('active');
    node.addEventListener('click', function () {
        currentPage = page;
        displayList(productAll, perPage, currentPage);
        let t = document.querySelectorAll('.page-nav-item.active');
        for (let i = 0; i < t.length; i++) {
            t[i].classList.remove('active');
        }
        node.classList.add('active');
    })
    return node;
}

// Hiển thị danh sách sản phẩm 
function showProductArr(arr) {
    let productHtml = "";
    if (arr.length == 0) {
        productHtml = `<div class="no-result"><div class="no-result-i"><i class="fa-light fa-face-sad-cry"></i></div><div class="no-result-h">Không có sản phẩm để hiển thị</div></div>`;
    } else {
        arr.forEach(product => {
            let btnCtl = product.status == 1 ?
                `<button class="btn-delete" onclick="deleteProduct(${product.id})"><i class="fa-regular fa-trash"></i></button>` :
                `<button class="btn-delete" onclick="changeStatusProduct(${product.id})"><i class="fa-regular fa-eye"></i></button>`;
            productHtml += `
            <div class="list">
                    <div class="list-left">
                    <img src="${product.img}" alt="">
                    <div class="list-info">
                        <h4>${product.title}</h4>
                        <p class="list-note">${product.desc}</p>
                        <span class="list-category">${product.category}</span>
                    </div>
                </div>
                <div class="list-right">
                    <div class="list-price">
                    <span class="list-current-price">${vnd(product.price)}</span>                   
                    </div>
                    <div class="list-control">
                    <div class="list-tool">
                        <button class="btn-edit" onclick="editProduct(${product.id})"><i class="fa-light fa-pen-to-square"></i></button>
                        ${btnCtl}
                    </div>                       
                </div>
                </div> 
            </div>`;
        });
    }
    document.getElementById("show-product").innerHTML = productHtml;
}

function showProduct() {
    let selectOp = document.getElementById('the-loai').value;
    let valeSearchInput = document.getElementById('form-search-product').value;
    let products = localStorage.getItem("products") ? JSON.parse(localStorage.getItem("products")) : [];

    if (selectOp == "Tất cả") {
        result = products.filter((item) => item.status == 1);
    } else if (selectOp == "Đã xóa") {
        result = products.filter((item) => item.status == 0);
    } else {
        result = products.filter((item) => item.category == selectOp);
    }

    result = valeSearchInput == "" ? result : result.filter(item => {
        return item.title.toString().toUpperCase().includes(valeSearchInput.toString().toUpperCase());
    })

    displayList(result, perPage, currentPage);
    setupPagination(result, perPage, currentPage);
}

function cancelSearchProduct() {
    let products = localStorage.getItem("products") ? JSON.parse(localStorage.getItem("products")).filter(item => item.status == 1) : [];
    document.getElementById('the-loai').value = "Tất cả";
    document.getElementById('form-search-product').value = "";
    displayList(products, perPage, currentPage);
    setupPagination(products, perPage, currentPage);
}



function createId(arr) {
    let id = arr.length;
    let check = arr.find((item) => item.id == id);
    while (check != null) {
        id++;
        check = arr.find((item) => item.id == id);
    }
    return id;
}
// Xóa sản phẩm 
async function deleteProduct(id) {
    console.log("ID nhận được =", id);
    if (!confirm("Bạn chắc chắn muốn xóa?")) return;

    await fetch(`http://localhost:3000/api/products/${id}`, {
        method: "DELETE"
    })

        ;
    console.log("Đã xóa sản phẩm với id =", id);
    loadProductsFromDB(); // refresh
}


async function changeStatusProduct(id) {
    await fetch(`http://localhost:3000/api/products/${id}/restore`, {
        method: "PUT"
    });

    loadProductsFromDB();
}


var indexCur;
function editProduct(id) {
    let products = localStorage.getItem("products") ? JSON.parse(localStorage.getItem("products")) : [];
    let index = products.findIndex(item => {
        return item.id == id;
    })
    indexCur = index;
    document.querySelectorAll(".add-product-e").forEach(item => {
        item.style.display = "none";
    })
    document.querySelectorAll(".edit-product-e").forEach(item => {
        item.style.display = "block";
    })
    document.querySelector(".add-product").classList.add("open");
    //
    document.querySelector(".upload-image-preview").src = products[index].img;
    document.getElementById("ten-mon").value = products[index].title;
    document.getElementById("gia-moi").value = products[index].price;
    document.getElementById("mo-ta").value = products[index].desc;
    document.getElementById("chon-mon").value = products[index].category;
}

function getPathImage(path) {
    let patharr = path.split("/");
    return "./assets/img/products/" + patharr[patharr.length - 1];
}

let btnUpdateProductIn = document.getElementById("update-product-button");
btnUpdateProductIn.addEventListener("click", async (e) => {
    e.preventDefault();

    let products = JSON.parse(localStorage.getItem("products"));
    let id = products[indexCur].id;

    let updated = {
        title: document.getElementById("ten-mon").value,
        img: getPathImage(document.querySelector(".upload-image-preview").src),
        category: document.getElementById("chon-mon").value,
        price: parseInt(document.getElementById("gia-moi").value),
        desc: document.getElementById("mo-ta").value
    };

    const res = await fetch(`http://localhost:3000/api/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated)
    });

    const data = await res.json();
    console.log(data);

    document.querySelector(".add-product").classList.remove("open");
    setDefaultValue();
    await loadProductsFromDB(); // reload DB
    toast({ title: "Success", message: "Cập nhật thành công!", type: "success", duration: 3000 });
});


let btnAddProductIn = document.getElementById("add-product-button");
btnAddProductIn.addEventListener("click", async (e) => {
    e.preventDefault();

    let newProduct = {
        title: document.getElementById("ten-mon").value,
        img: getPathImage(document.querySelector(".upload-image-preview").src),
        category: document.getElementById("chon-mon").value,
        price: parseInt(document.getElementById("gia-moi").value),
        desc: document.getElementById("mo-ta").value,
        status: 1
    };

    if (!newProduct.title || !newProduct.price || !newProduct.desc) {
        toast({ title: "Lỗi", message: "Vui lòng nhập đầy đủ!", type: "warning", duration: 3000 });
        return;
    }

    if (isNaN(newProduct.price)) {
        toast({ title: "Lỗi", message: "Giá phải là số!", type: "warning", duration: 3000 });
        return;
    }

    const res = await fetch("http://localhost:3000/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newProduct)
    });

    const data = await res.json();
    console.log(data);

    document.querySelector(".add-product").classList.remove("open");
    setDefaultValue();
    await loadProductsFromDB();
    toast({ title: "Thành công", message: "Đã thêm sản phẩm!", type: "success", duration: 3000 });
});

document.querySelector(".modal-close.product-form").addEventListener("click", () => {
    setDefaultValue();
})

function setDefaultValue() {
    document.querySelector(".upload-image-preview").src = "./assets/img/blank-image.png";
    document.getElementById("ten-mon").value = "";
    document.getElementById("gia-moi").value = "";
    document.getElementById("mo-ta").value = "";
    document.getElementById("chon-mon").value = "Món chay";
}

// Open Popup Modal
let btnAddProduct = document.getElementById("btn-add-product");
btnAddProduct.addEventListener("click", () => {
    document.querySelectorAll(".add-product-e").forEach(item => {
        item.style.display = "block";
    })
    document.querySelectorAll(".edit-product-e").forEach(item => {
        item.style.display = "none";
    })
    document.querySelector(".add-product").classList.add("open");
});

// Close Popup Modal
let closePopup = document.querySelectorAll(".modal-close");
let modalPopup = document.querySelectorAll(".modal");

for (let i = 0; i < closePopup.length; i++) {
    closePopup[i].onclick = () => {
        modalPopup[i].classList.remove("open");
    };
}

// On change Image
function uploadImage(el) {
    let path = "./assets/img/products/" + el.value.split("\\")[2];
    document.querySelector(".upload-image-preview").setAttribute("src", path);
}

// Đổi trạng thái đơn hàng
async function changeStatus(id, el) {

    // Gọi API update vào MySQL
    await fetch(`http://localhost:3000/api/orders/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trang_thai: 1 })
    });

    // Cập nhật lại localStorage
    let orders = JSON.parse(localStorage.getItem("order")) || [];
    let order = orders.find(o => o.id == id);

    if (order) order.trang_thai = 1;

    localStorage.setItem("order", JSON.stringify(orders));

    // đổi giao diện nút
    el.classList.remove("btn-chuaxuly");
    el.classList.add("btn-daxuly");
    el.innerHTML = "Đã xử lý";

    // Reload bảng đơn hàng nếu cần
    showOrder(orders);
}


// Format Date
function formatDate(date) {
    let fm = new Date(date);
    let yyyy = fm.getFullYear();
    let mm = fm.getMonth() + 1;
    let dd = fm.getDate();
    if (dd < 10) dd = "0" + dd;
    if (mm < 10) mm = "0" + mm;
    return dd + "/" + mm + "/" + yyyy;
}

// Show order
function showOrder(arr) {
    let orderHtml = "";
    if (arr.length == 0) {
        orderHtml = `<td colspan="6">Không có dữ liệu</td>`
    } else {
        arr.forEach((item) => {
            let status = item.trang_thai == 0 ? `<span class="status-no-complete">Chưa xử lý</span>` : `<span class="status-complete">Đã xử lý</span>`;

            orderHtml += `
            <tr>
            <td>${item.id}</td>
            <td>${item.user_id}</td>    
            <td>${formatDate(item.ngay_dat)}</td>
            <td>${vnd(item.tong_tien)}</td>
            <td>${status}</td>
            <td class="control">
            <button class="btn-detail" id="" onclick="detailOrder('${item.id}')"><i class="fa-regular fa-eye"></i> Chi tiết</button>
            </td>
            </tr>      
            `;
        });
    }
    document.getElementById("showOrder").innerHTML = orderHtml;
}

let orders = localStorage.getItem("order") ? JSON.parse(localStorage.getItem("order")) : [];


// Get Order Details
function getOrderDetails(orderId) {
    let orderDetails = JSON.parse(localStorage.getItem("orderDetails")) || [];
    return orderDetails.filter(item => item.order_id == orderId);
}


// Show Order Detail
function detailOrder(id) {

    document.querySelector(".modal.detail-order").classList.add("open");

    let orders = JSON.parse(localStorage.getItem("order")) || [];
    let products = JSON.parse(localStorage.getItem("products")) || [];

    // ⭐ Lấy đúng đơn hàng từ DB
    let order = orders.find(o => o.id == id);

    // ⭐ Lấy chi tiết đơn hàng
    let ctDon = getOrderDetails(id);

    let spHtml = `<div class="modal-detail-left"><div class="order-item-group">`;

    ctDon.forEach(item => {
        let detaiSP = products.find(p => p.id == item.product_id);

        spHtml += `
        <div class="order-product">
            <div class="order-product-left">
                <img src="${detaiSP.img}" alt="">
                <div class="order-product-info">
                    <h4>${detaiSP.title}</h4>
                    <p class="order-product-note"><i class="fa-light fa-pen"></i> ${item.note}</p>
                    <p class="order-product-quantity">SL: ${item.so_luong}</p>
                </div>
            </div>
            <div class="order-product-right">
                <div class="order-product-price">
                    <span class="order-product-current-price">${vnd(item.don_gia)}</span>
                </div>
            </div>
        </div>`;
    });

    spHtml += `</div></div>`;

    // ⭐ Sửa toàn bộ key sai → dùng đúng key DB
    spHtml += `
    <div class="modal-detail-right">
        <ul class="detail-order-group">

            <li class="detail-order-item">
                <span class="detail-order-item-left"><i class="fa-light fa-calendar-days"></i> Ngày đặt hàng</span>
                <span class="detail-order-item-right">${formatDate(order.ngay_dat)}</span>
            </li>

            <li class="detail-order-item">
                <span class="detail-order-item-left"><i class="fa-light fa-truck"></i> Hình thức giao</span>
                <span class="detail-order-item-right">${order.hinh_thuc}</span>
            </li>

            <li class="detail-order-item">
                <span class="detail-order-item-left"><i class="fa-thin fa-person"></i> Người nhận</span>
                <span class="detail-order-item-right">${order.ten_nguoi_nhan}</span>
            </li>

            <li class="detail-order-item">
                <span class="detail-order-item-left"><i class="fa-light fa-phone"></i> Số điện thoại</span>
                <span class="detail-order-item-right">${order.sdt_nguoi_nhan}</span>
            </li>

            <li class="detail-order-item tb">
                <span class="detail-order-item-left"><i class="fa-light fa-clock"></i> Thời gian giao</span>
                <p class="detail-order-item-b">
                    ${(order.thoi_gian_giao || "")} - ${formatDate(order.ngay_giao_hang)}
                </p>
            </li>

            <li class="detail-order-item tb">
                <span class="detail-order-item-t"><i class="fa-light fa-location-dot"></i> Địa chỉ nhận</span>
                <p class="detail-order-item-b">${order.dia_chi_nhan}</p>
            </li>

            <li class="detail-order-item tb">
                <span class="detail-order-item-t"><i class="fa-light fa-note-sticky"></i> Ghi chú</span>
                <p class="detail-order-item-b">${order.ghi_chu}</p>
            </li>

        </ul>
    </div>`;

    document.querySelector(".modal-detail-order").innerHTML = spHtml;

    // ⭐ Sửa key: tong_tien + trang_thai
    let classDetailBtn = order.trang_thai == 0 ? "btn-chuaxuly" : "btn-daxuly";
    let textDetailBtn = order.trang_thai == 0 ? "Chưa xử lý" : "Đã xử lý";

    document.querySelector(".modal-detail-bottom").innerHTML = `
    <div class="modal-detail-bottom-left">
        <div class="price-total">
            <span class="thanhtien">Thành tiền</span>
            <span class="price">${vnd(order.tong_tien)}</span>
        </div>
    </div>
    <div class="modal-detail-bottom-right">
        <button class="modal-detail-btn ${classDetailBtn}" onclick="changeStatus('${order.id}', this)">${textDetailBtn}</button>
    </div>`;
}


// Find Order
function findOrder() {
    let tinhTrang = parseInt(document.getElementById("tinh-trang").value);
    let ct = document.getElementById("form-search-order").value;
    let timeStart = document.getElementById("time-start").value;
    let timeEnd = document.getElementById("time-end").value;

    if (timeEnd < timeStart && timeEnd != "" && timeStart != "") {
        alert("Lựa chọn thời gian sai !");
        return;
    }
    let orders = localStorage.getItem("order") ? JSON.parse(localStorage.getItem("order")) : [];
    let result = tinhTrang == 2 ? orders : orders.filter((item) => {
        return item.trang_thai == tinhTrang;
    });
    result = ct == "" ? result : result.filter((item) => {
        return (
            item.ten_nguoi_nhan?.toLowerCase().includes(ct.toLowerCase()) ||
            item.id.toString().toLowerCase().includes(ct.toLowerCase())
        );

    });

    if (timeStart != "" && timeEnd == "") {
        result = result.filter((item) => {
            return new Date(item.ngay_dat) >= new Date(timeStart).setHours(0, 0, 0);
        });
    } else if (timeStart == "" && timeEnd != "") {
        result = result.filter((item) => {
            return new Date(item.ngay_dat) <= new Date(timeEnd).setHours(23, 59, 59);
        });
    } else if (timeStart != "" && timeEnd != "") {
        result = result.filter((item) => {
            return (new Date(item.ngay_dat) >= new Date(timeStart).setHours(0, 0, 0) && new Date(item.ngay_dat) <= new Date(timeEnd).setHours(23, 59, 59)
            );
        });
    }
    showOrder(result);
}

function cancelSearchOrder() {
    let orders = localStorage.getItem("order") ? JSON.parse(localStorage.getItem("order")) : [];
    document.getElementById("tinh-trang").value = 2;
    document.getElementById("form-search-order").value = "";
    document.getElementById("time-start").value = "";
    document.getElementById("time-end").value = "";
    showOrder(orders);
}

// Create Object Thong ke
function createObj() {
    let orders = JSON.parse(localStorage.getItem("order")) || [];
    let products = JSON.parse(localStorage.getItem("products")) || [];
    let orderDetails = JSON.parse(localStorage.getItem("orderDetails")) || [];

    let result = [];

    orderDetails.forEach(item => {
        // tìm sản phẩm theo product_id (ko phải id)
        let prod = products.find(p => p.id == item.product_id);

        if (!prod) return; // tránh lỗi undefined

        let obj = {};

        obj.id = item.product_id;
        obj.madon = item.order_id;
        obj.price = item.don_gia;
        obj.quantity = item.so_luong;
        obj.category = prod.category;
        obj.title = prod.title;
        obj.img = prod.img;

        let order = orders.find(o => o.id == item.order_id);
        obj.time = order ? order.ngay_dat : null;

        result.push(obj);
    });

    return result;
}


// Filter 
function thongKe(mode) {
    let categoryTk = document.getElementById("the-loai-tk").value;
    let ct = document.getElementById("form-search-tk").value;
    let timeStart = document.getElementById("time-start-tk").value;
    let timeEnd = document.getElementById("time-end-tk").value;
    if (timeEnd < timeStart && timeEnd != "" && timeStart != "") {
        alert("Lựa chọn thời gian sai !");
        return;
    }
    let arrDetail = createObj();
    let result = categoryTk == "Tất cả" ? arrDetail : arrDetail.filter((item) => {
        return item.category == categoryTk;
    });

    result = ct == "" ? result : result.filter((item) => {
        return (item.title.toLowerCase().includes(ct.toLowerCase()));
    });

    if (timeStart != "" && timeEnd == "") {
        result = result.filter((item) => {
            return new Date(item.time) > new Date(timeStart).setHours(0, 0, 0);
        });
    } else if (timeStart == "" && timeEnd != "") {
        result = result.filter((item) => {
            return new Date(item.time) < new Date(timeEnd).setHours(23, 59, 59);
        });
    } else if (timeStart != "" && timeEnd != "") {
        result = result.filter((item) => {
            return (new Date(item.time) > new Date(timeStart).setHours(0, 0, 0) && new Date(item.time) < new Date(timeEnd).setHours(23, 59, 59)
            );
        });
    }
    showThongKe(result, mode);
}

// Show số lượng sp, số lượng đơn bán, doanh thu
function showOverview(arr) {
    document.getElementById("quantity-product").innerText = arr.length;
    document.getElementById("quantity-order").innerText = arr.reduce((sum, cur) => (sum + parseInt(cur.quantity)), 0);
    document.getElementById("quantity-sale").innerText = vnd(arr.reduce((sum, cur) => (sum + parseInt(cur.doanhthu)), 0));
}

function showThongKe(arr, mode) {
    let orderHtml = "";
    let mergeObj = mergeObjThongKe(arr);
    showOverview(mergeObj);

    switch (mode) {
        case 0:
            mergeObj = mergeObjThongKe(createObj());
            showOverview(mergeObj);
            document.getElementById("the-loai-tk").value = "Tất cả";
            document.getElementById("form-search-tk").value = "";
            document.getElementById("time-start-tk").value = "";
            document.getElementById("time-end-tk").value = "";
            break;
        case 1:
            mergeObj.sort((a, b) => parseInt(a.quantity) - parseInt(b.quantity))
            break;
        case 2:
            mergeObj.sort((a, b) => parseInt(b.quantity) - parseInt(a.quantity))
            break;
    }
    for (let i = 0; i < mergeObj.length; i++) {
        orderHtml += `
        <tr>
        <td>${i + 1}</td>
        <td><div class="prod-img-title"><img class="prd-img-tbl" src="${mergeObj[i].img}" alt=""><p>${mergeObj[i].title}</p></div></td>
        <td>${mergeObj[i].quantity}</td>
        <td>${vnd(mergeObj[i].doanhthu)}</td>
        <td><button class="btn-detail product-order-detail" data-id="${mergeObj[i].id}"><i class="fa-regular fa-eye"></i> Chi tiết</button></td>
        </tr>      
        `;
    }
    document.getElementById("showTk").innerHTML = orderHtml;
    document.querySelectorAll(".product-order-detail").forEach(item => {
        let idProduct = item.getAttribute("data-id");
        item.addEventListener("click", () => {
            detailOrderProduct(arr, idProduct);
        })
    })
}

showThongKe(createObj())

function mergeObjThongKe(arr) {
    let result = [];
    arr.forEach(item => {
        let check = result.find(i => i.id == item.id) // Không tìm thấy gì trả về undefined

        if (check) {
            check.quantity = parseInt(check.quantity) + parseInt(item.quantity);
            check.doanhthu += parseInt(item.price) * parseInt(item.quantity);
        } else {
            const newItem = { ...item }
            newItem.doanhthu = newItem.price * newItem.quantity;
            result.push(newItem);
        }

    });
    return result;
}

function detailOrderProduct(arr, id) {
    let orderHtml = "";
    arr.forEach(item => {
        if (item.id == id) {
            orderHtml += `<tr>
            <td>${item.madon}</td>
            <td>${item.quantity}</td>
            <td>${vnd(item.price)}</td>
            <td>${formatDate(item.time)}</td>
            </tr>      
            `;
        }
    });
    document.getElementById("show-product-order-detail").innerHTML = orderHtml
    document.querySelector(".modal.detail-order-product").classList.add("open")
}

// User
let addAccount = document.getElementById('signup-button');
let updateAccount = document.getElementById("btn-update-account")

document.querySelector(".modal.signup .modal-close").addEventListener("click", () => {
    signUpFormReset();
})

function openCreateAccount() {
    document.querySelector(".signup").classList.add("open");
    document.querySelectorAll(".edit-account-e").forEach(item => {
        item.style.display = "none"
    })
    document.querySelectorAll(".add-account-e").forEach(item => {
        item.style.display = "block"
    })
}

function signUpFormReset() {
    document.getElementById('fullname').value = ""
    document.getElementById('phone').value = ""
    document.getElementById('password').value = ""
    document.querySelector('.form-message-name').innerHTML = '';
    document.querySelector('.form-message-phone').innerHTML = '';
    document.querySelector('.form-message-password').innerHTML = '';
}

function showUserArr(arr) {
    let accountHtml = '';
    if (arr.length == 0) {
        accountHtml = `<td colspan="5">Không có dữ liệu</td>`
    } else {
        arr.forEach((account, index) => {
            let tinhtrang = account.status == 0 ? `<span class="status-no-complete">Bị khóa</span>` : `<span class="status-complete">Hoạt động</span>`;
            accountHtml += ` <tr>
            <td>${index + 1}</td>
            <td>${account.fullname}</td>
            <td>${account.phone}</td>
            <td>${formatDate(account.created_at)}</td>
            <td>${tinhtrang}</td>
            <td class="control control-table">
            <button class="btn-edit" id="edit-account" onclick='editAccount(${account.phone})' ><i class="fa-light fa-pen-to-square"></i></button>
            <button class="btn-delete" id="delete-account" onclick="deleteAcount(${index})"><i class="fa-regular fa-trash"></i></button>
            </td>
        </tr>`
        })
    }
    document.getElementById('show-user').innerHTML = accountHtml;
}

function showUser() {
    let tinhTrang = parseInt(document.getElementById("tinh-trang-user").value);
    let ct = document.getElementById("form-search-user").value;
    let timeStart = document.getElementById("time-start-user").value;
    let timeEnd = document.getElementById("time-end-user").value;

    if (timeEnd < timeStart && timeEnd != "" && timeStart != "") {
        alert("Lựa chọn thời gian sai !");
        return;
    }

    let accounts = localStorage.getItem("accounts") ? JSON.parse(localStorage.getItem("accounts")).filter(item => item.role == 0) : [];
    let result = tinhTrang == 2 ? accounts : accounts.filter(item => item.status == tinhTrang);

    result = ct == "" ? result : result.filter((item) => {
        return (item.fullname.toLowerCase().includes(ct.toLowerCase()) || item.phone.toString().toLowerCase().includes(ct.toLowerCase()));
    });

    if (timeStart != "" && timeEnd == "") {
        result = result.filter((item) => {
            return new Date(item.join) >= new Date(timeStart).setHours(0, 0, 0);
        });
    } else if (timeStart == "" && timeEnd != "") {
        result = result.filter((item) => {
            return new Date(item.join) <= new Date(timeEnd).setHours(23, 59, 59);
        });
    } else if (timeStart != "" && timeEnd != "") {
        result = result.filter((item) => {
            return (new Date(item.join) >= new Date(timeStart).setHours(0, 0, 0) && new Date(item.join) <= new Date(timeEnd).setHours(23, 59, 59)
            );
        });
    }
    showUserArr(result);
}

function cancelSearchUser() {
    let accounts = localStorage.getItem("accounts") ? JSON.parse(localStorage.getItem("accounts")).filter(item => item.role == 0) : [];
    showUserArr(accounts);
    document.getElementById("tinh-trang-user").value = 2;
    document.getElementById("form-search-user").value = "";
    document.getElementById("time-start-user").value = "";
    document.getElementById("time-end-user").value = "";
}

window.addEventListener("load", async () => {
    await loadProductsFromDB();
    await loadOrdersFromDB();
    showOrder(JSON.parse(localStorage.getItem("order")));
    await loadOrderDetailsFromDB();

    checkLogin();
    showProduct();

    let orders = JSON.parse(localStorage.getItem("order")) || [];
    showOrder(orders);

    showUser();

    // CHẠY THỐNG KÊ
    showThongKe(createObj());
});




function deleteAcount(phone) {
    let accounts = JSON.parse(localStorage.getItem('accounts'));
    let index = accounts.findIndex(item => item.phone == phone);
    if (confirm("Bạn có chắc muốn xóa?")) {
        accounts.splice(index, 1)
    }
    localStorage.setItem("accounts", JSON.stringify(accounts));
    showUser();
}

let indexFlag;
function editAccount(phone) {
    document.querySelector(".signup").classList.add("open");
    document.querySelectorAll(".add-account-e").forEach(item => {
        item.style.display = "none"
    })
    document.querySelectorAll(".edit-account-e").forEach(item => {
        item.style.display = "block"
    })
    let accounts = JSON.parse(localStorage.getItem("accounts"));
    let index = accounts.findIndex(item => {
        return item.phone == phone
    })
    indexFlag = index;
    document.getElementById("fullname").value = accounts[index].fullname;
    document.getElementById("phone").value = accounts[index].phone;
    document.getElementById("password").value = accounts[index].password;
    document.getElementById("user-status").checked = accounts[index].status == 1 ? true : false;
}

updateAccount.addEventListener("click", (e) => {
    e.preventDefault();
    let accounts = JSON.parse(localStorage.getItem("accounts"));
    let fullname = document.getElementById("fullname").value;
    let phone = document.getElementById("phone").value;
    let password = document.getElementById("password").value;
    if (fullname == "" || phone == "" || password == "") {
        toast({ title: 'Chú ý', message: 'Vui lòng nhập đầy đủ thông tin !', type: 'warning', duration: 3000 });
    } else {
        accounts[indexFlag].fullname = document.getElementById("fullname").value;
        accounts[indexFlag].phone = document.getElementById("phone").value;
        accounts[indexFlag].password = document.getElementById("password").value;
        accounts[indexFlag].status = document.getElementById("user-status").checked ? true : false;
        localStorage.setItem("accounts", JSON.stringify(accounts));
        toast({ title: 'Thành công', message: 'Thay đổi thông tin thành công !', type: 'success', duration: 3000 });
        document.querySelector(".signup").classList.remove("open");
        signUpFormReset();
        showUser();
    }
})

addAccount.addEventListener("click", (e) => {
    e.preventDefault();
    let fullNameUser = document.getElementById('fullname').value;
    let phoneUser = document.getElementById('phone').value;
    let passwordUser = document.getElementById('password').value;
    // Check validate
    let fullNameIP = document.getElementById('fullname');
    let formMessageName = document.querySelector('.form-message-name');
    let formMessagePhone = document.querySelector('.form-message-phone');
    let formMessagePassword = document.querySelector('.form-message-password');

    if (fullNameUser.length == 0) {
        formMessageName.innerHTML = 'Vui lòng nhập họ vâ tên';
        fullNameIP.focus();
    } else if (fullNameUser.length < 3) {
        fullNameIP.value = '';
        formMessageName.innerHTML = 'Vui lòng nhập họ và tên lớn hơn 3 kí tự';
    }

    if (phoneUser.length == 0) {
        formMessagePhone.innerHTML = 'Vui lòng nhập vào số điện thoại';
    } else if (phoneUser.length != 10) {
        formMessagePhone.innerHTML = 'Vui lòng nhập vào số điện thoại 10 số';
        document.getElementById('phone').value = '';
    }

    if (passwordUser.length == 0) {
        formMessagePassword.innerHTML = 'Vui lòng nhập mật khẩu';
    } else if (passwordUser.length < 6) {
        formMessagePassword.innerHTML = 'Vui lòng nhập mật khẩu lớn hơn 6 kí tự';
        document.getElementById('password').value = '';
    }

    if (fullNameUser && phoneUser && passwordUser) {
        let user = {
            fullname: fullNameUser,
            phone: phoneUser,
            password: passwordUser,
            address: '',
            email: '',
            status: 1,
            join: new Date(),
            cart: [],
            role: 0
        }
        console.log(user);
        let accounts = localStorage.getItem('accounts') ? JSON.parse(localStorage.getItem('accounts')) : [];
        let checkloop = accounts.some(account => {
            return account.phone == user.phone;
        })
        if (!checkloop) {
            accounts.push(user);
            localStorage.setItem('accounts', JSON.stringify(accounts));
            toast({ title: 'Thành công', message: 'Tạo thành công tài khoản !', type: 'success', duration: 3000 });
            document.querySelector(".signup").classList.remove("open");
            showUser();
            signUpFormReset();
        } else {
            toast({ title: 'Cảnh báo !', message: 'Tài khoản đã tồn tại !', type: 'error', duration: 3000 });
        }
    }
})

document.getElementById("logout-acc").addEventListener('click', (e) => {
    e.preventDefault();
    localStorage.removeItem("currentuser");
    window.location = "/";
})