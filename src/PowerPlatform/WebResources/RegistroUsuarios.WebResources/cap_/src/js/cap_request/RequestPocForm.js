globalThis.RegistroUsuarios = globalThis.RegistroUsuarios || {};
globalThis.RegistroUsuarios.RequestPocForm = (function () {
  "use strict";

  const HIGH_PRIORITY = 767940002;
  const NOTIFICATION_ID = "registro-usuarios-request-poc-description";
  const MESSAGE = "La descripcion es obligatoria para prioridad Alta.";

  function getDescriptionRule(priority, description) {
    const required = priority === HIGH_PRIORITY;
    return {
      required,
      invalid: required && (description == null || description.trim() === ""),
    };
  }

  function evaluate(formContext) {
    const priority = formContext.getAttribute("cap_priority");
    const description = formContext.getAttribute("cap_description");
    const rule = getDescriptionRule(priority?.getValue(), description?.getValue());

    description?.setRequiredLevel(rule.required ? "required" : "none");
    if (rule.invalid) {
      formContext.ui.setFormNotification(MESSAGE, "ERROR", NOTIFICATION_ID);
    } else {
      formContext.ui.clearFormNotification(NOTIFICATION_ID);
    }
    return rule;
  }

  function onChangePriority(executionContext) {
    evaluate(executionContext.getFormContext());
  }

  function onChangeDescription(executionContext) {
    evaluate(executionContext.getFormContext());
  }

  function onSave(executionContext) {
    if (evaluate(executionContext.getFormContext()).invalid) {
      executionContext.getEventArgs().preventDefault();
    }
  }

  function onLoad(executionContext) {
    const formContext = executionContext.getFormContext();
    const priority = formContext.getAttribute("cap_priority");
    const description = formContext.getAttribute("cap_description");
    const entity = formContext.data.entity;

    priority?.removeOnChange(onChangePriority);
    priority?.addOnChange(onChangePriority);
    description?.removeOnChange(onChangeDescription);
    description?.addOnChange(onChangeDescription);
    entity.removeOnSave(onSave);
    entity.addOnSave(onSave);
    evaluate(formContext);
  }

  return { onLoad };
})();
