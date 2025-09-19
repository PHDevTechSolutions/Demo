import React from "react";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

interface ExportProps {
  data: {
    companyName: string;
    typeClients: string;
    totalSales: number;
    averageSales: number;
    targetQuota?: number;
  }[];
  grandTotal: number;
}

const Export: React.FC<ExportProps> = ({ data, grandTotal }) => {
  const handleExportToExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Sales Report");

    worksheet.columns = [
      { header: "Company Name", key: "companyName", width: 30 },
      { header: "Type of Client", key: "typeClients", width: 30 },
      { header: "Total Sales (SI)", key: "totalSales", width: 20 },
      { header: "Average Sales", key: "averageSales", width: 20 },
    ];

    data.forEach(({ companyName, typeClients, totalSales, averageSales }) => {
      worksheet.addRow({
        companyName,
        typeClients,
        totalSales,
        averageSales,
      });
    });

    worksheet.addRow({
      companyName: "Grand Total",
      typeClients: "",
      totalSales: grandTotal,
      averageSales: "",
    });

    worksheet.getColumn("totalSales").numFmt = '"₱"#,##0.00;[Red]\-"₱"#,##0.00';
    worksheet.getColumn("averageSales").numFmt = '"₱"#,##0.00;[Red]\-"₱"#,##0.00';
    worksheet.getRow(1).font = { bold: true };

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, "sales_report.xlsx");
  };

  return (
    <button
      onClick={handleExportToExcel}
      className="bg-green-600 text-white text-xs px-4 py-2 rounded hover:bg-green-700 whitespace-nowrap"
    >
      Export to Excel
    </button>
  );
};

export default Export;
