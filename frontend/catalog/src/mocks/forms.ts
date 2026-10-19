// FormData bodies are handed to the handlers by reference instead of being
// serialized into the Request: a Request built in one realm (e.g. Node's)
// can't read another realm's FormData (e.g. jsdom's in component tests).
export const FORM_HEADER = "x-mock-form";

const forms = new Map<string, FormData>();
let nextFormId = 0;

export function stashForm(form: FormData): string {
  const id = String(++nextFormId);
  forms.set(id, form);
  return id;
}

export async function readForm(request: Request): Promise<FormData> {
  const id = request.headers.get(FORM_HEADER);
  const form = id ? forms.get(id) : undefined;
  if (id && form) {
    forms.delete(id);
    return form;
  }
  return request.formData();
}
