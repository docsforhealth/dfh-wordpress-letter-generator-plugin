import { useBlockProps } from '@wordpress/block-editor';
import { registerBlockType } from '@wordpress/blocks';
import { TextControl, ToggleControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import merge from 'lodash.merge';
import { config, Edit } from 'src/js/block/shared/data-element';
import * as Constants from 'src/js/constants';

// TODO

registerBlockType(
  Constants.BLOCK_DATA_ELEMENT_IMAGE,
  merge(config, {
    apiVersion: 2,
    title: __('Image Data Element', Constants.TEXT_DOMAIN),
    icon: 'format-image',
    description: __(
      'Customize an image-based data element',
      Constants.TEXT_DOMAIN,
    ),
    attributes: {
      uploadLabel: { type: 'string' },
      canDraw: { type: 'boolean', default: false },
      drawLabel: { type: 'string' },
    },
    edit(props) {
      const { attributes, setAttributes } = props;
      return (
        <Edit {...props} {...useBlockProps()}>
          <TextControl
            label={__('Upload image label', Constants.TEXT_DOMAIN)}
            value={attributes.uploadLabel}
            onChange={(uploadLabel) => setAttributes({ uploadLabel })}
          />
          <ToggleControl
            label={__('Allow drawing input?', Constants.TEXT_DOMAIN)}
            checked={attributes.canDraw}
            onChange={(canDraw) => setAttributes({ canDraw })}
          />
          <TextControl
            label={__('Draw option label', Constants.TEXT_DOMAIN)}
            value={attributes.drawLabel}
            onChange={(drawLabel) => setAttributes({ drawLabel })}
          />
        </Edit>
      );
    },
  }),
);
