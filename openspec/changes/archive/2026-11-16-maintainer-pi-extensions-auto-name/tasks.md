# Tasks

> This is the sole implementation ledger.

- [x] **T001** extension session-title พร้อมเทสต์ผ่าน loader จริงของ Pi [key:session-title] [kind:implementation] [paths:pi-extensions/session-title/**] [claims:auto-name-1,auto-name-120,auto-name-3,auto-name-reload,agent-title-tool-agent-session-title-title-tab-titles-from-work,agent-title-tool-agent-session-title,agent-title-tool-agent-title-61,agent-title-tool-agent-session-title-2] — verify: `node --test pi-extensions/session-title/*.test.cjs`
- [x] **T002** ลงทะเบียน session-title ใน package.json, install.sh, test.sh, pack-check, CHANGELOG, README และ docs/tools.md [key:wiring] [kind:implementation] [paths:pi-extensions/package.json,pi-extensions/install.sh,pi-extensions/test.sh,pi-extensions/scripts/**,pi-extensions/CHANGELOG.md,pi-extensions/README.md,pi-extensions/docs/**,pi-extensions/session-title/**] [claims:title-package-wiring] — verify: `npm --prefix pi-extensions run check`
