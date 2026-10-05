const XLSX = require('xlsx');

// Read the latest uploaded CSV
const csvPath = './uploads/imports/import-1771869619935-717580424.csv';

console.log('Reading:', csvPath);

const workbook = XLSX.readFile(csvPath);
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];
const data = XLSX.utils.sheet_to_json(worksheet);

console.log('\n=== Total rows:', data.length);

// Find first REAL data row (skip headers)
const dataRow = data.find(r => {
    const companyName = r['__EMPTY_6'];
    if (!companyName) return false;
    const nameStr = String(companyName).trim();
    // Skip if it's a header
    if (nameStr.includes('ชื่อบริษัท') || nameStr.includes('Organization')) return false;
    return nameStr.length > 5;
});

if (dataRow) {
    console.log('\n=== Sample Data Row ===');
    console.log('__EMPTY_4 (จังหวัด):', dataRow['__EMPTY_4']);
    console.log('__EMPTY_5 (ประเทศ):', dataRow['__EMPTY_5']);
    console.log('__EMPTY_6 (ชื่อบริษัท):', dataRow['__EMPTY_6']);
    console.log('__EMPTY_7 (ที่อยู่):', dataRow['__EMPTY_7']);
    console.log('__EMPTY_8 (เบอร์โทร):', dataRow['__EMPTY_8']);
    console.log('__EMPTY_9 (อีเมล):', dataRow['__EMPTY_9']);

    console.log('\n=== All columns in this row:');
    Object.keys(dataRow).forEach(key => {
        if (dataRow[key]) {
            const value = String(dataRow[key]);
            console.log(`${key}: ${value.substring(0, 50)}${value.length > 50 ? '...' : ''}`);
        }
    });
} else {
    console.log('\n=== First few rows ===');
    data.slice(0, 5).forEach((row, i) => {
        console.log(`\nRow ${i}:`, Object.keys(row).map(k => `${k}=${row[k]}`).join(', '));
    });
}
