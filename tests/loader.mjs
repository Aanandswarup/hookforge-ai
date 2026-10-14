export async function resolve(specifier, context, nextResolve) {
  if (specifier === 'jspdf') {
    return {
      format: 'module',
      shortCircuit: true,
      url: new URL('./helpers/jspdfMock.mjs', import.meta.url).href,
    };
  }
  return nextResolve(specifier, context);
}
