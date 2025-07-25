let balance = 0;

function addInvoice() {
  const item = document.getElementById('item').value;
  const qty = parseInt(document.getElementById('quantity').value);
  const price = parseFloat(document.getElementById('price').value);
  const tax = parseFloat(document.getElementById('tax').value);

  if (!item || isNaN(qty) || isNaN(price) || isNaN(tax)) {
    alert('Please fill all fields correctly.');
    return;
  }

  const subtotal = qty * price;
  const taxAmt = subtotal * (tax / 100);
  const total = subtotal + taxAmt;

  const invoiceTable = document.getElementById('invoiceTable').getElementsByTagName('tbody')[0];
  const row = invoiceTable.insertRow();
  row.innerHTML = `<td>${item}</td><td>${qty}</td><td>${price}</td><td>${tax}%</td><td>${total.toFixed(2)}</td>`;

  const cashBookTable = document.getElementById('cashBookTable').getElementsByTagName('tbody')[0];
  balance += total;
  const now = new Date().toISOString().slice(0, 10);
  const cbRow = cashBookTable.insertRow();
  cbRow.innerHTML = `<td>${now}</td><td>Inflow</td><td>${item}</td><td>${total.toFixed(2)}</td><td>${balance.toFixed(2)}</td>`;

  document.getElementById('item').value = '';
  document.getElementById('quantity').value = '';
  document.getElementById('price').value = '';
  document.getElementById('tax').value = '';
}

function downloadExcel() {
  const invoiceData = [["Item", "Qty", "Price", "Tax", "Total"]];
  const cashData = [["Date", "Type", "Description", "Amount", "Balance"]];

  document.querySelectorAll("#invoiceTable tbody tr").forEach(row => {
    const rowData = Array.from(row.cells).map(cell => cell.innerText);
    invoiceData.push(rowData);
  });

  document.querySelectorAll("#cashBookTable tbody tr").forEach(row => {
    const rowData = Array.from(row.cells).map(cell => cell.innerText);
    cashData.push(rowData);
  });

  const wb = XLSX.utils.book_new();
  const ws1 = XLSX.utils.aoa_to_sheet(invoiceData);
  const ws2 = XLSX.utils.aoa_to_sheet(cashData);
  XLSX.utils.book_append_sheet(wb, ws1, "Invoices");
  XLSX.utils.book_append_sheet(wb, ws2, "CashBook");
  XLSX.writeFile(wb, "Invoice_CashBook.xlsx");
}

function downloadPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  doc.setFontSize(16);
  doc.text("Invoice Report", 14, 15);
  doc.autoTable({
    startY: 20,
    head: [["Item", "Qty", "Price", "Tax", "Total"]],
    body: Array.from(document.querySelectorAll("#invoiceTable tbody tr")).map(row =>
      Array.from(row.cells).map(cell => cell.innerText)
    )
  });

  const finalY = doc.lastAutoTable.finalY + 10;
  doc.text("Cash Book", 14, finalY);
  doc.autoTable({
    startY: finalY + 5,
    head: [["Date", "Type", "Description", "Amount", "Balance"]],
    body: Array.from(document.querySelectorAll("#cashBookTable tbody tr")).map(row =>
      Array.from(row.cells).map(cell => cell.innerText)
    )
  });

  doc.save("Invoice_CashBook.pdf");
}

function importExcel(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    const data = new Uint8Array(e.target.result);
    const workbook = XLSX.read(data, { type: 'array' });

    document.querySelector("#invoiceTable tbody").innerHTML = "";
    document.querySelector("#cashBookTable tbody").innerHTML = "";

    balance = 0;

    const invoiceSheet = workbook.Sheets["Invoices"];
    if (invoiceSheet) {
      const invoiceData = XLSX.utils.sheet_to_json(invoiceSheet, { header: 1 });
      invoiceData.slice(1).forEach(row => {
        if (row.length < 5) return;
        const [item, qty, price, tax, total] = row;
        const tr = document.querySelector("#invoiceTable tbody").insertRow();
        tr.innerHTML = `<td>${item}</td><td>${qty}</td><td>${price}</td><td>${tax}</td><td>${total}</td>`;
      });
    }

    const cashBookSheet = workbook.Sheets["CashBook"];
    if (cashBookSheet) {
      const cashData = XLSX.utils.sheet_to_json(cashBookSheet, { header: 1 });
      cashData.slice(1).forEach(row => {
        if (row.length < 5) return;
        const [date, type, desc, amount, bal] = row;
        const tr = document.querySelector("#cashBookTable tbody").insertRow();
        tr.innerHTML = `<td>${date}</td><td>${type}</td><td>${desc}</td><td>${amount}</td><td>${bal}</td>`;
        balance = parseFloat(bal);
      });
    }
  };

  reader.readAsArrayBuffer(file);
}
