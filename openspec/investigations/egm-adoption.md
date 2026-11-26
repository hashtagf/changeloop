# EGM (Elephant-Goldfish Model) — สรุปแหล่งภายนอก

แหล่ง: github.com/google/elephant-goldfish-model @ 63e239d8d4c3ddc6774faf533b4997405f78c549 (Apache-2.0, clone ที่ /tmp/egm ไม่อยู่ใน repo)

- Elephant = agent ที่รู้บริบท ร่างสเปก; Goldfish = subagent ใหม่ อ่านอย่างเดียว เห็นแค่เอกสารและไฟล์ที่อ้างถึง; คนตัดสินและอนุมัติ (README.md, docs/designs/architecture.md)
- `egm-review` รีวิวสเปกก่อนเขียนโค้ด 5 ด่าน: Zoom Out (YAGNI/reuse) → Comprehension (อ่านเข้าใจได้เอง) → Design Critic (scale/failure) → Zoom Out ซ้ำ → Implementation Readiness (path, signature, test) แต่ละด่านมี rubric ใน resources/document_standards/
- `egm-synthesizer` ส่งงานให้ reviewer หลายตัวพร้อมกัน รวมผล ตัดซ้ำ จัดเป็น Blocker/Major/Nit; reviewer ที่ล้มเหลวลองใหม่ 1 ครั้งแล้วเป็น `not run` ห้ามนับเป็นศูนย์ finding (agents/synthesizer.md)
- ถ้าเครื่องมือสร้าง subagent ใหม่ไม่ได้ ให้หยุด เพราะรีวิวในบริบทเดิมไม่ใช่ Goldfish review (resources/execution_instructions.md)
- `egm-brainstorm` ส่ง Goldfish 7 มุมไปหาจุดอ่อนของไอเดีย (design_critic, codebase_details, zoom_out, comprehension, implementation_readiness, structural, inventive_catalyst)
- `egm-drift-report` เทียบเอกสารใน docs/designs/ กับโค้ดปัจจุบันแบบอ่านอย่างเดียว ให้คนตัดสินว่าจะแก้เอกสารหรือโค้ด
- กติกา Adversarial Rigor: ห้ามคล้อยตามโดยอัตโนมัติ นำด้วยสิ่งที่ผิด/ขาด ห้ามคำชมและคำขอโทษ (resources/execution_instructions.md)
- ข้อจำกัดที่ EGM ยอมรับเอง: ขอบเขตการเขียนไฟล์ของขั้นออกแบบเป็นแค่ข้อตกลง ไม่มีอะไรบังคับ
