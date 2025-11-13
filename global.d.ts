declare global {
  // value can be string (legacy name) or an object { id, name } to support id callbacks
  var filterSelectionCallback: ((type: string, value: any) => void) | undefined;
}

export {};
