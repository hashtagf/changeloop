# Marketing and public services

Original illustrative layouts for adaptation, not validated production designs.
Read [the selection guide](index.md) before choosing a pattern. Boxes indicate
content groups and priority, not fixed pixel geometry or implementation components.
Use [the shared specification](specification.md) for accessibility, states and tokens.

## M01: Product landing

**Task:** Explain one product and invite a meaningful next step.

**Wide layout:**

```text
Hero: promise + primary action | Product evidence
Benefits grouped by task | How it works
Pricing or next step | FAQ | Footer
```

**Visual anchors:** Hero = composed product scene; benefits = bento with one
large working fragment and icon tiles; how it works = SVG process diagram with
icon nodes; next step = interactive estimate or pricing fragment; FAQ and form
may be text-led. See [visual-assets](../../references/visual-assets.md) §4.

**Compact behavior:** Stack promise/action before media; keep evidence readable.

**Applicable states:** Loading media; unavailable offer; form error; submission result.

**Avoid / adapt:** Do not use when users need a dense workspace or many equal destinations.

**Acceptance example:** Check visitors can explain the offer, audience and next step; disclose material costs.

**Customize:** Substitute real content, labels and permission rules; apply existing
tokens and the actual data model. Record why this structure serves the user task.

## M02: Service overview

**Task:** Help people decide whether a service fits their situation.

**Wide layout:**

```text
Service purpose | Eligibility and prerequisites
Steps + required documents | Start action
Alternative help channel | Related services
```

**Compact behavior:** Put eligibility and required preparation before Start.

**Applicable states:** Eligible/ineligible; service unavailable; assisted route.

**Avoid / adapt:** Avoid promotional ambiguity when eligibility controls access.

**Acceptance example:** Check people can judge suitability and preparation before starting.

**Customize:** Substitute real content, labels and permission rules; apply existing
tokens and the actual data model. Record why this structure serves the user task.

## M03: Pricing comparison

**Task:** Compare plans using meaningful differences.

**Wide layout:**

```text
Plan summary | Billing period control
Aligned feature comparison | Price + selection
Limits, fees and renewal | FAQ
```

**Compact behavior:** Use stacked plans plus a comparison view; repeat row labels.

**Applicable states:** Monthly/yearly; unavailable plan; upgrade; existing subscription.

**Avoid / adapt:** Avoid when prices depend on a complex quote; expose that process instead.

**Acceptance example:** Check total price, billing unit, renewal and limits are understood before selecting.

**Customize:** Substitute real content, labels and permission rules; apply existing
tokens and the actual data model. Record why this structure serves the user task.

### M03 additions (from the OpenDesign template study)
- Tier shape: 3 tiers by default; 2 for individual vs business; 4 only for "scale / enterprise plus". Mark the recommended tier once (accent border or small badge), nowhere else.
- Comparison table groups rows into 2 to 3 sections (core, collaboration, support, security), sticky header, stacks or scrolls below 768px; every row is something the product really offers.
- FAQ: 4 to 6 items with `<details><summary>`, no script needed. Prices are plausible for the product, never "$X / month".

## M04: Campaign landing

**Task:** Connect a specific entry message to one focused action.

**Wide layout:**

```text
Campaign promise | Relevant evidence
Offer details | Short lead form
Consent context | Result and next step
```

**Compact behavior:** Keep entry-message match and form near the main explanation.

**Applicable states:** Expired campaign; field error; pending; confirmation.

**Avoid / adapt:** Avoid invented urgency and unsubstantiated proof.

**Acceptance example:** Check offer consistency from entry to page and retained inputs on error.

**Customize:** Substitute real content, labels and permission rules; apply existing
tokens and the actual data model. Record why this structure serves the user task.

## M05: Help or contact hub

**Task:** Route people to suitable self-service or human support.

**Wide layout:**

```text
Describe the problem | Search help
Topic routes | Contact options + hours
Existing request status | Accessibility help
```

**Compact behavior:** Stack routes; make urgent applicable routes discoverable.

**Applicable states:** No result; unavailable channel; submitted request; response expectation.

**Avoid / adapt:** Avoid using topic lists to hide the contact option users need.

**Acceptance example:** Check users choose a useful route and understand when to expect a response.

**Customize:** Substitute real content, labels and permission rules; apply existing
tokens and the actual data model. Record why this structure serves the user task.
