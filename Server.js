const express = require("express");
const multer = require("multer");
const ExcelJS = require("exceljs");
const fs = require("fs");
const axios = require("axios");
const { ConfidentialClientApplication } = require("@azure/msal-node");

const app = express();
const upload = multer({ dest: "uploads/" });

const POWER_BI_WORKSPACE_ID = "YOUR_WORKSPACE_ID";
const POWER_BI_CLIENT_ID = "YOUR_CLIENT_ID";
const POWER_BI_CLIENT_SECRET = "YOUR_CLIENT_SECRET";
const POWER_BI_TENANT_ID = "YOUR_TENANT_ID";

const msalConfig = {
  auth: {
    clientId: POWER_BI_CLIENT_ID,
    authority: `https://login.microsoftonline.com/${POWER_BI_TENANT_ID}`,
    clientSecret: POWER_BI_CLIENT_SECRET,
  },
};

const cca = new ConfidentialClientApplication(msalConfig);

// Get Power BI access token
async function getPowerBIAccessToken() {
  const tokenRequest = {
    scopes: ["https://graph.microsoft.com/.default"],
  };
  const response = await cca.acquireTokenByClientCredential(tokenRequest);
  return response.accessToken;
}

// Read and process Excel data
async function processExcel(filePath) {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);
  const worksheet = workbook.worksheets[0];

  const data = [];
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber > 1) { // Skip header
      data.push({
        column1: row.getCell(1).value,
        column2: row.getCell(2).value,
      });
    }
  });

  return data;
}

// Upload Excel file and send to Power BI
app.post("/upload", upload.single("file"), async (req, res) => {
  if (!req.file) return res.status(400).send("No file uploaded");

  const filePath = req.file.path;
  const jsonData = await processExcel(filePath);
  console.log("Extracted Data:", jsonData);

  const accessToken = await getPowerBIAccessToken();

  const datasetResponse = await axios.post(
    `https://api.powerbi.com/v1.0/myorg/groups/${POWER_BI_WORKSPACE_ID}/datasets`,
    { name: "User Dataset" },
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );

  const datasetId = datasetResponse.data.id;
  console.log("Dataset Created:", datasetId);

  fs.unlinkSync(filePath); // Clean up uploaded file
  res.json({ message: "Data uploaded", datasetId });
});

// Start server
app.listen(5000, () => console.log("Server running on port 5000"));
