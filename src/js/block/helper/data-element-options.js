import { useBlockProps } from '@wordpress/block-editor';
import { registerBlockType } from '@wordpress/blocks';
import { ToggleControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import merge from 'lodash.merge';
import * as Option from 'src/js/block/helper/data-element-options-option';
import { config, Edit } from 'src/js/block/shared/data-element';
import * as Constants from 'src/js/constants';

// TODO
// TODO figure out how to specify option shape then apply to OTHER too
// TODO React component to label InnerBlocks (and later on, RichText)

const ATTR_VALUE_SHAPE = 'shapeOfValue';

registerBlockType(
  Constants.BLOCK_DATA_ELEMENT_OPTIONS,
  merge(config, {
    apiVersion: 2,
    title: __('Options Data Element', Constants.TEXT_DOMAIN),
    icon: 'list-view',
    description: __(
      'Customize an options-based data element',
      Constants.TEXT_DOMAIN,
    ),
    attributes: {
      hasOtherOption: { type: 'boolean', default: false },
      [ATTR_VALUE_SHAPE]: Option.CONTEXT_SHAPE_DEFINITION,
    },
    providesContext: {
      [Option.CONTEXT_SHAPE_KEY]: ATTR_VALUE_SHAPE,
    },
    edit(props) {
      const { attributes, setAttributes } = props;

      // TODO `useEffect` here to update `ATTR_VALUE_SHAPE` from InnerBlocks within `BLOCK_DATA_ELEMENT_OPTIONS_SHAPE`

      return (
        <Edit {...props} {...useBlockProps()}>
          <ToggleControl
            label={__('Option for other?', Constants.TEXT_DOMAIN)}
            checked={attributes.hasOtherOption}
            onChange={(hasOtherOption) => setAttributes({ hasOtherOption })}
          />
          <InnerBlocks
            templateLock={Constants.INNER_BLOCKS_LOCKED}
            template={[
              [Constants.BLOCK_DATA_ELEMENT_OPTIONS_SHAPE],
              [Constants.BLOCK_DATA_ELEMENT_OPTIONS_CHOICES],
            ]}
          />
        </Edit>
      );
    },
  }),
);
