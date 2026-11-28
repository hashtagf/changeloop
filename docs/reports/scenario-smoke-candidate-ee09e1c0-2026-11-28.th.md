# Scenario smoke: candidate v3.7.10 `ee09e1c0` (2026-11-28)

**ขอบเขต:** paid lane 10 lane ที่บันทึกไว้สำหรับ v3.7.9 รันครั้งเดียวต่อ lane บน
release candidate เป็น smoke check (n=1) ไม่ใช่ repeated assurance หรือการอ้างว่า
เร็วขึ้น ข้อมูลดิบอยู่นอก Git ที่ `.claude/tests/bench/results/egm-ee09e1c0-cc/`

| รายการ | ค่า |
|---|---|
| Candidate | `ee09e1c01ef104aa4d0db01beb8ab5400787f93a` (`main` สะอาด, CI `--full` ผ่าน, run 46116419117) |
| Host / model | Claude Code 2.1.332, `claude-sonnet-5-5` (ค่าเริ่มต้นของ matrix) |
| Toolchain | Node v26.11.1, macOS arm64 |
| Concurrency | ทีละ lane |
| งบ | เจ้าของอนุมัติ US$10 สำหรับทั้ง smoke; จำกัด US$0.90 ต่อ lane (US$1.50 สำหรับ `project-tracker-api`) |
| ผลราย lane | [`benchmarks/3.7.10.json`](benchmarks/3.7.10.json) เทียบกับ [`benchmarks/3.7.9.json`](benchmarks/3.7.9.json) |

## ผล

ทั้ง 10 lane ถึง `archived` และผ่าน oracle ก่อน Land

| | 3.7.9 | 3.7.10 candidate | เปลี่ยน |
|---|---|---|---|
| ผ่าน (archived, oracle ผ่าน) | 10/10 | 10/10 | |
| เวลา | 16.4 นาที | 17.0 นาที | +4% |
| ค่าใช้จ่าย | US$3.86 | US$3.77 | −2% |
| Model requests | 102 | 91 | −11% |

ผลราย lane อยู่ในฉบับภาษาอังกฤษและ `benchmarks/3.7.10.json` ความต่างของเวลาและค่าใช้จ่ายราย lane อยู่ในช่วงคลาดเคลื่อนของการรันครั้งเดียว

## สิ่งที่ candidate นี้เปลี่ยน

ตั้งแต่ v3.7.9: เทสต์ tsx และ node จบเมื่อเทสต์จบ และแจ้งเมื่อคำสั่งค้างหลังเทสต์จบ; quality lane ประกาศ `paths` ได้และถูกข้ามเมื่อ change ไม่แตะ; provider ที่หมดเวลาบนเนื้อหาเดิมไม่ถูกรันซ้ำ; toolchain pack (Flutter, Gradle, Maven, Rust, Ruby, Terraform, Helm, Dockerfile, Kubernetes และ pack ของโปรเจกต์); lane ต่อ module ใน monorepo; แยก "ไม่มีเทสต์" กับ "หาเทสต์ไม่เจอ"; รอบรีวิวที่ผ่านแล้วแต่โค้ดเปลี่ยนไม่นับเพดาน; finding นอกขอบเขตรีวิวซ่อมได้; คู่มือ fast-checks ของ onboard; และแก้ backup ของ sandbox ไม่มี lane ไหนหยุดรอผู้ใช้ตัดสินใจ

## ที่ไม่ครอบคลุม

- รันครั้งเดียวต่อ lane ไม่มี repeated assurance
- ทั้ง 10 lane เป็น seed repository เดียวขนาดเล็ก: lane ต่อ module ของ monorepo, toolchain pack ภาษาอื่น และคำแนะนำ lane ที่ช้า ไม่ถูกทดสอบใน smoke นี้ มีแค่เทสต์แบบ deterministic
- ไม่มีหลักฐานจาก production หรือ dogfood
