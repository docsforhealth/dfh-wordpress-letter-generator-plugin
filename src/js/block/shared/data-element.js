import {
  TextareaControl,
  TextControl,
  ToggleControl,
} from '@wordpress/components';
import * as Constants from 'src/js/constants';

// TODO add: this element is used in ## places?
// TODO some kind of portal system for nested inner blocks to add to?

export const config = {
  category: Constants.CATEGORY_LETTER_TEMPLATE,
  // parent: [Constants.BLOCK_DATA_ELEMENTS], // TODO
  // supports: { inserter: false }, // TODO
  attributes: {
    key: { type: 'string' },
    label: { type: 'string' },
    helpText: { type: 'string' },
    saveable: { type: 'boolean' },
    required: { type: 'boolean', default: true },
  },
};

export function Edit({ attributes, setAttributes, children, ...otherProps }) {
  return (
    <div {...otherProps} className="data-element">
      <TextControl
        label={__('Label', Constants.TEXT_DOMAIN)}
        value={attributes.label}
        onChange={(label) => setAttributes({ label })}
      />
      <TextareaControl
        label={__('Help text', Constants.TEXT_DOMAIN)}
        help={__(
          'Optional, provide any tips for filling out this data element',
          Constants.TEXT_DOMAIN,
        )}
        value={attributes.helpText}
        onChange={(helpText) => setAttributes({ helpText })}
      />
      <ToggleControl
        label={__('Is this field mandatory?', Constants.TEXT_DOMAIN)}
        checked={attributes.required}
        onChange={(required) => setAttributes({ required })}
      />
      <ToggleControl
        label={__('Allow saving locally?', Constants.TEXT_DOMAIN)}
        help={__(
          "Saving to the user's device is NOT secure. Make sure that this field will not have protected health information",
          Constants.TEXT_DOMAIN,
        )}
        checked={attributes.saveable}
        onChange={(saveable) => setAttributes({ saveable })}
      />
      {children}
    </div>
  );
}
// TODO finish
Edit.propTypes = {

};
