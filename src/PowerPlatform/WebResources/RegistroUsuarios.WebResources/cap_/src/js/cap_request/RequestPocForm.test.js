import { existsSync, readFileSync } from "node:fs";
import { URL } from "node:url";
import { createContext, runInContext } from "node:vm";
import { describe, expect, it, vi } from "vitest";

const resourceUrl = new URL("./RequestPocForm.js", import.meta.url);
const LOW = 767940000;
const MEDIUM = 767940001;
const HIGH = 767940002;
const MESSAGE = "La descripcion es obligatoria para prioridad Alta.";
const PADDED_TEXT = " \tSolicitud sintetica\n ";
const UNRELATED_ID = "unrelated-notification";
const UNRELATED_NOTIFICATION = { message: "Otra regla.", level: "INFO" };

function createEvent() {
  let handlers = [];
  return {
    // Keep duplicates: a Set would conceal faulty repeated-load registration.
    add: vi.fn((handler) => handlers.push(handler)),
    remove: vi.fn((handler) => {
      handlers = handlers.filter((registered) => registered !== handler);
    }),
    fire: (context) => [...handlers].forEach((handler) => handler(context)),
    count: () => handlers.length,
  };
}

function createAttribute(initialValue) {
  let value = initialValue;
  const change = createEvent();
  return {
    change,
    getValue: vi.fn(() => value),
    // Client API setValue does not automatically raise OnChange.
    setValue: vi.fn((nextValue) => { value = nextValue; }),
    setRequiredLevel: vi.fn(),
    addOnChange: change.add,
    removeOnChange: change.remove,
  };
}

function createForm(priorityValue, descriptionValue, missingAttribute) {
  const priority = createAttribute(priorityValue);
  const description = createAttribute(descriptionValue);
  const save = createEvent();
  const notifications = new Map([[UNRELATED_ID, UNRELATED_NOTIFICATION]]);
  const attributes = {
    cap_priority: priority,
    cap_description: description,
  };
  if (missingAttribute) delete attributes[missingAttribute];

  const formContext = {
    getAttribute: vi.fn((name) => attributes[name] ?? null),
    data: { entity: { addOnSave: save.add, removeOnSave: save.remove } },
    ui: {
      setFormNotification: vi.fn((message, level, id) => {
        notifications.set(id, { message, level });
        return true;
      }),
      clearFormNotification: vi.fn((id) => notifications.delete(id)),
    },
  };
  const executionContext = { getFormContext: () => formContext };
  priority.fireOnChange = () => priority.change.fire(executionContext);
  description.fireOnChange = () => description.change.fire(executionContext);

  return {
    priority,
    description,
    save,
    notifications,
    formContext,
    executionContext,
    /** Fires the captured save handlers without awaiting asynchronous work. */
    fireSave(mode) {
      const args = {
        getSaveMode: vi.fn(() => mode),
        preventDefault: vi.fn(),
      };
      save.fire({ ...executionContext, getEventArgs: () => args });
      return args;
    },
  };
}

function loadResource(form) {
  const sandbox = createContext({});
  // Missing production must fail a public-behavior assertion, not file loading.
  const source = existsSync(resourceUrl) ? readFileSync(resourceUrl, "utf8") : "";
  runInContext(source, sandbox, { filename: "RequestPocForm.js" });
  const api = sandbox.RegistroUsuarios?.RequestPocForm;
  expect(
    typeof api?.onLoad,
    "Required public API globalThis.RegistroUsuarios.RequestPocForm.onLoad is absent",
  ).toBe("function");
  expect(Object.keys(api)).toEqual(["onLoad"]);
  api.onLoad(form.executionContext);
  return api;
}

function expectNamedRegistrations(form) {
  for (const event of [form.priority.change, form.description.change, form.save]) {
    expect(event.count()).toBe(1);
    for (const [handler] of [...event.add.mock.calls, ...event.remove.mock.calls]) {
      expect(typeof handler).toBe("function");
      expect(handler.name).not.toBe("");
    }
  }
}

function expectInvalid(form) {
  expect(form.description.setRequiredLevel).toHaveBeenLastCalledWith("required");
  const call = form.formContext.ui.setFormNotification.mock.lastCall;
  expect(call).toBeDefined();
  const [message, level, ownId] = call;
  expect(message).toBe(MESSAGE);
  expect(level).toBe("ERROR");
  expect(typeof ownId).toBe("string");
  expect(ownId.length).toBeGreaterThan(0);
  expect(ownId).not.toBe(UNRELATED_ID);
  expect(form.notifications.get(ownId)).toEqual({ message: MESSAGE, level: "ERROR" });
  expect(form.notifications.get(UNRELATED_ID)).toEqual(UNRELATED_NOTIFICATION);
  return ownId;
}

function expectValid(form, requiredLevel, ownId) {
  expect(form.description.setRequiredLevel).toHaveBeenLastCalledWith(requiredLevel);
  expect([...form.notifications.entries()]).toEqual([
    [UNRELATED_ID, UNRELATED_NOTIFICATION],
  ]);
  if (ownId !== undefined) {
    expect(form.formContext.ui.clearFormNotification).toHaveBeenCalledWith(ownId);
    expect(form.formContext.ui.clearFormNotification.mock.calls.every(
      ([id]) => id === ownId,
    )).toBe(true);
  }
  expect(form.formContext.ui.clearFormNotification).not.toHaveBeenCalledWith(UNRELATED_ID);
}

function expectTextUntouched(form, text) {
  expect(form.description.getValue()).toBe(text);
  expect(form.description.setValue).not.toHaveBeenCalled();
  expect(form.priority.setValue).not.toHaveBeenCalled();
}

function changeValuesWithoutEvents(form, priority, description) {
  form.priority.setValue(priority);
  form.description.setValue(description);
  form.priority.setValue.mockClear();
  form.description.setValue.mockClear();
}

describe("RegistroUsuarios.RequestPocForm public event behavior", () => {
  it.each([
    ["Low empty", LOW, null, "none"],
    ["Low padded", LOW, PADDED_TEXT, "none"],
    ["Medium empty", MEDIUM, null, "none"],
    ["Medium padded", MEDIUM, PADDED_TEXT, "none"],
    ["High padded", HIGH, PADDED_TEXT, "required"],
  ])("WhenLoading%s_ThenValidStatePreservesText", (_label, priority, text, required) => {
    const form = createForm(priority, text);

    loadResource(form);

    expectNamedRegistrations(form);
    expectValid(form, required);
    expectTextUntouched(form, text);
  });

  it.each([
    ["null", null],
    ["empty", ""],
    ["spaces", "   "],
    ["tabs", "\t\t"],
    ["newline", "\n"],
    ["mixed whitespace", " \t\n "],
  ])("WhenLoadingHighWith%s_ThenRequiredAndError", (_label, text) => {
    const form = createForm(HIGH, text);

    loadResource(form);

    expectInvalid(form);
    expectTextUntouched(form, text);
  });

  it("WhenDescriptionIsCorrectedThenEmptied_ThenCurrentStateAndSaveBlockingFollow", () => {
    const form = createForm(HIGH, null);
    loadResource(form);
    const ownId = expectInvalid(form);

    changeValuesWithoutEvents(form, HIGH, PADDED_TEXT);
    form.description.fireOnChange();

    expectValid(form, "required", ownId);
    expect(form.fireSave(1).preventDefault).not.toHaveBeenCalled();
    expectTextUntouched(form, PADDED_TEXT);

    changeValuesWithoutEvents(form, HIGH, "");
    form.description.fireOnChange();

    expect(expectInvalid(form)).toBe(ownId);
    expect(form.fireSave(1).preventDefault).toHaveBeenCalledTimes(1);
    expectTextUntouched(form, "");
  });

  it.each([["Low", LOW], ["Medium", MEDIUM]])(
    "WhenPriorityChangesTo%sAndBack_ThenOnlyOwnNotificationClearsAndTextIsPreserved",
    (_label, optionalPriority) => {
      const form = createForm(HIGH, " \t\n ");
      loadResource(form);
      const ownId = expectInvalid(form);

      changeValuesWithoutEvents(form, optionalPriority, " \t\n ");
      form.priority.fireOnChange();

      expectValid(form, "none", ownId);
      expect(form.fireSave(1).preventDefault).not.toHaveBeenCalled();
      expectTextUntouched(form, " \t\n ");

      changeValuesWithoutEvents(form, HIGH, " \t\n ");
      form.priority.fireOnChange();
      expect(expectInvalid(form)).toBe(ownId);

      changeValuesWithoutEvents(form, HIGH, PADDED_TEXT);
      form.description.fireOnChange();
      changeValuesWithoutEvents(form, optionalPriority, PADDED_TEXT);
      form.priority.fireOnChange();

      expectValid(form, "none", ownId);
      expectTextUntouched(form, PADDED_TEXT);
    },
  );

  describe.each([["explicit", 1], ["AutoSave", 70]])("%s save mode %s", (_label, mode) => {
    it.each([
      ["null", null],
      ["empty", ""],
      ["whitespace", " \t\n "],
    ])("WhenHighBecomes%sWithoutChangeEvent_ThenSaveIsSynchronouslyCancelled", (_kind, text) => {
      const form = createForm(MEDIUM, PADDED_TEXT);
      loadResource(form);
      expectValid(form, "none");
      changeValuesWithoutEvents(form, HIGH, text);

      const args = form.fireSave(mode);

      // Assert immediately: cancellation deferred to a promise is too late.
      expect(args.preventDefault).toHaveBeenCalledTimes(1);
      expectInvalid(form);
      expectTextUntouched(form, text);
    });

    it.each([
      ["High valid", HIGH, PADDED_TEXT, "required"],
      ["Low empty", LOW, null, "none"],
      ["Medium empty", MEDIUM, null, "none"],
    ])("WhenValuesBecome%sWithoutChangeEvent_ThenSaveAllowsCurrentValues", (_kind, priority, text, required) => {
      const form = createForm(HIGH, null);
      loadResource(form);
      const ownId = expectInvalid(form);
      changeValuesWithoutEvents(form, priority, text);

      const args = form.fireSave(mode);

      expect(args.preventDefault).not.toHaveBeenCalled();
      expectValid(form, required, ownId);
      expectTextUntouched(form, text);
    });
  });

  it.each([2, 59])("WhenHighIsInvalidInSaveMode%s_ThenCancellationDoesNotDependOnMode", (mode) => {
    const form = createForm(HIGH, " \t\n ");
    loadResource(form);

    const args = form.fireSave(mode);

    expect(args.preventDefault).toHaveBeenCalledTimes(1);
    expectInvalid(form);
  });

  it("WhenOnLoadRepeats_ThenNamedHandlersProduceOneEffectPerEvent", () => {
    const form = createForm(HIGH, null);
    const api = loadResource(form);
    const ownId = expectInvalid(form);

    api.onLoad(form.executionContext);
    api.onLoad(form.executionContext);

    expectNamedRegistrations(form);
    for (const fire of [
      () => form.priority.fireOnChange(),
      () => form.description.fireOnChange(),
      () => {
        expect(form.fireSave(70).preventDefault).toHaveBeenCalledTimes(1);
      },
    ]) {
      form.description.setRequiredLevel.mockClear();
      form.formContext.ui.setFormNotification.mockClear();

      fire();

      expect(form.description.setRequiredLevel).toHaveBeenCalledTimes(1);
      expect(form.formContext.ui.setFormNotification).toHaveBeenCalledTimes(1);
      expect(expectInvalid(form)).toBe(ownId);
    }
  });

  it.each(["cap_priority", "cap_description"])(
    "WhenAttribute%sIsMissing_ThenLoadAndRemainingEventsAreSafe",
    (missingAttribute) => {
      const form = createForm(MEDIUM, null, missingAttribute);

      loadResource(form);
      expect(() => form.priority.fireOnChange()).not.toThrow();
      expect(() => form.description.fireOnChange()).not.toThrow();
      expect(() => form.fireSave(1)).not.toThrow();
    },
  );
});
