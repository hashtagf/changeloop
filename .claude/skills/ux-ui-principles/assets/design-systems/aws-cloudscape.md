# AWS Cloudscape Design System — OpenDesign Application Guide

A Cloudscape configuration guide with real visual-refresh tokens, density-aware spacing, controlled form APIs, and a working two-step resource wizard.

OpenDesign guide and original local workspace configuration example using native Cloudscape components 3.0.1390. Capacity profiles are fictional application data. No cloud account, provisioning API or actual service pricing is involved.

## Source Reference

- **Native components:** 3.0.1390 ([source](https://cloudscape.design/components/))
- **Token snapshot:** @cloudscape-design/design-tokens 3.0.114 ([source](https://cdn.jsdelivr.net/npm/@cloudscape-design/design-tokens@3.0.114/index-visual-refresh.json))
- **Body medium:** 14px / 20px ([source](https://cdn.jsdelivr.net/npm/@cloudscape-design/design-tokens@3.0.114/index-visual-refresh.json))


## Design Reference

Cloudscape components 3.0.1390 and design-tokens 3.0.114, visual-refresh theme. Values are read from the published token JSON. Color modes and content densities are separate dimensions. This is a selected implementation reference, not the complete token export.

### Semantic color roles in light and dark modes

[Official reference](https://cdn.jsdelivr.net/npm/@cloudscape-design/design-tokens@3.0.114/index-visual-refresh.json)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| color-background-layout-main | light: #ffffff; dark: #161d26 | Use this named role in its intended context; the pair shows light and dark resolutions, not interchangeable swatches. |
| color-background-container-content | light: #ffffff; dark: #161d26 | Use this named role in its intended context; the pair shows light and dark resolutions, not interchangeable swatches. |
| color-text-body-default | light: #0f141a; dark: #c6c6cd | Use this named role in its intended context; the pair shows light and dark resolutions, not interchangeable swatches. |
| color-text-body-secondary | light: #424650; dark: #c6c6cd | Use this named role in its intended context; the pair shows light and dark resolutions, not interchangeable swatches. |
| color-text-interactive-default | light: #424650; dark: #dedee3 | Use this named role in its intended context; the pair shows light and dark resolutions, not interchangeable swatches. |
| color-text-link-default | light: #006ce0; dark: #42b4ff | Use this named role in its intended context; the pair shows light and dark resolutions, not interchangeable swatches. |
| color-text-status-error | light: #db0000; dark: #ff7a7a | Use this named role in its intended context; the pair shows light and dark resolutions, not interchangeable swatches. |
| color-text-status-success | light: #00802f; dark: #2bb534 | Use this named role in its intended context; the pair shows light and dark resolutions, not interchangeable swatches. |
| color-border-input-default | light: #8c8c94; dark: #656871 | Use this named role in its intended context; the pair shows light and dark resolutions, not interchangeable swatches. |
| color-background-button-primary-default | light: #006ce0; dark: #42b4ff | Use this named role in its intended context; the pair shows light and dark resolutions, not interchangeable swatches. |

### Body and heading typography

[Official reference](https://cdn.jsdelivr.net/npm/@cloudscape-design/design-tokens@3.0.114/index-visual-refresh.json)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| font-size-body-m | 14px | Pair font-size and line-height of the same role. Header and Box variants apply the component hierarchy. |
| font-size-body-s | 12px | Pair font-size and line-height of the same role. Header and Box variants apply the component hierarchy. |
| font-size-heading-l | 20px | Pair font-size and line-height of the same role. Header and Box variants apply the component hierarchy. |
| font-size-heading-m | 18px | Pair font-size and line-height of the same role. Header and Box variants apply the component hierarchy. |
| font-size-heading-s | 16px | Pair font-size and line-height of the same role. Header and Box variants apply the component hierarchy. |
| font-size-heading-xl | 24px | Pair font-size and line-height of the same role. Header and Box variants apply the component hierarchy. |
| font-size-heading-xs | 14px | Pair font-size and line-height of the same role. Header and Box variants apply the component hierarchy. |
| line-height-body-m | 20px | Pair font-size and line-height of the same role. Header and Box variants apply the component hierarchy. |
| line-height-body-s | 16px | Pair font-size and line-height of the same role. Header and Box variants apply the component hierarchy. |
| line-height-heading-l | 24px | Pair font-size and line-height of the same role. Header and Box variants apply the component hierarchy. |
| line-height-heading-m | 22px | Pair font-size and line-height of the same role. Header and Box variants apply the component hierarchy. |
| line-height-heading-s | 20px | Pair font-size and line-height of the same role. Header and Box variants apply the component hierarchy. |
| line-height-heading-xl | 30px | Pair font-size and line-height of the same role. Header and Box variants apply the component hierarchy. |
| line-height-heading-xs | 18px | Pair font-size and line-height of the same role. Header and Box variants apply the component hierarchy. |

### Density-aware spacing

[Official reference](https://cdn.jsdelivr.net/npm/@cloudscape-design/design-tokens@3.0.114/index-visual-refresh.json)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| space-scaled-xxxs | comfortable: 2px; compact: 0px | Use the comfortable or compact resolution according to the active density. Do not scale the text with these spacing changes. |
| space-scaled-xxs | comfortable: 4px; compact: 2px | Use the comfortable or compact resolution according to the active density. Do not scale the text with these spacing changes. |
| space-scaled-xs | comfortable: 8px; compact: 4px | Use the comfortable or compact resolution according to the active density. Do not scale the text with these spacing changes. |
| space-scaled-s | comfortable: 12px; compact: 8px | Use the comfortable or compact resolution according to the active density. Do not scale the text with these spacing changes. |
| space-scaled-m | comfortable: 16px; compact: 12px | Use the comfortable or compact resolution according to the active density. Do not scale the text with these spacing changes. |
| space-scaled-l | comfortable: 20px; compact: 16px | Use the comfortable or compact resolution according to the active density. Do not scale the text with these spacing changes. |
| space-scaled-xl | comfortable: 24px; compact: 20px | Use the comfortable or compact resolution according to the active density. Do not scale the text with these spacing changes. |
| space-scaled-xxl | comfortable: 32px; compact: 24px | Use the comfortable or compact resolution according to the active density. Do not scale the text with these spacing changes. |
| space-scaled-xxxl | comfortable: 40px; compact: 32px | Use the comfortable or compact resolution according to the active density. Do not scale the text with these spacing changes. |

### Component shape

[Official reference](https://cdn.jsdelivr.net/npm/@cloudscape-design/design-tokens@3.0.114/index-visual-refresh.json)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| border-radius-container | 16px | Retain the shape of the named component. A button radius is not a universal radius for containers. |
| border-radius-button | 20px | Retain the shape of the named component. A button radius is not a universal radius for containers. |
| border-radius-input | 8px | Retain the shape of the named component. A button radius is not a universal radius for containers. |
| border-radius-alert | 12px | Retain the shape of the named component. A button radius is not a universal radius for containers. |
| border-radius-dropdown | 8px | Retain the shape of the named component. A button radius is not a universal radius for containers. |
| border-radius-card-embedded | 8px | Retain the shape of the named component. A button radius is not a universal radius for containers. |

### Interaction timing

[Official reference](https://cdn.jsdelivr.net/npm/@cloudscape-design/design-tokens@3.0.114/index-visual-refresh.json)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| motion-duration-responsive | default: 115ms; disabled: 0ms | Native motion resolves to zero in disabled motion mode. Avoid adding an unrelated transition to the same interaction. |
| motion-duration-expressive | default: 165ms; disabled: 0ms | Native motion resolves to zero in disabled motion mode. Avoid adding an unrelated transition to the same interaction. |
| motion-duration-complex | default: 250ms; disabled: 0ms | Native motion resolves to zero in disabled motion mode. Avoid adding an unrelated transition to the same interaction. |

### Native composition API

[Official reference](https://cloudscape.design/components/wizard/)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| Wizard | activeStepIndex · onNavigate · onSubmit | Own the current step in React; validate before accepting the requested next index. |
| FormField | label · constraintText · errorText | Place the format rule and invalid feedback with the name input. |
| Input | value · onChange({ detail }) | Read detail.value rather than a DOM event target. |
| Select | selectedOption · options · onChange | Keep the selected option object, including label and value. |
| Container | header={<Header variant="h2" />} | Group related configuration fields without inventing a new card system. |
| ColumnLayout | columns={2} · variant="text-grid" | Display compact review metadata with library-responsive columns. |
| SpaceBetween | size="l" | Use the library gap scale to separate fields and review modules. |
| applyMode | Mode.Light / Mode.Dark | Switch the global visual mode for native components and semantic tokens. |

## AWS Cloudscape Design System Configuration Architecture

### Match the workflow to Wizard

The specimen separates configuration from review. Wizard supplies the step navigation and actions; the application supplies the current index, field values, validation rule and final confirmation. A reader can return to the configuration without rebuilding the form or losing the selected capacity. This is a better fit than hiding an entire multi-step workflow inside a single generic Card.

### Build with native containers

Container, Header and SpaceBetween define the form section. The h1 introduces the operation; h2 names the settings group. Explanatory text appears beside the field or step it describes. The surrounding 1200px maximum width and page padding are explicit application CSS, not exported Cloudscape layout tokens.

## AWS Cloudscape Design System Semantic Tokens and Visual Modes

### Choose a role before a value

The reference distinguishes layout background, container content, body text, interactive text and status feedback. Their values are not a flat palette. For custom UI, import the named token from @cloudscape-design/design-tokens instead of copying a light hex value into every state. The token is an agreement about purpose, while the value can evolve.

### Switch modes through the library

The preview calls applyMode with Mode.Light or Mode.Dark from global-styles. This updates the mode used by components rather than replacing arbitrary CSS colors. A dark review screen retains the same labels, selected capacity and navigation state. The source JSON records both light and dark resolutions, making the distinction inspectable.

## AWS Cloudscape Design System Typography and Header Hierarchy

### Pair the font and line-height roles

The visual-refresh body-m reference is 14px with a 20px line-height. Heading-xl is 24px with 30px line-height, heading-l is 20px with 24px, and heading-m is 18px with 22px. These roles explain the compact form hierarchy; they are not interchangeable marketing display sizes.

### Use semantic component variants

Header variant h1 names Create a workspace. Container headers use h2, and Box variant awsui-key-label gives the review labels a consistent secondary treatment. The review values remain ordinary readable text. Do not increase every field label to a heading just to create more visual weight.

## AWS Cloudscape Design System Controlled Fields and Review Composition

### Understand the detail event contract

Input emits an event whose detail.value contains the new text. Select emits detail.selectedOption, which is an option object rather than a bare string. The full example stores that object and renders its label in review. This avoids a common integration error where a select appears empty because selectedOption is given only an identifier.

### Keep field instructions with the field

FormField owns the Workspace name label, constraint text and error text. The validation rule permits 3–30 lowercase letters, numbers and hyphens, starting with a letter. That rule is sample application policy, not an AWS-wide naming rule. The capacity explanation similarly marks its profiles as fictional.

- Field format policy belongs to this sample application.
- Capacity options are not product or pricing claims.
- The native components handle presentation; React state holds the configuration.

## AWS Cloudscape Design System Density and Responsive Layout

### Do not treat compact mode as a zoom level

The published scaled spacing values differ by density. For example, space-scaled-m is 16px comfortable and 12px compact, while space-scaled-l is 20px and 16px. These differences compress vertical rhythm without redefining the content or arbitrarily shrinking text. Native components apply their own density rules.

### Let the step and review structures adapt

Wizard changes its navigation presentation with available width; ColumnLayout lays out review metadata responsively. Application CSS reduces outer padding below 600px. The specimen does not hardcode the desktop step-navigation width, and its mobile version retains visible Next, Previous and Confirm locally actions.

## AWS Cloudscape Design System Wizard Validation and Confirmation

### Validate before accepting navigation

onNavigate receives requestedStepIndex. The application checks the current name before moving to review and leaves the step unchanged if it is invalid. Editing clears the error so the next submission can be evaluated freshly. Going back to settings preserves the name and selected option.

1. Submit an invalid name and remain on configuration.
2. Correct the name and choose a different capacity profile.
3. Advance to review and confirm both values.
4. Use Edit settings to return without losing either value.
5. Confirm locally and restart the example.

### Differentiate a recipe from provisioning

The final action displays a local success Alert and a configuration summary. It does not pretend to create a real resource. In an actual application, keep the submit action pending while provisioning runs, distinguish accepted requests from completed resources, and expose failure recovery without discarding the configuration.

## AWS Cloudscape Design System Form Accessibility

### Retain labels and navigation names

Wizard receives navigationAriaLabel and translated action strings. Every Input and Select is contained in a labeled FormField. Alert communicates invalid or successful outcomes through native component semantics. The visible constraints supplement the field label rather than replacing it.

### Review the keyboard path through the whole operation

Use the keyboard to reach the name field, open the capacity selector, advance, return, edit and confirm. Native focus behavior helps, but the application still owns the step-validation rule and the meaning of its confirmation. A component library cannot validate a missing business rule on its own.

## AWS Cloudscape Design System Installation and Custom Boundaries

### Install related packages together

The implementation imports components by their individual package subpaths and loads global-styles once. design-tokens provides the custom-style reference. The supplied React entry file and compact CSS file reproduce the interactive specimen in a Vite React application. Keep compatible Cloudscape package versions together.

### Use the provided example as a real starting point

Replace the fictional capacity data only after defining your actual service model. Keep the event contracts and review step intact, then add asynchronous submission and explicit error responses. For any bespoke element, prefer an existing Cloudscape component first; only then introduce a custom element using an appropriate semantic token.

## Component Examples

### main.jsx — complete configuration wizard

Native Wizard, FormField, Select and review metadata with controlled navigation and local confirmation.

```jsx
import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import Wizard from "@cloudscape-design/components/wizard";
import Container from "@cloudscape-design/components/container";
import Header from "@cloudscape-design/components/header";
import FormField from "@cloudscape-design/components/form-field";
import Input from "@cloudscape-design/components/input";
import Select from "@cloudscape-design/components/select";
import SpaceBetween from "@cloudscape-design/components/space-between";
import ColumnLayout from "@cloudscape-design/components/column-layout";
import Box from "@cloudscape-design/components/box";
import Button from "@cloudscape-design/components/button";
import Alert from "@cloudscape-design/components/alert";
import Toggle from "@cloudscape-design/components/toggle";
import { applyMode, Mode } from "@cloudscape-design/global-styles";
import "@cloudscape-design/global-styles/index.css";
import "./cloudscape.css";
const sizes = [
  { label: "Development · 2 vCPU / 4 GiB", value: "dev" },
  { label: "Standard · 4 vCPU / 8 GiB", value: "standard" },
  { label: "Compute · 8 vCPU / 16 GiB", value: "compute" },
];
function App() {
  const [name, setName] = useState("analytics-sandbox"),
    [size, setSize] = useState(sizes[0]),
    [step, setStep] = useState(0),
    [error, setError] = useState(""),
    [complete, setComplete] = useState(false),
    [dark, setDark] = useState(false);
  function next(index) {
    if (index > 0 && !/^[a-z][a-z0-9-]{2,29}$/.test(name)) {
      setError(
        "Use 3–30 lowercase letters, numbers or hyphens, starting with a letter.",
      );
      return;
    }
    setError("");
    setStep(index);
  }
  function reset() {
    setStep(0);
    setComplete(false);
    setError("");
    setName("analytics-sandbox");
    setSize(sizes[0]);
  }
  return (
    <main className="awsui-typography cloudscape-example">
      <div className="appearance">
        <span>CLOUDSCAPE · RESOURCE CONFIGURATION</span>
        <Toggle
          checked={dark}
          onChange={({ detail }) => {
            setDark(detail.checked);
            applyMode(detail.checked ? Mode.Dark : Mode.Light);
          }}
        >
          Dark mode
        </Toggle>
      </div>
      <Header
        variant="h1"
        description="Configure a fictional compute workspace. This example does not create a cloud resource."
      >
        Create a workspace
      </Header>
      <div className="wizard-content">
        {complete ? (
          <SpaceBetween size="l">
            <Alert type="success" header="Configuration confirmed locally">
              The {name} recipe is ready for review. No cloud API was called and
              no resource was provisioned.
            </Alert>
            <Container header={<Header variant="h2">Workspace recipe</Header>}>
              <ColumnLayout columns={2} variant="text-grid">
                <div>
                  <Box variant="awsui-key-label">Name</Box>
                  {name}
                </div>
                <div>
                  <Box variant="awsui-key-label">Capacity</Box>
                  {size.label}
                </div>
              </ColumnLayout>
            </Container>
            <Button onClick={reset}>Start another example</Button>
          </SpaceBetween>
        ) : (
          <Wizard
            activeStepIndex={step}
            onNavigate={({ detail }) => next(detail.requestedStepIndex)}
            onCancel={reset}
            onSubmit={() => setComplete(true)}
            i18nStrings={{
              stepNumberLabel: (stepNumber) => `Step ${stepNumber}`,
              collapsedStepsLabel: (stepNumber, stepsCount) =>
                `Step ${stepNumber} of ${stepsCount}`,
              skipToButtonLabel: (step) => `Skip to ${step.title}`,
              navigationAriaLabel: "Configuration steps",
              cancelButton: "Reset",
              previousButton: "Previous",
              nextButton: "Next",
              submitButton: "Confirm locally",
              optional: "optional",
            }}
            steps={[
              {
                title: "Configure workspace",
                description: "Choose the identity and capacity.",
                content: (
                  <Container
                    header={<Header variant="h2">Workspace settings</Header>}
                  >
                    <SpaceBetween size="l">
                      <FormField
                        label="Workspace name"
                        constraintText="3–30 characters; lowercase letters, numbers and hyphens."
                        errorText={error}
                      >
                        <Input
                          value={name}
                          onChange={({ detail }) => {
                            setName(detail.value);
                            setError("");
                          }}
                        />
                      </FormField>
                      <FormField
                        label="Capacity profile"
                        description="These profiles are sample application data, not real cloud products or prices."
                      >
                        <Select
                          selectedOption={size}
                          onChange={({ detail }) =>
                            setSize(detail.selectedOption)
                          }
                          options={sizes}
                        />
                      </FormField>
                    </SpaceBetween>
                  </Container>
                ),
              },
              {
                title: "Review configuration",
                description:
                  "Check the values before confirming the local example.",
                content: (
                  <SpaceBetween size="l">
                    <Container
                      header={
                        <Header
                          variant="h2"
                          actions={
                            <Button onClick={() => setStep(0)}>
                              Edit settings
                            </Button>
                          }
                        >
                          Workspace settings
                        </Header>
                      }
                    >
                      <ColumnLayout columns={2} variant="text-grid">
                        <div>
                          <Box variant="awsui-key-label">Workspace name</Box>
                          {name}
                        </div>
                        <div>
                          <Box variant="awsui-key-label">Capacity profile</Box>
                          {size.label}
                        </div>
                      </ColumnLayout>
                    </Container>
                    <Alert type="info">
                      Confirmation changes the preview only. Production
                      provisioning would require a real service, permissions and
                      a verified response.
                    </Alert>
                  </SpaceBetween>
                ),
              },
            ]}
          />
        )}
      </div>
      <footer>
        Native Cloudscape components 3.0.1390 · configuration, validation,
        review and local confirmation.
      </footer>
    </main>
  );
}
createRoot(document.getElementById("root")).render(<App />);

```

[Code reference](https://cloudscape.design/components/wizard/)

- Save this as src/main.jsx. The next code block is the imported src/cloudscape.css.

### cloudscape.css — specimen page shell

Application width and padding around native Cloudscape components.

```css
body {
  margin: 0;
}
.cloudscape-example {
  padding: 24px;
  max-width: 1200px;
  margin: auto;
}
.appearance {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 24px;
}
.appearance > span {
  font-size: 11px;
  letter-spacing: 0.06em;
  font-weight: 700;
}
.wizard-content {
  margin-top: 32px;
}
.cloudscape-example footer {
  font-size: 12px;
  margin-top: 32px;
  color: #5f6b7a;
}
@media (max-width: 600px) {
  .cloudscape-example {
    padding: 16px;
  }
  .appearance {
    align-items: start;
  }
  .appearance > span {
    max-width: 180px;
  }
  .wizard-content {
    margin-top: 24px;
  }
}

```

[Code reference](https://cloudscape.design/foundation/visual-foundation/layout/)

- Do not override native component class names with this application stylesheet.

## Implementation Starting Point

The displayed native example was bundled with React 18.3.1. Use a Node.js version supported by the Vite release you install; retain the versions used by your application lockfile.

```sh
npm create vite@latest cloudscape-workspace -- --template react
cd cloudscape-workspace
npm install
npm install react@18.3.1 react-dom@18.3.1 @cloudscape-design/components@3.0.1390 @cloudscape-design/design-tokens@3.0.114 @cloudscape-design/global-styles
# Replace src/main.jsx and add src/cloudscape.css from the full examples.
npm run dev
```

## Agent Prompt

Build a resource configuration workflow with Cloudscape. Use the supplied native Wizard/Container/FormField/Input/Select code and visual-refresh token roles. Preserve field values between steps, validate before navigation, and show a complete review. Treat sample capacity profiles as placeholders for my domain model, not real cloud products. Integrate provisioning only after an API is supplied; distinguish pending, failure and confirmed results.

## Sources

- [Wizard Component](https://cloudscape.design/components/wizard/) — Step navigation, actions and component API.
- [Published Token JSON](https://cdn.jsdelivr.net/npm/@cloudscape-design/design-tokens@3.0.114/index-visual-refresh.json) — Versioned light/dark and comfortable/compact values.
- [Design Token Usage](https://cloudscape.design/foundation/visual-foundation/design-tokens/) — Semantic naming, imports and custom component guidance.
- [Component Repository](https://github.com/cloudscape-design/components) — Native source and Apache license.
