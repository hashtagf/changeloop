# Tasks

> This is the sole implementation ledger.

- [x] **T001** pi-extensions/btw มีคำสั่ง /btw ตัวสร้างบริบท กล่องคำตอบ และ test ที่โหลดผ่าน loader จริงของ Pi [key:btw-extension] [kind:implementation] [paths:pi-extensions/btw/index.ts,pi-extensions/btw/context.ts,pi-extensions/btw/README.md,pi-extensions/btw/btw.test.cjs] [claims:btw-command-btw,btw-command-btw-2,btw-command-btw-3,btw-command-btw-4,btw-isolation-btw,btw-isolation-esc,btw-isolation-btw-2] — verify: `cd pi-extensions && node --test btw/btw.test.cjs`
- [x] **T002** btw ถูกลงทะเบียนใน package.json install.sh test.sh README CHANGELOG และ docs/tools.md [key:btw-registration] [kind:implementation] [paths:pi-extensions/package.json,pi-extensions/install.sh,pi-extensions/test.sh,pi-extensions/README.md,pi-extensions/CHANGELOG.md,pi-extensions/docs/tools.md,pi-extensions/tsconfig.json,pi-extensions/scripts/pack-check.mjs,pi-extensions/scripts/pack-check.test.cjs] [depends:T001] [claims:btw-command-btw,btw-command-btw-2,btw-command-btw-3,btw-command-btw-4] — verify: `cd pi-extensions && npm test`
