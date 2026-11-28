# advisory-guards

## ADDED Requirements

### Requirement: heredoc-data-stays-data

การหา mutation target ของ shell guard SHALL ไม่อ่านเนื้อหา heredoc ที่ delimiter มี quote และป้อนให้คำสั่งที่ไม่ใช่ shell หรือ interpreter

- shell หรือ interpreter คือ sh, bash, zsh, ksh, dash, eval, node, python, ruby, perl, php, deno, bun บนบรรทัดของ marker
- heredoc ที่ป้อนให้ shell หรือ interpreter ยังถูกอ่านเป็นโค้ดเมื่อคำสั่งมี carrier

#### Scenario: cat heredoc กับ sh -c

- **GIVEN** workspace /tmp/ws
- **WHEN** คำสั่ง cd /tmp/ws && cat > a.mjs <<'EOF' ที่มีบรรทัด ../../.. ใน body ตามด้วย sh -c "node --test"
- **THEN** ไม่มี violation

#### Scenario: node heredoc

- **GIVEN** workspace /tmp/ws
- **WHEN** คำสั่ง cd /tmp/ws && node <<'EOF' ที่ body เขียนไฟล์ ../../x ตามด้วย sh -c true
- **THEN** ได้ violation ว่ามี path ออกนอก workspace

#### Scenario: redirect ออกนอก

- **GIVEN** workspace /tmp/ws
- **WHEN** คำสั่ง cd /tmp/ws && cat > ../out.txt <<'EOF' ตามด้วย sh -c true
- **THEN** ได้ violation
