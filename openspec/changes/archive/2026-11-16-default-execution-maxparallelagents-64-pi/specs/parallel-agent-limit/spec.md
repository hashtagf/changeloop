# parallel-agent-limit

## Purpose

ค่า default ของ execution.maxParallelAgents เป็น 64 เท่ากับ Pi.

## ADDED Requirements

### Requirement: agents-default-64

Change Loop SHALL ใช้ 64 เป็นค่า default ของ execution.maxParallelAgents และ SHALL รับค่าจำนวนเต็ม 1 ถึง 64

- foundation.json ที่ installer คัดลอกให้ consumer ใหม่ตั้ง maxParallelAgents เป็น 64
- maxParallelProviders และ maxParallelSetups ยังจำกัด 1 ถึง 16

#### Scenario: ไม่กำหนดค่าได้ 64

- **GIVEN** foundation.json ไม่มี execution.maxParallelAgents
- **WHEN** harness โหลด policy
- **THEN** execution.maxParallelAgents เป็น 64

#### Scenario: ค่า 64 ผ่าน

- **WHEN** foundation.json ตั้ง maxParallelAgents เป็น 64
- **THEN** policy โหลดได้โดยไม่ error

#### Scenario: ค่า 65 ถูกปฏิเสธ

- **WHEN** foundation.json ตั้ง maxParallelAgents เป็น 65
- **THEN** harness ปฏิเสธพร้อมข้อความที่ระบุ maxParallelAgents

#### Scenario: provider ยังจำกัด 16

- **WHEN** foundation.json ตั้ง maxParallelProviders เป็น 17
- **THEN** harness ปฏิเสธพร้อมข้อความที่ระบุ maxParallelProviders
