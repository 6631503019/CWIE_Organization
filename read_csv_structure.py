import os
import sys

desktop = os.path.join(os.path.expanduser('~'), 'OneDrive', 'เดสก์ท็อป')
csv_file = os.path.join(desktop, 'รายงานข้อมูลสรุปการฝึกปฏิบัติงาน (ข้อมูลส(1).csv')

if os.path.exists(csv_file):
    with open(csv_file, 'r', encoding='utf-8') as f:
        for i, line in enumerate(f):
            if i < 30:
                print(line.rstrip())
            else:
                break
else:
    print(f"File not found: {csv_file}")
    print(f"Desktop path: {desktop}")
    print("Files in desktop:")
    if os.path.exists(desktop):
        for f in os.listdir(desktop):
            if f.endswith('.csv'):
                print(f"  - {f}")
