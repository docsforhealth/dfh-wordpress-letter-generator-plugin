import { renderToString } from '@wordpress/element';

/**
 * Builds a non-base64 encoded data URI for the provided SVG element
 * @param  {SVG element} svgElement SVG element to encode
 * @return {string}                 Non-based64 encoded data URI
 */
export function buildSVGDataURI(svgElement) {
  if (!svgElement) {
    return '';
  }
  // from https://medium.com/@ians/rendering-svgs-as-images-directly-in-react-a26615c45770
  // we use `renderToString` instead of `renderToStaticMarkup` which are broadly similar
  // for the difference between the two, see https://stackoverflow.com/a/67778035
  const svgString = encodeURIComponent(renderToString(svgElement));
  // Don't need to encode in base64, see https://css-tricks.com/probably-dont-base64-svg/
  return `url("data:image/svg+xml,${svgString}")`;
}
