# Feature map guide

The feature map names what users of this project meet, so a request such as
"the checkout fails" points at the same code for a person and an agent. It is
not an architecture diagram and not a module list.

## Choose features

- Name each feature as a user would: "Checkout", "Profile page", "Weekly report
  email". Avoid internal names ("OrderService", "utils").
- Aim for 5–20 features. Fewer than five usually hides real boundaries; more
  than twenty usually lists screens instead of features.
- One feature may span folders; one folder may serve several features. Paths are
  where the feature's code lives, not a partition of the repository.
- Leave out shared infrastructure (logging, build scripts, config) unless users
  meet it directly. Every changed file need not belong to a feature.

## Shape

`openspec/feature-map.json`:

```json
{
  "version": 1,
  "features": [
    {
      "id": "checkout",
      "name": "Checkout",
      "summary": "Pay for the items in the cart and receive a receipt",
      "paths": ["src/checkout/**", "src/payments/charge.ts"],
      "tests": ["test/checkout.test.ts"],
      "docs": ["docs/checkout.md"]
    }
  ]
}
```

- `id`: kebab-case and stable; renaming an id breaks history, so prefer
  changing `name`.
- `summary`: what the user sees or does, one sentence.
- `paths`: files or globs; each literal path must exist.
- `tests`, `docs`: optional; each listed file must exist.

## Check

`cloop features --strict` fails on duplicate ids, missing names or summaries,
and paths that do not exist. `cloop features --change <id>` names the features
a change touches; the approval page lists them.

## Keep it current

Update the map in the same change that adds, renames, or removes a feature.
The map is project-owned: Change Loop seeded it once and never rewrites it.
