# polyglot-lifecycle Specification

## Purpose
ชุดเทสต์พา consumer ที่เป็น repo Go, Rust, Python และ Ruby จริงจาก change start ถึง archived ด้วยเทสต์ของภาษานั้น.
## Requirements
### Requirement: polyglot-lifecycle-seam

ชุดเทสต์ SHALL พา consumer ที่ติดตั้ง Change Loop และเป็น repo Go, Rust, Python หรือ Ruby จริงจาก change start ถึง archived โดยใช้ runner เริ่มต้นของภาษานั้น

- แต่ละภาษาเพิ่มฟังก์ชัน subtract พร้อมเทสต์ใน sandbox แล้ว advance ถึง archived
- receipt test ต้องผ่านและการนับจำนวนเทสต์ต้องได้ตัวเลขเมื่อ Prove บันทึก discovery
- ภาษาที่เครื่องไม่มีเครื่องมือถูกข้ามพร้อมเหตุผล
- อยู่ในชั้น SLOW ของ run-all

#### Scenario: Go

- **GIVEN** consumer Go มี go.mod และ calc_test.go
- **WHEN** เพิ่ม Subtract และเทสต์ใน sandbox แล้ว advance ถึง archived
- **THEN** change ถึง archived และไฟล์ของ target มี Subtract

#### Scenario: Rust

- **GIVEN** consumer Rust มี Cargo.toml และ tests/calc.rs
- **WHEN** เพิ่ม subtract และเทสต์แล้ว advance ถึง archived
- **THEN** change ถึง archived

#### Scenario: Python

- **GIVEN** consumer Python มี pyproject.toml และ tests/test_calc.py
- **WHEN** เพิ่ม subtract และเทสต์แล้ว advance ถึง archived
- **THEN** change ถึง archived

#### Scenario: Ruby

- **GIVEN** consumer Ruby มี test/calc_test.rb ที่ใช้ Minitest
- **WHEN** เพิ่ม subtract และเทสต์แล้ว advance ถึง archived
- **THEN** change ถึง archived

#### Scenario: เทสต์ล้ม

- **GIVEN** consumer Go ที่ Subtract คืนค่าผิด
- **WHEN** advance ถึง archived
- **THEN** ไม่ถึง archived

#### Scenario: ไม่มี toolchain

- **GIVEN** เครื่องไม่มี cargo
- **WHEN** รันชุดเทสต์
- **THEN** กรณี Rust ถูกข้ามพร้อมเหตุผล
