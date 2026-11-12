// Shared issue and Markdown helpers for the validation/*-fields.mjs registries.
// Issue text is part of the draft-validation contract: keep messages unchanged.
import { isObject } from "../../core/values.mjs";

export { isObject };

export function localized(labels) {
  return (language) => language === "th" ? labels.th : labels.en;
}

export function present(value) {
  if (value === undefined || value === null) return false;
  if (typeof value === "string") return value.trim() !== "";
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === "object") return Object.keys(value).length > 0;
  return true;
}

export function text(value) {
  if (Array.isArray(value)) return value.map(text).filter(Boolean).join("; ");
  if (isObject(value)) {
    return Object.entries(value).filter(([, item]) => present(item))
      .map(([key, item]) => `${key}: ${text(item)}`).join(", ");
  }
  return String(value ?? "").trim();
}

export function cell(value) {
  return text(value).replace(/\r?\n/g, " ").replaceAll("|", "\\|") || "—";
}

export function table(headers, rows) {
  return `| ${headers.join(" | ")} |\n|${headers.map(() => "---").join("|")}|\n` +
    rows.map((row) => `| ${row.map(cell).join(" | ")} |`).join("\n");
}

export function requireFields(row, path, fields, issues) {
  for (const field of fields) {
    if (!present(row[field])) issues.push(`${path}.${field} is required`);
  }
}

export function stringList(value, path, issues, { nonEmpty = false } = {}) {
  if (value === undefined || value === null) {
    if (nonEmpty) issues.push(`${path} is required`);
    return;
  }
  if (!Array.isArray(value)) {
    issues.push(`${path} must be a list of strings`);
    return;
  }
  if (nonEmpty && value.length === 0) issues.push(`${path} must not be empty`);
  value.forEach((item, index) => {
    if (typeof item !== "string" || item.trim() === "") {
      issues.push(`${path}[${index}] must be a non-empty string`);
    }
  });
}

export function objectList(value, path, issues) {
  if (value === undefined || value === null) return [];
  if (!Array.isArray(value)) {
    issues.push(`${path} must be a list`);
    return [];
  }
  return value.map((row, index) => {
    if (!isObject(row)) issues.push(`${path}[${index}] must be an object`);
    return isObject(row) ? [row, `${path}[${index}]`] : null;
  }).filter(Boolean);
}
