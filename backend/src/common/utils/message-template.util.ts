type ReminderTemplateValues = {
  clinicName: string;
  dueDate: string;
  followUpDays: string;
  patientName: string;
  patientPhone: string;
  visitDate: string;
};

export function renderReminderTemplate(
  template: string,
  values: ReminderTemplateValues,
) {
  return template.replace(
    /{{\s*(\w+)\s*}}/g,
    (_, token: keyof ReminderTemplateValues) => {
      return values[token] ?? '';
    },
  );
}
