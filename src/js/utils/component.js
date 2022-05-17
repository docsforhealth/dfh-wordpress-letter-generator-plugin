import { renderToString } from '@wordpress/element';
import { isFunction, memoize } from 'lodash';
import camelCase from 'lodash.camelcase';

/**
 * Builds a non-base64 encoded data URI for the provided SVG element
 * @param  {SVG element} svgElement SVG element to encode
 * @return {string}                 Non-based64 encoded data URI
 */
export const buildSVGDataURI = memoize((svgElement) => {
  if (!svgElement) {
    return '';
  }
  // from https://medium.com/@ians/rendering-svgs-as-images-directly-in-react-a26615c45770
  // we use `renderToString` instead of `renderToStaticMarkup` which are broadly similar
  // for the difference between the two, see https://stackoverflow.com/a/67778035
  const svgString = encodeURIComponent(renderToString(svgElement));
  // Don't need to encode in base64, see https://css-tricks.com/probably-dont-base64-svg/
  return `url("data:image/svg+xml,${svgString}")`;
});

/**
 * If a function, passes `props` to the `children` function per the "render props" pattern
 * @param  {Array|Function} children Either function or array of React element children
 * @param  {Object} props            Props to pass if `children` is a function
 * @return {Node}                    Renderable output
 */
export function tryChildrenAsFunction(children, props) {
  return isFunction(children) ? children(props) : children;
}

/**
 * Converts data attributes to JS properties
 * HTML data-* attributes are dasherized but are camelCased when accessed via JS
 * @param  {String} dataAttributeName Dasherized data attribute name
 * @return {String}                   Data property name
 */
export const dataAttributeToProperty = memoize((dataAttributeName) => {
  // `slice` to remove the beginning `data-` from attribute name
  return dataAttributeName ? camelCase(dataAttributeName.slice(5)) : '';
});
