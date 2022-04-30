import { renderToString } from '@wordpress/element';
import { insert, remove } from '@wordpress/rich-text';
import { fill, find, startsWith } from 'lodash';
import * as Constants from 'src/js/constants';

/**
 * Mark attribute as hidden in the REST API
 *
 * @param  {String} attrName Name of the attribute to mark
 * @return {String}          Marked name of the attribute
 */
export function markAttrHiddenInApi(attrName) {
  return `${Constants.ATTR_HIDE_API_PREFIX}${attrName}`;
}

/**
 * Checks to see if attribute should be shown in the REST API
 *
 * @param  {String} attrNameToCheck Name of the attribute to check
 * @return {boolean}                Whether or not the attribute should be shown
 */
export function shouldShowAttrInApi(attrNameToCheck) {
  return startsWith(attrNameToCheck, Constants.ATTR_HIDE_API_PREFIX);
}

/**
 * Builds a non-base64 encoded data URI for the provided SVG element
 *
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

/**
 * Find boundaries of the selected format
 * Directly borrowed from the WordPress RichText `removeFormat` method
 * source: https://github.com/WordPress/gutenberg/blob/trunk/packages/rich-text/src/remove-format.js
 *
 * @param  {WPRichTextValue} value WordPress RichTextValue object
 *                                 see https://github.com/WordPress/gutenberg/tree/trunk/packages/rich-text#the-richtextvalue-object
 * @param  {String} type           Registered name of the custom format to look for
 * @return {Object}                Object with found `startIndex` and `endIndex` bounds and the
 *                                 heler boolean `isFormatFound`
 */
export function getFormatBounds(value, type) {
  const newFormats = value.formats.slice();
  let startIndex = value.start,
    endIndex = value.end,
    format = find(newFormats[startIndex], { type });
  // LOCAL MODIFICATION: custom format `isActive` is triggered ONE index value PAST the actual
  // recorded end of the format. For example, format indices are from 10 to 15 but custom format
  // is actived on index 16. Therefore, if no format is found on the first try, try one more tiem to
  // look one index value prior before giving up.
  if (!format) {
    format = find(newFormats[startIndex - 1], { type });
    // if format is found this second attempt, then modify the indices
    if (format) {
      startIndex -= 1;
      endIndex -= 1;
    }
  }
  // If the format is finally found, then find the bounds else return initial indices
  if (format) {
    while (find(newFormats[startIndex], format)) {
      filterFormats(newFormats, startIndex, Constants.FORMAT_DATA_ELEMENT);
      startIndex--;
    }
    endIndex++;
    while (find(newFormats[endIndex], format)) {
      filterFormats(newFormats, endIndex, Constants.FORMAT_DATA_ELEMENT);
      endIndex++;
    }
    // LOCAL MODIFICATION: `startIndex + 1` modifier to not remove the letter right before the badge
    return { isFormatFound: true, startIndex: startIndex + 1, endIndex };
  } else {
    // don't apply modifier if no format found
    return { isFormatFound: false, startIndex, endIndex };
  }
}
function filterFormats(formats, index, formatType) {
  const newFormats = formats[index].filter(({ type }) => type !== formatType);
  if (newFormats.length) {
    formats[index] = newFormats;
  } else {
    delete formats[index];
  }
}

/**
 * Ensures that the text content of the specific format matches the provided origial text
 * Does not make any changes if the specified custom format type is not found
 * NOTE assumes that no other formats or format objects (called replacements) are present!
 *
 * @param  {function} onChange     Function provided by custom format for making changes
 * @param  {WPRichTextValue} value Internal WordPress RichTextValue object
 * @param  {String} type           String type for registered custom format
 * @param  {String} originalText   Original text to enforce
 */
export function tryEnsureFormatText(onChange, value, type, originalText) {
  const { isFormatFound, startIndex, endIndex } = getFormatBounds(value, type);
  const originalTextLength = originalText?.length;
  // only update format text if (1) format has been found from the value and (2) the original length
  // doesn't match the detected length
  if (isFormatFound && originalTextLength !== endIndex - startIndex) {
    onChange(
      // see https://github.com/WordPress/gutenberg/blob/trunk/packages/rich-text/src/insert.js
      insert(
        value,
        // for an example of how to create own value, see `insertObject` helper function
        // `insertObject` source: https://github.com/WordPress/gutenberg/blob/trunk/packages/rich-text/src/insert-object.js
        {
          formats: fill(Array(originalTextLength), value.formats[startIndex]),
          replacements: Array(originalTextLength),
          text: originalText,
        },
        startIndex,
        endIndex,
      ),
    );
  }
}

/**
 * Attempts to remove the specified format from the text, if found. Note that this function does
 * not account for other inserted formats or format objects and will remove all content within the
 * bounds of the specified format, if found.
 *
 * @param  {function} onChange     Function provided by custom format for making changes
 * @param  {WPRichTextValue} value Internal WordPress RichTextValue object
 * @param  {String} type           String type for registered custom format
 */
export function tryRemoveFormat(onChange, value, type) {
  const { isFormatFound, startIndex, endIndex } = getFormatBounds(value, type);
  if (isFormatFound) {
    onChange(remove(value, startIndex, endIndex));
  }
}
