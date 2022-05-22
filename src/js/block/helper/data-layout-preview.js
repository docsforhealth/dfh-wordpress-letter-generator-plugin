import { useBlockProps } from '@wordpress/block-editor';
import { createBlock } from '@wordpress/blocks';
import { useContext, useEffect } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { Icon, preformatted } from '@wordpress/icons';
import { debounce, find } from 'lodash';
import { LetterContentContext } from 'src/js/block/letter-template';
import HelpLabel from 'src/js/component/help-label';
import * as Constants from 'src/js/constants';
import {
  LABEL_SHARED_OPTION,
  OPTION_BLOCK_NAME,
  OPTION_DATA_KEY,
  OPTION_IS_SHARED,
  OPTION_LABEL,
} from 'src/js/constants/data-element';
import {
  API_CONFIG_IGNORED_ATTRIBUTES,
  markAttrHiddenInApi,
} from 'src/js/utils/api';
import {
  getIconFromBlockName,
  getTitleFromBlockName,
  tryRegisterBlockType,
} from 'src/js/utils/block';
import { parseOptionIsShared } from 'src/js/utils/data-element';

const ATTR_LINKED_DATA_BLOCK_NAME = markAttrHiddenInApi('linkedDataBlockName'),
  ATTR_LINKED_DATA_LABEL = markAttrHiddenInApi('linkedDataLabel'),
  ATTR_LINKED_DATA_IS_SHARED = markAttrHiddenInApi('linkedDataIsShared');

export const ATTR_LINKED_DATA_KEY = 'linkedDataKey';

export function createPreviewBlockFromBadge(badge) {
  return createBlock(Constants.BLOCK_DATA_LAYOUT_PREVIEW, {
    [ATTR_LINKED_DATA_KEY]: badge[OPTION_DATA_KEY],
    [ATTR_LINKED_DATA_BLOCK_NAME]: badge[OPTION_BLOCK_NAME],
    [ATTR_LINKED_DATA_LABEL]: badge[OPTION_LABEL],
    [ATTR_LINKED_DATA_IS_SHARED]: parseOptionIsShared(badge[OPTION_IS_SHARED]),
  });
}

const tryUpdateLabel = debounce((badge, oldLabel, updateLabel) => {
  // Check to see if need to update label. Note that all badges/options should theoretically have
  // the same label so only need to find one
  if (badge && badge[OPTION_LABEL] !== oldLabel) {
    updateLabel(badge[OPTION_LABEL]);
  }
}, 200);

// NOTE: no ID so should not be treated as an independent entity in the API

tryRegisterBlockType(Constants.BLOCK_DATA_LAYOUT_PREVIEW, {
  apiVersion: 2,
  title: __('Data Layout Preview', Constants.TEXT_DOMAIN),
  category: Constants.CATEGORY_LETTER_TEMPLATE,
  icon: preformatted,
  description: __(
    'Preview of a local or shared data element for determining layout',
    Constants.TEXT_DOMAIN,
  ),
  parent: [Constants.BLOCK_LETTER_DATA_LAYOUT],
  attributes: {
    [API_CONFIG_IGNORED_ATTRIBUTES]: { type: 'array', default: ['lock'] },
    // Block-level locking since WP 5.9 using the older syntax
    // 1. Older syntax in dev note: https://make.wordpress.org/core/2022/01/08/locking-blocks-in-wordpress-5-9/
    // 2. Newer syntax in documentation: https://developer.wordpress.org/block-editor/reference-guides/block-api/block-templates/#individual-block-locking
    lock: {
      type: 'object',
      default: {
        remove: true, // CANNOT remove this block
        move: false, // CAN move this block
      },
    },
    // We use the data key instead of the combo key because this is a DATA ELEMENT PREVIEW which
    // is a LARGER entity than a single data option. One data element can give rise to several data
    // options. For example, an options data element gives rise to a distinct data option for every
    // shape value attribute it contains
    [ATTR_LINKED_DATA_KEY]: { type: 'string' },
    [ATTR_LINKED_DATA_BLOCK_NAME]: { type: 'string' },
    [ATTR_LINKED_DATA_LABEL]: { type: 'string' },
    [ATTR_LINKED_DATA_IS_SHARED]: { type: 'boolean' },
  },
  edit({ clientId, attributes, setAttributes }) {
    // Update label based on options that this preview is watching. Need to rely on parent
    // `BLOCK_LETTER_DATA_LAYOUT` to remove because block locking prevents us from using the
    // `removeBlock` action availble via the `core/block-editor` store so we need to use
    // `replaceInnerBlocks` at the parent block level instead
    const icon = getIconFromBlockName(attributes[ATTR_LINKED_DATA_BLOCK_NAME]),
      title = getTitleFromBlockName(attributes[ATTR_LINKED_DATA_BLOCK_NAME]),
      { badges } = useContext(LetterContentContext),
      foundBadge = find(
        badges,
        (badge) => badge[OPTION_DATA_KEY] === attributes[ATTR_LINKED_DATA_KEY],
      );
    useEffect(() => {
      tryUpdateLabel(
        foundBadge,
        attributes[ATTR_LINKED_DATA_LABEL],
        (linkedDataLabel) =>
          setAttributes({ [ATTR_LINKED_DATA_LABEL]: linkedDataLabel }),
      );
      return tryUpdateLabel.cancel;
    }, [foundBadge?.[OPTION_LABEL]]);
    return (
      <div
        {...useBlockProps({
          className: `data-layout-preview-container__preview data-layout-preview ${
            attributes[ATTR_LINKED_DATA_IS_SHARED]
              ? 'data-layout-preview--shared'
              : ''
          }`,
        })}
      >
        <h3 className="data-layout-preview__title">
          {icon && (
            <HelpLabel
              wrapperElementType="div"
              wrapperProps={{ className: 'data-layout-preview__title__icon' }}
              text={title}
            >
              <Icon icon={icon} />
            </HelpLabel>
          )}
          <span className="data-layout-preview__title__text">
            {attributes[ATTR_LINKED_DATA_LABEL]}
          </span>
        </h3>
        {attributes[ATTR_LINKED_DATA_IS_SHARED] && (
          <div className="data-layout-preview__shared-badge">
            {LABEL_SHARED_OPTION}
          </div>
        )}
      </div>
    );
  },
});
