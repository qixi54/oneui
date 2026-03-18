import { describe, expect, it } from "vitest";
import { DEFAULT_TABLE_SCHEMA, isFormulaField, isSelectField, type FieldDef } from "../types";

function isValidFieldDef(field: FieldDef): boolean {
  switch (field.type) {
    case "text":
    case "checkbox":
    case "user":
    case "attachment":
      return true;
    case "number":
      return field.min === undefined || field.max === undefined || field.min <= field.max;
    case "select":
    case "multi_select":
      return Array.isArray(field.options);
    case "date":
    case "datetime":
    case "url":
    case "email":
    case "phone":
      return true;
    case "rating":
      return field.max === undefined || field.max > 0;
    case "relation":
      return field.targetTableId === undefined || typeof field.targetTableId === "string";
    case "formula":
      return typeof field.formula === "string";
    case "currency":
      return true;
    case "richtext":
    case "auto_number":
    case "creator":
    case "progress":
      return true;
    default: {
      const exhaustive: never = field;
      return exhaustive;
    }
  }
}

describe("FieldDef", () => {
  it("isSelectField 对 select/multi_select 返回 true，对 text 返回 false", () => {
    const selectField: FieldDef = {
      id: "status",
      name: "状态",
      type: "select",
      options: [],
    };
    const multiSelectField: FieldDef = {
      id: "tags",
      name: "标签",
      type: "multi_select",
      options: [],
    };
    const textField: FieldDef = {
      id: "title",
      name: "标题",
      type: "text",
    };

    expect(isSelectField(selectField)).toBe(true);
    expect(isSelectField(multiSelectField)).toBe(true);
    expect(isSelectField(textField)).toBe(false);
  });

  it("isFormulaField 对 formula 返回 true", () => {
    const formulaField: FieldDef = {
      id: "score",
      name: "评分公式",
      type: "formula",
      formula: "{a}+{b}",
    };

    expect(isFormulaField(formulaField)).toBe(true);
  });

  it("DEFAULT_TABLE_SCHEMA 的 fields 满足 FieldDef 联合类型", () => {
    const schemaFields: FieldDef[] = DEFAULT_TABLE_SCHEMA.fields;

    expect(schemaFields).toHaveLength(DEFAULT_TABLE_SCHEMA.fields.length);
    expect(schemaFields.length).toBeGreaterThan(0);

    for (const field of schemaFields) {
      expect(field.id).toBeTruthy();
      expect(field.name).toBeTruthy();
      expect(typeof field.type).toBe("string");
      expect(isValidFieldDef(field)).toBe(true);
    }
  });
});
