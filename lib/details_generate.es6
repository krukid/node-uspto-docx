import documentGenerate from './document_generate';

// TODO
// iterate all /output/details/*.json, check if /output/forms/sn.doc exists,
// if not `await documentGenerate(sn)`

export default function detailsGenerate() {
  documentGenerate('123');
  documentGenerate('bar');
  documentGenerate('baz');
}
