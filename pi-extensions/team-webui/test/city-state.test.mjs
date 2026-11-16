import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cityRows, cityStatus, cityDestination,cityAssignment,districts,cityRoute } from '../web/city-state.js';

test('city derives truthful status, filters saved sessions, and keeps stable order across heartbeats', () => {
  const rows = [
    { key: 'b', project: 'Pi', projectRoot: '/pi', sessionName: 'Review', online: true, busy: true, createdAt: 2 },
    { key: 'a', project: 'Pi', projectRoot: '/pi', sessionName: 'Main', online: true, busy: false, createdAt: 1 },
    { key: 'c', project: 'Other', sessionName: 'Saved', online: false, busy: true, createdAt: 3 },
  ];
  assert.deepEqual(rows.map(cityStatus), ['working', 'idle', 'offline']);
  assert.deepEqual(cityRows(rows).map(r => r.key), ['a', 'b']);
  assert.deepEqual(cityRows([...rows].reverse()).map(r => r.key), ['a', 'b']);
  assert.deepEqual(cityRows(rows, '/pi', 'review', true).map(r => r.key), ['b']);
  assert.equal(cityRows(rows, '', '', true).length, 3);
  assert.equal(cityRows(rows, '', 'missing').length, 0);
  assert.equal(cityRows([{ ...rows[0], unavailable: true }]).length, 0);
});

test('city has distinct status destinations within the island for all 64 citizens', () => {
  for (const status of ['working', 'idle', 'offline',...districts.map(d=>d.id)]) {
    const positions = Array.from({ length: 64 }, (_, slot) => cityDestination(status, slot));
    assert.equal(new Set(positions.map(p => `${p.x},${p.z}`)).size, 64);
    assert.ok(positions.every(p => Math.abs(p.x) < 32 && Math.abs(p.z) < 32));
  }
  assert.notDeepEqual(cityDestination('working', 0), cityDestination('idle', 0));
  assert.notDeepEqual(cityDestination('idle', 0), cityDestination('offline', 0));
});
test('Kanban assignment controls district while presence and blocking control motion, never inventing task progress',()=>{
 const row={id:'agent',online:true,busy:true},task={id:'task',ownerSessionId:'agent',status:'verify',title:'Test'};
 assert.equal(cityAssignment(row,[task]).district,'verify');assert.equal(cityAssignment(row,[task]).pose,'inspect');
 assert.equal(cityAssignment({...row,busy:false},[task]).pose,'idle');assert.equal(cityAssignment(row,[{...task,blocker:'Waiting'}]).pose,'wait');
 assert.equal(cityAssignment({...row,online:false},[task]).district,'offline');assert.equal(cityAssignment(row,[]).source,'session');
 assert.equal(cityAssignment({...row,busy:false},[]).district,'idle');assert.equal(cityAssignment({...row,id:'other'},[task]).task,undefined);
 const destination=cityDestination('build',63),route=cityRoute(cityDestination('plan',63),destination);assert.deepEqual(route.at(-1),destination);assert.equal(route[1].x,30);
});
