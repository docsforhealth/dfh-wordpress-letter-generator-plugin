import { InnerBlocks, useBlockProps } from '@wordpress/block-editor';
import { createBlock } from '@wordpress/blocks';
import { Fill } from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import { useContext, useEffect } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { debounce, isEqual, keyBy } from 'lodash';
import {
  DataOptionsContext,
  LetterTemplateContext,
} from 'src/js/block/letter-template';
import EditorLabelWrapper from 'src/js/component/editor-label-wrapper';
import MessageDisplay from 'src/js/component/message-display';
import PlaceholderWithOptions from 'src/js/component/placeholder-with-options';
import * as Constants from 'src/js/constants';
import {
  IMAGE_INFO,
  LETTER_DATA_ELEMENTS_INFO,
  OPTIONS_INFO,
  OPTION_COMBO_KEY,
  TEXT_INFO,
} from 'src/js/constants/data-element';
import useInsertBlock from 'src/js/hook/use-insert-block';
import useSharedElementApiData from 'src/js/hook/use-shared-element-api-data';
import {
  countInnerBlocks,
  slotName,
  tryRegisterBlockType,
} from 'src/js/utils/block';
import {
  buildSharedDataOptions,
  getLocalDataOptions,
} from 'src/js/utils/data-element';

const tryUpdateDataOptions = debounce(
  (sharedOptions, localOptions, oldDataOptionObj, updateDataOptionObj) => {
    const newDataOptionObj = keyBy(
      [...sharedOptions, ...localOptions],
      OPTION_COMBO_KEY,
    );
    if (!isEqual(oldDataOptionObj, newDataOptionObj)) {
      updateDataOptionObj(newDataOptionObj);
    }
  },
  200,
);

tryRegisterBlockType(LETTER_DATA_ELEMENTS_INFO.name, {
  ...LETTER_DATA_ELEMENTS_INFO,
  apiVersion: 2,
  category: Constants.CATEGORY_LETTER_TEMPLATE,
  parent: [Constants.BLOCK_LETTER_TEMPLATE],
  edit({ clientId }) {
    const { templateClientId, updateNumLocalDataElements } = useContext(
        LetterTemplateContext,
      ),
      insertBlock = useInsertBlock(clientId),
      onSelect = ({ name }) => insertBlock(createBlock(name));
    // Keep track of data options for local and shared data elements for updating in
    // `BLOCK_LETTER_CONTENT` and individual `BLOCK_DATA_LAYOUT_PREVIEW` blocks
    const [sharedElementApiData, isSharedFetchDone] = useSharedElementApiData(
        { per_page: -1 },
        [], // Only fetch the shared data elements/options ON INITIAL RENDER
      ),
      numInnerBlocks = useSelect((select) =>
        countInnerBlocks(clientId, select),
      ),
      showEmptyState = numInnerBlocks === 0,
      // Fetch local options on every render
      localOptions = useSelect((select) =>
        getLocalDataOptions(null, select, clientId),
      ),
      { comboKeyToOption, updateComboKeyToOption } =
        useContext(DataOptionsContext);
    // Track number of local data elements for the tab badge
    useEffect(
      () => updateNumLocalDataElements(numInnerBlocks),
      [numInnerBlocks],
    );
    // Update data options context with any local data element changes
    useEffect(() => {
      // need to wait until shared elements are finished fetching to avoid a race condition
      // where all shared elements are removed because they aren't shown in `comboKeyToOption`
      // INSTEAD, we allow `comboKeyToOption` to remain null until we can initialize with both
      // local and shared data elments
      if (isSharedFetchDone) {
        const sharedOptions = buildSharedDataOptions(sharedElementApiData);
        tryUpdateDataOptions(
          sharedOptions,
          localOptions,
          comboKeyToOption,
          updateComboKeyToOption,
        );
      }
      return tryUpdateDataOptions.cancel;
    }, [
      sharedElementApiData,
      isSharedFetchDone,
      localOptions,
      comboKeyToOption,
    ]);
    return (
      <Fill name={slotName(LETTER_DATA_ELEMENTS_INFO.name, templateClientId)}>
        <div {...useBlockProps()}>
          {showEmptyState && (
            <MessageDisplay
              title={__('No data elements yet!', Constants.TEXT_DOMAIN)}
            >
              {__(
                'Add a data element to specify the types of content can be inserted into your letter template.',
                Constants.TEXT_DOMAIN,
              )}
            </MessageDisplay>
          )}
          <EditorLabelWrapper label={LETTER_DATA_ELEMENTS_INFO.title}>
            {(id) => (
              <div
                id={id}
                tabIndex="0"
                className="data-elements-counter-container"
              >
                <InnerBlocks
                  templateLock={Constants.INNER_BLOCKS_UNLOCKED}
                  // NOTE we can't actually prevent any of these block types from showing up
                  // since all have `BLOCK_LETTER_DATA_ELEMENTS` in their `parents` property, which
                  // `allowedBlocks` CANNOT override, see https://github.com/WordPress/gutenberg/issues/32436
                  allowedBlocks={[
                    IMAGE_INFO.name,
                    OPTIONS_INFO.name,
                    TEXT_INFO.name,
                  ]}
                  renderAppender={() => (
                    <PlaceholderWithOptions
                      icon={LETTER_DATA_ELEMENTS_INFO.icon}
                      label={
                        showEmptyState
                          ? __(
                              'Start by adding a data element',
                              Constants.TEXT_DOMAIN,
                            )
                          : __(
                              'Add another data element',
                              Constants.TEXT_DOMAIN,
                            )
                      }
                      options={[
                        {
                          ...IMAGE_INFO,
                          label: IMAGE_INFO.title,
                          onSelect,
                        },
                        {
                          ...OPTIONS_INFO,
                          label: OPTIONS_INFO.title,
                          onSelect,
                        },
                        {
                          ...TEXT_INFO,
                          label: TEXT_INFO.title,
                          onSelect,
                        },
                      ]}
                    />
                  )}
                />
              </div>
            )}
          </EditorLabelWrapper>
        </div>
      </Fill>
    );
  },
  save() {
    return (
      <div {...useBlockProps.save()}>
        <InnerBlocks.Content />
      </div>
    );
  },
});
