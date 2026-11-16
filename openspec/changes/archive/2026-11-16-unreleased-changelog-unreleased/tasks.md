# Tasks

> This is the sole implementation ledger.

- [x] **T001** หัวข้อ 3.7.4 ใน CHANGELOG อยู่หลังรายการ Unreleased ทั้งสอง [key:fix-changelog] [kind:implementation] [paths:CHANGELOG.md] [claims:changelog-unreleased] — verify: `node -e "const t=require('fs').readFileSync('CHANGELOG.md','utf8');const u=t.indexOf('## [Unreleased]'),a=t.indexOf('maxParallelAgents'),p=t.indexOf('Pi guards'),r=t.indexOf('## [3.7.4]');if(!(u<a&&a<r&&p<r))process.exit(1)"`
