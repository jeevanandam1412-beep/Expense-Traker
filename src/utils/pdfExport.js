import jsPDF from 'jspdf';
import 'jspdf-autotable';

export function generateDailyPDF(dataObj) {
  const { income, borrowed, expenses, totalIncome, totalBorrowed, totalExpenses, netBalance, todayStr } = dataObj;
  
  const doc = new jsPDF();
  
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text(`Mohan Kumar Store - Daily Report`, 14, 20);
  
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text(`Date: ${todayStr}`, 14, 28);
  
  // Summary Section
  doc.setFont("helvetica", "bold");
  doc.text("Summary:", 14, 40);
  doc.setFont("helvetica", "normal");
  doc.text(`Total Income: Rs. ${totalIncome}`, 14, 48);
  doc.text(`Total Borrowed: Rs. ${totalBorrowed}`, 14, 56);
  doc.text(`Total Expenses: Rs. ${totalExpenses}`, 14, 64);
  
  doc.setFont("helvetica", "bold");
  const balanceLabel = netBalance >= 0 ? "Net Profit" : "Net Deficit";
  doc.text(`${balanceLabel}: Rs. ${Math.abs(netBalance)}`, 14, 72);
  
  let startY = 85;

  // Income Section
  if (income.length > 0) {
    doc.text("Income Records:", 14, startY);
    doc.autoTable({
      startY: startY + 5,
      head: [['Time', 'Source/Category', 'Amount', 'Note']],
      body: income.map(i => [
        new Date(i.id).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true }),
        i.source ? `${i.category} (${i.source})` : i.category,
        `Rs. ${i.amount}`,
        i.note || "-"
      ]),
      theme: 'grid',
      headStyles: { fillColor: [39, 174, 96] }
    });
    startY = doc.lastAutoTable.finalY + 15;
  }

  // Borrowed Section
  if (borrowed.length > 0) {
    if (startY > 250) { doc.addPage(); startY = 20; }
    doc.text("Borrowed Records:", 14, startY);
    doc.autoTable({
      startY: startY + 5,
      head: [['Time', 'Customer', 'Amount', 'Note']],
      body: borrowed.map(b => [
        new Date(b.id).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true }),
        b.borrowerName,
        `Rs. ${b.amount}`,
        b.note || "-"
      ]),
      theme: 'grid',
      headStyles: { fillColor: [41, 128, 185] }
    });
    startY = doc.lastAutoTable.finalY + 15;
  }

  // Expenses Section
  if (expenses.length > 0) {
    if (startY > 250) { doc.addPage(); startY = 20; }
    doc.text("Expense Records:", 14, startY);
    doc.autoTable({
      startY: startY + 5,
      head: [['Time', 'Category', 'Amount', 'Note']],
      body: expenses.map(e => [
        new Date(e.id).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true }),
        e.category,
        `Rs. ${e.amount}`,
        e.note || "-"
      ]),
      theme: 'grid',
      headStyles: { fillColor: [192, 57, 43] }
    });
  }

  doc.save(`Mohan_Kumar_Store_Report_${todayStr}.pdf`);
}
