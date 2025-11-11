const apiPath = "miiinii32";

// 初始化
function init() {
  getOrderData();
}
init();
const jsOrderList = document.querySelector(".js-orderList");
function renderOrderList(orderList) {
  let str = "";
  orderList.forEach((item) => {
    // 訂單產品list -> 假設使用者下訂超過1個會變成一個array
    let productStr = "";
    item.products.forEach((product) => {
      productStr += `<p>${product.title}x${product.quantity}</p>`;
    });

    // 訂單狀態修正
    let paidStatus = "";
    if (item.paid === false) {
      paidStatus = "未處理";
    } else {
      paidStatus = "已處理";
    }
    // 轉換時間
    let timeStamp = new Date(item.createdAt * 1000);
    let orderTime = `${timeStamp.getFullYear()}/${
      timeStamp.getMonth() + 1
    }/${timeStamp.getDate()}`;
    console.log(orderTime);

    // 訂單list
    str += `
        <tr>
              <td>${item.id}</td>
              <td>
                <p>${item.user.name}</p>
                <p>${item.user.tel}</p>
              </td>
              <td>${item.user.address}</td>
              <td>${item.user.email}</td>
              <td>
                ${productStr}
              </td>
              <td>${orderTime}</td>
              <td class="orderStatus">
                <a href="#" id="orderStatusBtn" data-id="${item.id}" data-status="${item.paid}" >${paidStatus}</a>
              </td>
              <td>
                <input type="button" class="delSingleOrder-Btn" id="delSingleOrderBtn" data-id="${item.id}" value="刪除" />
              </td>
        </tr>`;
  });
  jsOrderList.innerHTML = str;

  renderChart(orderList);
}
let test = [];
async function getOrderData() {
  try {
    const res = await axios.get(
      `https://livejs-api.hexschool.io/api/livejs/v1/admin/${apiPath}/orders`,
      {
        headers: {
          Authorization: "Ca2TiNj8OAaoTIcz9mJIWV2OZqp2",
        },
      }
    );
    const orderList = res.data.orders;
    console.log(orderList);
    renderOrderList(orderList);
  } catch (error) {
    console.log("get後台訂單失敗", error.message);
  }
}

// 刪除全部訂單
const discardAllBtn = document.querySelector(".discardAllBtn");
discardAllBtn.addEventListener("click", function (e) {
  e.preventDefault();
  deleteAllOrder();
});
async function deleteAllOrder() {
  try {
    const res = await axios.delete(
      `https://livejs-api.hexschool.io/api/livejs/v1/admin/${apiPath}/orders`,
      {
        headers: {
          Authorization: "Ca2TiNj8OAaoTIcz9mJIWV2OZqp2",
        },
      }
    );
    const emptyOrderData = res.data.orders;
    alert("刪除全部訂單成功");
    renderOrderList(emptyOrderData);
  } catch (error) {
    console.log("刪除群不訂單失敗", error.message);
    alert("刪除全部訂單失敗");
  }
}

// 點擊刪除單一訂單跟更改訂單狀態
jsOrderList.addEventListener("click", function (e) {
  e.preventDefault();
  let targetClass = e.target.getAttribute("id");
  let orderID = e.target.getAttribute("data-id");
  let orderStatus = e.target.getAttribute("data-status");
  if (targetClass === "orderStatusBtn") {
    // status轉換
    if (orderStatus == "false") {
      orderStatus = true;
    } else if (orderStatus == "true") {
      orderStatus = false;
    }

    postOrderStatus(orderID, orderStatus);
    console.log(orderID, orderStatus);
  }
  if (targetClass === "delSingleOrderBtn") {
    deleteOneOrder(orderID);
    console.log("刪除單一訂單");
  }
});

// 刪除單一訂單
async function deleteOneOrder(orederID) {
  try {
    const res = await axios.delete(
      `https://livejs-api.hexschool.io/api/livejs/v1/admin/${apiPath}/orders/${orederID}`,
      {
        headers: {
          Authorization: "Ca2TiNj8OAaoTIcz9mJIWV2OZqp2",
        },
      }
    );
    const newOrderList = res.data.orders;
    renderOrderList(newOrderList);
    alert("刪除該筆訂單成功");
  } catch (error) {
    console.log("刪除該筆訂單失敗", error.message);
    alert("刪除單筆訂單失敗");
  }
}

// 更改訂單狀態
async function postOrderStatus(orderID, orderStatus) {
  try {
    const res = await axios.put(
      `https://livejs-api.hexschool.io/api/livejs/v1/admin/${apiPath}/orders`,
      {
        data: {
          id: orderID,
          paid: orderStatus,
        },
      },
      {
        headers: {
          Authorization: "Ca2TiNj8OAaoTIcz9mJIWV2OZqp2",
        },
      }
    );
    const newOrderList = res.data.orders;
    renderOrderList(newOrderList);
    alert("修改訂單狀態成功");
  } catch (error) {
    console.log("修改訂單狀態失敗", error.message);
    alert("修改訂單狀態失敗");
  }
}

// C3.js
function renderChart(orderList) {
  //全產品類別資料整理
  let categoryObj = {};
  orderList.forEach((item) => {
    item.products.forEach((product) => {
      if (categoryObj[product.category] == undefined) {
        categoryObj[product.category] = product.price * product.quantity;
      } else {
        categoryObj[product.category] += product.price * product.quantity;
      }
    });
  });
  let productCategory = Object.entries(categoryObj);
  console.log(productCategory);

  //全品項資料整理
  let everyProductObj = {};
  orderList.forEach((item) => {
    item.products.forEach((product) => {
      if (everyProductObj[product.title] === undefined) {
        everyProductObj[product.title] = product.price * product.quantity;
      } else {
        everyProductObj[product.title] += product.price * product.quantity;
      }
    });
  });
  let everyProduct = Object.entries(everyProductObj);
  let everyProductRank = everyProduct.sort(function (a, b) {
    return b[1] - a[1];
  });
  let everyProductResult = [];
  if (everyProductRank.length > 3) {
    everyProductResult = everyProductRank.slice(0, 3);
    let otherTotal = 0;
    everyProductRank.forEach(function (item, index) {
      if (index > 2) {
        otherTotal += item[1];
      }
    });
    everyProductResult.push(["其他", otherTotal]);
  } else {
    everyProductResult = everyProductRank;
  }
  console.log(everyProductResult);

  // 全產品類別營收比重
  c3.generate({
    bindto: "#chart", // HTML 元素綁定
    data: {
      type: "pie",
      columns: productCategory,
      colors: {
        床架: "#DACBFF",
        收納: "#9D7FEA",
        窗簾: "#5434A7",
        //   其他: "#301E5F",
      },
    },
  });
  // 全品相營收比重
  c3.generate({
    bindto: "#chart2", // HTML 元素綁定
    data: {
      type: "pie",
      columns: everyProductResult,
    },
    color: {
      pattern: ["#DACBFF", "#9D7FEA", "#5434A7", "#301E5F"],
    },
  });
}
