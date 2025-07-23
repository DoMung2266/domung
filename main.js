let lastChangedField = null;
let groupIndex = 1;

function addRow() {
  const tbody = document.querySelector("#woodTable tbody");
  const row = document.createElement("tr");
  const index = tbody.rows.length + 1;
  row.innerHTML = `
    <td>${index}</td>
    <td><input type="number" placeholder="Dài"></td>
    <td><input type="number" placeholder="Rộng"></td>
    <td><input type="number" placeholder="Cao"></td>
    <td><input type="number" class="quantity" placeholder="1"></td>
    <td class="volumeCell">0</td>
    <td><button onclick="removeRow(this)">Xóa</button></td>
  `;
  tbody.appendChild(row);
}

function removeRow(btn) {
  const row = btn.closest("tr");
  row.remove();
  renumberRows();
  calculateTotal();
}

function renumberRows() {
  const rows = document.querySelectorAll("#woodTable tbody tr");
  rows.forEach((r, i) => {
    r.cells[0].textContent = i + 1;
  });
}

function parseMoney(val) {
  return parseInt(val.replace(/[^\d]/g, "")) || 0;
}

function formatMoneyInput(input) {
  const raw = input.value.replace(/[^\d]/g, "");
  input.value = raw ? parseInt(raw).toLocaleString("vi-VN") : "";
}

function trackChange(fieldName) {
  lastChangedField = fieldName;
}

function calculateTotal() {
  let total = 0;
  const rows = document.querySelectorAll("#woodTable tbody tr");

  const unitInput = document.getElementById("pricePerProduct");
  const khốiInput = document.getElementById("pricePerKhối");
  const unitPrice = parseMoney(unitInput.value);
  const khốiPrice = parseMoney(khốiInput.value);

  const tableBody = document.querySelector("#priceTable tbody");

  let groupRows = []; // Dòng chi tiết hiện tại

  rows.forEach(row => {
    const l = parseFloat(row.cells[1].querySelector("input").value);
    const w = parseFloat(row.cells[2].querySelector("input").value);
    const h = parseFloat(row.cells[3].querySelector("input").value);
    let qty = parseFloat(row.cells[4].querySelector("input").value);
    qty = qty > 0 ? qty : 1;

    if (l && w && h) {
      const volume = (l / 1000) * (w / 1000) * (h / 1000) * qty;
      row.querySelector(".volumeCell").textContent = volume.toFixed(6);
      total += volume;

      const qtyPerKhối = volume > 0 ? 1 / volume : 0;

      let newUnit = null, newBlock = null;
      if (lastChangedField === "block" && khốiPrice > 0 && qtyPerKhối > 0) {
        newUnit = Math.round(khốiPrice / qtyPerKhối);
        newBlock = khốiPrice;
      } else if (lastChangedField === "product" && unitPrice > 0 && qtyPerKhối > 0) {
        newUnit = unitPrice;
        newBlock = Math.round(unitPrice * qtyPerKhối);
      }

      if (newUnit && newBlock) {
        const sảnPhẩm = qtyPerKhối.toFixed(2);
        const newRow = document.createElement("tr");
        newRow.innerHTML = `
          <td>${newUnit.toLocaleString("vi-VN")} ₫</td>
          <td>${newBlock.toLocaleString("vi-VN")} ₫</td>
          <td>${l}</td>
          <td>${w}</td>
          <td>${h}</td>
          <td>${qty}</td>
          <td>${sảnPhẩm}</td>
        `;
        groupRows.push(newRow);
      }
    } else {
      row.querySelector(".volumeCell").textContent = "0";
    }
  });

  const qtyPerKhốiAll = total > 0 ? 1 / total : 0;
  const totalText = total.toFixed(6);
  const formattedQty = qtyPerKhốiAll.toFixed(2);
  document.getElementById("totalOutput").textContent =
    `🔢 Tổng số khối: ${totalText} m³ | 📦 Số sản phẩm / 1 khối: ${formattedQty}`;

  // Ghi nhóm dòng chi tiết
  groupRows.forEach(r => tableBody.appendChild(r));

  // Ghi dòng TỔNG
  if (groupRows.length > 0) {
    let newUnit = null, newBlock = null;
    if (lastChangedField === "block" && khốiPrice > 0) {
      newUnit = Math.round(khốiPrice / qtyPerKhốiAll);
      newBlock = khốiPrice;
    } else if (lastChangedField === "product" && unitPrice > 0) {
      newUnit = unitPrice;
      newBlock = Math.round(unitPrice * qtyPerKhốiAll);
    }

    if (newUnit && newBlock) {
      const tổngRow = document.createElement("tr");
      tổngRow.innerHTML = `
        <td><b>${newUnit.toLocaleString("vi-VN")} ₫</b></td>
        <td><b>${newBlock.toLocaleString("vi-VN")} ₫</b></td>
        <td colspan="4"><b>TỔNG</b></td>
        <td><b>${qtyPerKhốiAll.toFixed(2)}</b></td>
      `;
      tableBody.appendChild(tổngRow);
    }
  }

  groupIndex += 1;
}

function clearTable() {
  document.querySelector("#woodTable tbody").innerHTML = "";
  document.getElementById("totalOutput").textContent =
    "🔢 Tổng số khối: 0 m³ | 📦 Số sản phẩm / 1 khối: 0";
}

function clearPriceTable() {
  document.querySelector("#priceTable tbody").innerHTML = "";
  groupIndex = 1;
}

addRow();
