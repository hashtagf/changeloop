# spec-review

## Purpose

ตรวจสเปกด้วย reviewer ที่ไม่รู้บริบทก่อนอนุมัติ เมื่อขอ.

## ADDED Requirements

### Requirement: on-demand-spec-review

ระบบ SHALL รันรีวิวสเปกเฉพาะเมื่อมีการสั่ง spec-review <change> กับ change ที่คอมไพล์แล้วและยังไม่เริ่ม Land

#### Scenario: สั่งรีวิว change ที่รออนุมัติ

- **GIVEN** change ที่ผ่าน change start และยังไม่อนุมัติ
- **WHEN** รัน spec-review <change>
- **THEN** ระบบรัน reviewer 3 มุมกับ packet ปัจจุบันและบันทึกผลผูกกับ digest ของ packet

#### Scenario: change start ไม่รันรีวิวเอง

- **WHEN** รัน change start กับ draft ที่สมบูรณ์
- **THEN** ไม่มี reviewer ถูก spawn และไม่มีผลรีวิวสเปกถูกสร้าง

#### Scenario: change ไม่มีอยู่

- **WHEN** รัน spec-review กับ id ที่ไม่มี change
- **THEN** คำสั่งล้มเหลวพร้อมข้อความระบุ id และไม่ spawn reviewer

#### Scenario: change เข้า Land แล้ว

- **WHEN** รัน spec-review กับ change ที่เริ่ม Land หรือ archived แล้ว
- **THEN** คำสั่งปฏิเสธโดยไม่ spawn reviewer

### Requirement: three-isolated-lenses

ระบบ SHALL รันแต่ละมุมใน session ใหม่แบบอ่านอย่างเดียวที่เห็นเฉพาะ packet และไฟล์ที่ packet อ้างถึง

- prompt ของแต่ละมุมไม่รวมบทสนทนาหรือ draft
- ใช้ adapter claude-cli หรือ codex-cli ที่ตั้งค่าแบบ read-only และ ephemeral
- รุ่นโมเดลเลือกจากระดับความเสี่ยงของ change ด้วยกติกาเดียวกับรีวิวตอน Prove

#### Scenario: สามมุมแยก session

- **WHEN** spec-review รันกับ reviewer ที่พร้อม
- **THEN** ผลบันทึก 3 มุมแต่ละมุมมี session id ไม่ซ้ำกัน

#### Scenario: prompt ไม่มีบทสนทนา

- **WHEN** ระบบสร้าง prompt ของมุมใดก็ตาม
- **THEN** prompt มีเฉพาะชื่อมุม เกณฑ์ของมุม และ path ของไฟล์ใน packet
- **AND** ไม่มีเนื้อหาจาก .foundation/drafts

#### Scenario: change ระดับ medium ใช้รุ่น standard

- **GIVEN** change ระดับ medium และ reviewer claude-cli
- **WHEN** spec-review รัน
- **THEN** ทุกมุมรันด้วย model class standard

#### Scenario: reviewer ใช้ session ของผู้ร่างสเปกซ้ำ

- **WHEN** reviewer คืน session id ที่ตรงกับ session ปัจจุบัน
- **THEN** มุมนั้นถูกบันทึกเป็น not-run ไม่นับผล

### Requirement: not-run-status

ระบบ SHALL บันทึกมุมที่รันไม่สำเร็จหลังลองใหม่ 1 ครั้งเป็น not-run และไม่นับเป็นศูนย์ข้อสังเกต

#### Scenario: reviewer ล้มเหลวครั้งเดียว

- **WHEN** มุมหนึ่งล้มเหลวครั้งแรกแล้วสำเร็จเมื่อลองใหม่
- **THEN** มุมนั้นเป็น completed

#### Scenario: reviewer ล้มเหลวสองครั้ง

- **WHEN** มุมหนึ่งล้มเหลวทั้งสองครั้ง
- **THEN** มุมนั้นเป็น not-run พร้อมเหตุผล และสรุปไม่แสดงว่าผ่าน

#### Scenario: ไม่มี reviewer CLI

- **GIVEN** ไม่มี reviewer ที่ติดตั้งและพร้อม
- **WHEN** รัน spec-review
- **THEN** ทั้ง 3 มุมเป็น not-run และไม่ fallback ไป main-session

### Requirement: advisory-findings

ระบบ SHALL แสดงผลรีวิวสเปกใน package เป็นคำแนะนำที่ไม่บล็อกการอนุมัติ

#### Scenario: แสดงผลในหน้าอนุมัติ

- **GIVEN** มีผลรีวิวที่ตรงกับ packet ปัจจุบัน
- **WHEN** รัน package <change>
- **THEN** ผลแสดงสถานะแต่ละมุมและข้อสังเกตเรียงจาก blocker ถึง nit

#### Scenario: มี blocker แต่ยังอนุมัติได้

- **GIVEN** ผลรีวิวมีข้อสังเกตระดับ blocker
- **WHEN** รัน advance --approve-spec
- **THEN** การอนุมัติถูกบันทึกตามปกติ

#### Scenario: packet เปลี่ยนหลังรีวิว

- **GIVEN** มีผลรีวิวแล้วและ change ถูก revise
- **WHEN** รัน package <change>
- **THEN** ผลรีวิวเดิมแสดงว่าเก่า (stale) ไม่ใช่ผลของ packet ปัจจุบัน

#### Scenario: ยังไม่เคยรีวิว

- **WHEN** รัน package กับ change ที่ไม่เคยสั่ง spec-review
- **THEN** package ไม่แสดงส่วนรีวิวสเปกและไม่เตือน
