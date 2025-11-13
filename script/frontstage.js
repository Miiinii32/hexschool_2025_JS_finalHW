const apiPath = "miiinii32";
const productWrap = document.querySelector(".productWrap");
let product_data = [];
function init() {
  getProductList();
  getShoppingCart();
}
init(); //初始化
async function getProductList() {
  try {
    const res = await axios.get(
      `https://livejs-api.hexschool.io/api/livejs/v1/customer/${apiPath}/products`
    );
    product_data = res.data.products;
    renderProduct(product_data);
  } catch (error) {
    console.log("串接產品列表錯誤", error.message);
  }
}
function renderProduct(data) {
  let str = "";
  data.forEach((item) => {
    str += `
        <li class="productCard" data-id="${item.id}">
          <h4 class="productType">新品</h4>
          <img
            src="${item.images}"
            alt=""
          />
          <a href="#" class="addCardBtn">加入購物車</a>
          <h3>${item.title}</h3>
          <del class="originPrice">${item.origin_price}</del>
          <p class="nowPrice">${item.price}</p>
        </li>`;
  });
  productWrap.innerHTML = str;

  // post 加入購物車
  const productCard = document.querySelectorAll(".productCard");
  productCard.forEach((item) => {
    item.addEventListener("click", function (e) {
      const productID = item.dataset.id;
      if (e.target.getAttribute("class") === "addCardBtn") {
        e.preventDefault();
        postAddShoppingCart(productID);
      } else {
        return;
      }
    });
  });
}

// selected 篩選產品列表
const product_select = document.querySelector(".productSelect");
product_select.addEventListener("click", function (e) {
  const selected = e.target.value;
  if (selected === "全部") {
    renderProduct(product_data);
    return;
  }
  let selectedProductList = [];
  product_data.forEach((item) => {
    if (item.category === selected) {
      selectedProductList.push(item);
    }
  });
  renderProduct(selectedProductList);
});

async function getShoppingCart() {
  try {
    const res = await axios.get(
      `https://livejs-api.hexschool.io/api/livejs/v1/customer/${apiPath}/carts`
    );
    let shoppingCartData = res.data.carts;
    renderShoppingCart(shoppingCartData, finalTotal);
  } catch (error) {
    console.log("get購物車錯誤", error.message);
  }
}

// 加入購物車  -> 點擊事件在初始化的API裡
const shoppingCartTable = document.querySelector(".shoppingCart-table");
function renderShoppingCart(shoppingCartData, finalTotal) {
  let str = "";
  shoppingCartData.forEach((item) => {
    str += `
        <tr>
            <td>
              <div class="cardItem-title">
                <img src="${item.product.images}" alt="" />
                <p>${item.product.title}</p>
              </div>
            </td>
            <td>NT$${item.product.price}</td>
            <td>${item.quantity}</td>
            <td>NT$${item.product.price}</td>
            <td class="discardBtn">
              <a href="#" class="material-icons" id="clear" data-cartID="${item.id}"> clear </a>
            </td>
          </tr>
          `;
  });
  str += `
          <tr>
            <td>
              <a href="#" class="discardAllBtn">刪除所有品項</a>
            </td>
            <td></td>
            <td></td>
            <td>
              <p>總金額</p>
            </td>
            <td>NT$${finalTotal}</td>
          </tr>`;
  str =
    `<tr>
            <th width="40%">品項</th>
            <th width="15%">單價</th>
            <th width="15%">數量</th>
            <th width="15%">金額</th>
            <th width="15%"></th>
          </tr>` + str;
  shoppingCartTable.innerHTML = str;
}
async function postAddShoppingCart(id) {
  try {
    const res = await axios.post(
      `https://livejs-api.hexschool.io/api/livejs/v1/customer/${apiPath}/carts`,
      {
        data: {
          productId: id,
          quantity: 1,
        },
      }
    );
    alert("加入購物車成功");
    let shoppingCartData = res.data.carts;
    let finalTotal = res.data.finalTotal;
    console.log(shoppingCartData);
    renderShoppingCart(shoppingCartData, finalTotal);

    // 刪除指定購物車品項
    shoppingCartTable.addEventListener("click", function (e) {
      if (e.target.getAttribute("id") === "clear") {
        e.preventDefault();
        let cartID = e.target.getAttribute("data-cartID");
        deleteOneCart(cartID);
        console.log("delete單一購物車品項成功");
      }
    });
  } catch (error) {
    alert("加入購物車失敗");
    console.log("post購物車錯誤", error.message);
  }
}

// 刪除全部購物車
shoppingCartTable.addEventListener("click", function (e) {
  if (e.target.getAttribute("class") === "discardAllBtn") {
    e.preventDefault();
    deleteAllCart();
  }
});
async function deleteAllCart() {
  try {
    const res =
      await axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${apiPath}/carts
`);
    console.log(res.data.message);
    let shoppingCartData = res.data.carts;
    let finalTotal = res.data.finalTotal;
    alert("刪除全部購物車成功");
    renderShoppingCart(shoppingCartData, finalTotal);
  } catch (error) {
    console.log(error.message);
  }
}

// 刪除特定購物車品項 -> 點擊事件在渲染購物車的API裡
async function deleteOneCart(cartID) {
  try {
    const res = await axios.delete(
      `https://livejs-api.hexschool.io/api/livejs/v1/customer/${apiPath}/carts/${cartID}`
    );
    let shoppingCartData = res.data.carts;
    let finalTotal = res.data.finalTotal;
    alert("刪除該筆產品成功");
    renderShoppingCart(shoppingCartData, finalTotal);
  } catch (error) {
    console.log("刪除單一購物車失敗", error.message);
  }
}

// 送出訂單資料
const orderInfoForm = document.querySelector(".orderInfo-form");
orderInfoForm.addEventListener("submit", function (e) {
  e.preventDefault();

  let hasError = validateForm();
  if (hasError) {
    alert("請確實填寫資料");
    return;
  }

  const form = new FormData(orderInfoForm);
  const formData = Object.fromEntries(form.entries());
  postOrder(formData);
  validateForm();
});
async function postOrder(formData) {
  try {
    const res = await axios.post(
      `https://livejs-api.hexschool.io/api/livejs/v1/customer/${apiPath}/orders`,
      {
        data: {
          user: formData,
        },
      }
    );
    const emptyCartData = [];
    console.log(emptyCartData);
    renderShoppingCart(emptyCartData, 0);
    orderInfoForm.reset();
    alert("送出預定資料成功");
  } catch (error) {
    console.log("傳送訂到後台失敗", error.message);
    alert("送出預定資料失敗");
  }
}

// validate.js
let constraints = {
  name: {
    presence: {
      message: "^必填",
    },
  },
  tel: {
    presence: {
      message: "^必填",
    },
  },
  email: {
    presence: {
      message: "^必填",
    },
  },
  address: {
    presence: {
      message: "^必填",
    },
  },
};
function validateForm() {
  let errorMessage = orderInfoForm.querySelectorAll(".orderInfo-message");
  errorMessage.forEach((item) => (item.textContent = ""));
  let error = validate(orderInfoForm, constraints);
  console.log(error);
  if (error) {
    Object.keys(error).forEach((key) => {
      errorMessage.forEach((messageEl) => {
        if (key == messageEl.getAttribute("data-message")) {
          messageEl.textContent = error[key][0];
        }
      });
    });
    return true;
  }
  return false;
}
