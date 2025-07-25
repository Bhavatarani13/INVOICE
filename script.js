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

  // Add to Invoice Table
  const invoiceTable = document.getElementById('invoiceTable').getElementsByTagName('tbody')[0];
  const row = invoiceTable.insertRow();
  row.innerHTML = `<td>${item}</td><td>${qty}</td><td>${price}</td><td>${tax}%</td><td>${total.toFixed(2)}</td>`;

  // Add to Cash Book as Inflow
  const cashBookTable = document.getElementById('cashBookTable').getElementsByTagName('tbody')[0];
  balance += total;
  const now = new Date().toISOString().slice(0, 10);
  const cbRow = cashBookTable.insertRow();
  cbRow.innerHTML = `<td>${now}</td><td>Inflow</td><td>${item}</td><td>${total.toFixed(2)}</td><td>${balance.toFixed(2)}</td>`;

  // Clear form
  document.getElementById('item').value = '';
  document.getElementById('quantity').value = '';
  document.getElementById('price').value = '';
  document.getElementById('tax').value = '';
}
