# homebrew-distribution

## Purpose

ให้ Homebrew ย้ายชื่อสูตรได้แม้เวอร์ชันตรงกัน. Requirements: same-version-brew-migration.

## ADDED Requirements

### Requirement: same-version-brew-migration

สูตร cloop SHALL ให้อัปเกรดจากสูตรเดิมใน tap เดียวกันได้แม้ใช้ซอร์สรุ่นเดียวกัน

#### Scenario: อัปเกรดรุ่นซอร์สเดียวกัน

- **WHEN** ผู้ใช้ Homebrew อัปเกรดจากสูตรเดิมที่ติดตั้ง v3.7.5
- **THEN** Homebrew ย้ายชื่อและติดตั้งสูตรใหม่เป็น 3.7.5_1 โดยไม่เขียนทับไฟล์ CLI ของ keg เดิม
