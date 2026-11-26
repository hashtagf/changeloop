# Scenario smoke: candidate v3.7.9 `845ce476` (2026-11-27)

**ขอบเขต:** paid lane 10 lane ที่บันทึกไว้สำหรับ v3.7.8 รันครั้งเดียวต่อ lane บน
release candidate เป็น smoke check (n=1) ไม่ใช่ repeated assurance หรือการอ้างว่า
เร็วขึ้น ข้อมูลดิบอยู่นอก Git ที่ `.claude/tests/bench/results/egm-845ce476-cc/`

| รายการ | ค่า |
|---|---|
| Candidate | `845ce4769aaa54370e7b9b06e04d31d64db7ae36` (`main` สะอาด, CI `--full` ผ่าน, run 45854542824) |
| Host / model | Claude Code 2.1.332, `claude-sonnet-5-5` |
| Toolchain | Node v26.11.1, macOS arm64 |
| Concurrency | ทีละ lane |
| งบ | อนุมัติ US$3 สำหรับ 5 lane หลัง (จำกัด US$0.60 ต่อ lane); 5 lane แรกรันภายใต้การอนุมัติ paid e2e ก่อนหน้า |
| ผลราย lane | [`benchmarks/3.7.9.json`](benchmarks/3.7.9.json) เทียบกับ [`benchmarks/3.7.8.json`](benchmarks/3.7.8.json) |

## ผล

ทั้ง 10 lane ถึง `archived` และผ่าน oracle ก่อน Land

| | 3.7.8 | 3.7.9 candidate | เปลี่ยน |
|---|---|---|---|
| ผ่าน (archived, oracle ผ่าน) | 10/10 | 10/10 | |
| เวลา | 17.0 นาที | 16.4 นาที | −4% |
| ค่าใช้จ่าย | US$3.80 | US$3.86 | +2% |
| Model requests | 94 | 102 | +9% |

| Lane | 3.7.8 | 3.7.9 candidate |
|---|---|---|
| bare-node-boundary | 6/6 · 0.70 นาที · $0.303 | 6/6 · 0.72 นาที · $0.251 |
| cart-coupons | 11/11 · 1.84 นาที · $0.489 | 11/11 · 1.30 นาที · $0.426 |
| database-migration-rollback | 6/6 · 1.25 นาที · $0.293 | 6/6 · 1.33 นาที · $0.314 |
| multi-service-event-flow | 6/6 · 1.27 นาที · $0.299 | 6/6 · 1.54 นาที · $0.339 |
| notes-api | 13/13 · 2.46 นาที · $0.440 | 13/13 · 2.22 นาที · $0.480 |
| project-tracker-api | 33/33 · 6.33 นาที · $0.811 | 33/33 · 6.42 นาที · $0.847 |
| python-api-validation | 5/5 · 0.94 นาที · $0.291 | 5/5 · 0.89 นาที · $0.313 |
| refactor-no-reproduction | 6/6 · 0.82 นาที · $0.315 | 6/6 · 0.63 นาที · $0.313 |
| tiny-feature | 8/8 · 0.87 นาที · $0.288 | 8/8 · 0.81 นาที · $0.293 |
| typescript-react-state | 6/6 · 0.54 นาที · $0.267 | 6/6 · 0.56 นาที · $0.283 |

ความต่างของเวลาและค่าใช้จ่ายราย lane อยู่ในระดับ noise ของการรันครั้งเดียว

## สิ่งที่แก้ก่อน candidate นี้

paid run ก่อนหน้าในรอบนี้ (Pi และ Claude Code, model เดียวกัน) พบปัญหาต่อไปนี้ แต่ละข้อมี
regression test และอยู่ใน changelog

- `cart-coupons` ค้างก่อน Land: ไฟล์ product ที่เขียนระหว่าง Change ถูกลบใน Build
  ตอนนี้ EDIT แรกของ Build บอกชื่อไฟล์เหล่านั้น (`change-phase-target-edits`)
- `refactor-no-reproduction` หยุดรออนุมัติสเปกบน Pi ตอนนี้ paid lane อนุมัติสเปกชัดเจน
  (`benchmark:spec-approval`)
- `project-tracker-api`: ไฟล์ helper ของ test ทำให้ test discrimination สั่งซ่อมผิด;
  `node --test` ที่ทิ้ง keep-alive connection ค้างรอจนหมดเวลา 10 นาที; runner รายงาน
  oracle ก่อนซ่อม; และ oracle ต้องการ test 15 ตัวที่โจทย์ไม่ได้บอก ก่อนแก้มีรอบหนึ่งใช้ 56 นาที

## สิ่งที่ไม่ครอบคลุม

- รันครั้งเดียวต่อ lane ไม่มี repeated assurance
- อีก 21 lane ใน benchmark matrix ไม่มีผลของ 3.7.8 และไม่ได้รัน
- ไม่มีหลักฐาน production หรือ dogfood
