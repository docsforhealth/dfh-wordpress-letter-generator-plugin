import { RichText, useBlockProps } from '@wordpress/block-editor';
import { renderToString, useContext, useEffect } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import $ from 'jquery';
import { debounce, isEqual } from 'lodash';
import { TRIGGER_PREFIX } from 'src/js/autocomplete/data-element';
import {
  DataOptionsContext,
  LetterContentContext,
} from 'src/js/block/letter-template';
import DataElementCompletion from 'src/js/component/data-element-completion';
import EditorLabelWrapper from 'src/js/component/editor-label-wrapper';
import * as Constants from 'src/js/constants';
import {
  ELEMENT_ATTR_COMBO_KEY,
  OPTION_COMBO_KEY,
  OPTION_DISPLAY_LABEL,
} from 'src/js/constants/data-element';
import { tryRegisterBlockType } from 'src/js/utils/block';
import { completionDatasetToOption } from 'src/js/utils/data-element';

const tryUpdateBadges = debounce((clientId, oldBadges, updateBadges) => {
  const newBadges = $.uniqueSort(
    $(`[data-block='${clientId}'] .data-element-completion`),
  )
    .map((index, element) => completionDatasetToOption(element.dataset))
    .toArray();
  if (!isEqual(oldBadges, newBadges)) {
    updateBadges(newBadges);
  }
}, 200);

tryRegisterBlockType(Constants.BLOCK_LETTER_CONTENT, {
  apiVersion: 2,
  title: __('Letter Content', Constants.TEXT_DOMAIN),
  category: Constants.CATEGORY_LETTER_TEMPLATE,
  icon: 'text-page',
  description: __(
    'Specify letter content with embedded data elements for a letter template',
    Constants.TEXT_DOMAIN,
  ),
  parent: [Constants.BLOCK_LETTER_TEMPLATE],
  attributes: {
    content: { type: 'string', default: '' },
  },
  edit({ clientId, attributes, setAttributes }) {
    // Update badges on initail render and also whenever rich text content changes
    const { badges, updateBadges } = useContext(LetterContentContext);
    useEffect(
      () => tryUpdateBadges(clientId, badges, updateBadges),
      [attributes.content],
    );
    // Track local and shared data elements to see if any badges need updating or removing
    const { comboKeyToOption } = useContext(DataOptionsContext);
    useEffect(() => {
      if (!badges || !comboKeyToOption || !attributes.content) {
        return;
      }
      let modified = false;
      const $content = $($.parseHTML(`<div>${attributes.content}</div>`));
      badges.forEach((badge) => {
        const comboKey = badge[OPTION_COMBO_KEY],
          option = comboKeyToOption[comboKey],
          badgeSelector = `[${ELEMENT_ATTR_COMBO_KEY}='${comboKey}']`;
        // if option is missing, then need to remove badge
        if (!option) {
          modified = true;
          // replace with trigger prefix to provide a visual indicator that a badge was removed
          // and also to allow for quick re-insertion of a new badge in its place
          $content.find(badgeSelector).replaceWith(TRIGGER_PREFIX);
        }
        // if display labels don't match, then need to update badge
        else if (badge[OPTION_DISPLAY_LABEL] !== option[OPTION_DISPLAY_LABEL]) {
          modified = true;
          const newBadge = <DataElementCompletion {...option} />;
          $content.find(badgeSelector).replaceWith(renderToString(newBadge));
        }
      });
      if (modified) {
        setAttributes({ content: $content.html() });
      }
    }, [comboKeyToOption]);
    return (
      <div {...useBlockProps()}>
        <EditorLabelWrapper
          label={__('Letter template content', Constants.TEXT_DOMAIN)}
        >
          {(id) => (
            <RichText
              id={id}
              placeholder={__('Enter template here', Constants.TEXT_DOMAIN)}
              value={attributes.content}
              onChange={(content) => setAttributes({ content })}
              allowedFormats={[Constants.FORMAT_DATA_ELEMENT]}
              autocompleters={[Constants.AUTOCOMPLETE_DATA_ELEMENT]}
              preserveWhiteSpace
            />
          )}
        </EditorLabelWrapper>
      </div>
    );
  },
  save({ attributes }) {
    // Should be used within the `save` hook to properly save `content`
    // see https://github.com/WordPress/gutenberg/tree/trunk/packages/block-editor/src/components/rich-text#richtextcontent
    return (
      <div {...useBlockProps.save()}>
        <RichText.Content value={attributes.content} />
      </div>
    );
  },
});
