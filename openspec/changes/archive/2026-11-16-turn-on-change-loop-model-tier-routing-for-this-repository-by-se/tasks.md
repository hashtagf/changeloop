# Tasks

> This is the sole implementation ledger.

- [x] **T001** Set models.routing to true in foundation.json [key:task-1] [kind:implementation] [paths:foundation.json] [claims:routing-on] — verify: `node -e "const m=require('./foundation.json').models; if(m.routing!==true||m.fast.family!=='haiku'||m.standard.family!=='sonnet'||m.deep.family!=='opus') process.exit(1)" && printf 'TAP version 13\n1..1\nok 1 - foundation.json enables model routing with haiku/sonnet/opus tiers\n'`
