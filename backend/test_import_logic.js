const XLSX = require('xlsx');

const csvPath = process.argv[2] || './uploads/imports/import-1771870619673-967758876.csv';
console.log('Testing import logic for:', csvPath);

const workbook = XLSX.readFile(csvPath);
const worksheet = workbook.Sheets[workbook.SheetNames[0]];
const data = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

console.log('\nTotal rows:', data.length);

// Test the logic for first 10 data rows
for (let i = 5; i <= 14; i++) {
    const row = data[i];

    // Extract name using same logic as import controller
    let name_th = '';
    let name_en = '';

    let orgNameRaw = row['__EMPTY_2'] || row['ชื่อสถานประกอบการ'] || '';
    let companyName = row['__EMPTY_6'] || row['ชื่อบริษัท'] || '';

    name_th = row['Name (TH)'] || row['name_th'] || '';
    name_en = row['Name (EN)'] || row['name_en'] || '';

    // Process Format 1
    if (orgNameRaw && orgNameRaw.includes('\n')) {
        const parts = orgNameRaw.split('\n');
        name_th = parts[0].trim();
        name_en = parts[1].trim();
    } else if (orgNameRaw && !name_th && !name_en) {
        name_th = orgNameRaw.trim();
        name_en = orgNameRaw.trim();
    }

    // Process Format 2
    if (companyName && !name_th && !name_en) {
        if (companyName.includes('\n')) {
            const parts = companyName.split('\n');
            name_th = parts[0].trim();
            name_en = parts[1].trim();
        } else {
            name_th = companyName.trim();
            name_en = companyName.trim();
        }
    }

    // Check if skipped
    if (!name_th && !name_en) {
        const allEmpty = Object.values(row).every(val => !val || String(val).trim() === '');
        if (allEmpty) {
            console.log(`Row ${i}: SKIPPED (all empty)`);
            continue;
        }

        const rowValues = Object.values(row).join('|').toLowerCase();
        if (rowValues.includes('รายงานข้อมูล') ||
            rowValues.includes('mfu internship') ||
            rowValues.includes('ภาคการศึกษา') ||
            rowValues.includes('semester') ||
            rowValues.includes('เทคโนโลยีดิจิทัล') ||
            rowValues.includes('school of')) {
            console.log(`Row ${i}: SKIPPED (header detected)`);
            continue;
        }

        console.log(`Row ${i}: FAILED (no name) - companyName='${companyName.substring(0, 30)}'`);
    } else {
        console.log(`Row ${i}: OK - name_th='${name_th.substring(0, 40)}'`);
    }
}
