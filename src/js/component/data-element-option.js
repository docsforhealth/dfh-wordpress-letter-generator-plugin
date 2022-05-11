import { TextControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import PropTypes from 'prop-types';
import { ATTR_KEY, ATTR_LABEL } from 'src/js/block/shared/data-element';
import Collapsible, { ToggleButton } from 'src/js/component/collapsible';
import EditorLabelWrapper, {
  STYLE_FORM_LABEL,
} from 'src/js/component/editor-label-wrapper';
import ShapeValueEditField from 'src/js/component/shape-value-edit-field';
import * as Constants from 'src/js/constants';

export default function DataElementOption({
  label,
  thisValue,
  shapeValues,
  updateLabel,
  updateThisValue,
}) {
  return (
    <Collapsible
      className="data-element-option"
      display={(isOpen, setIsOpen) => (
        <div className="data-element-option__view">
          <div className="data-element-option__label">
            <h3 className="data-element-option__label__title">{label}</h3>
            <p className="data-element-option__label__subtitle">
              {shapeValues?.map((valueAttrs) => (
                <span
                  key={valueAttrs[ATTR_KEY]}
                  className="data-element-option__value"
                >
                  <span className="data-element-option__value__label">
                    {valueAttrs[ATTR_LABEL]}
                  </span>{' '}
                  {thisValue?.[valueAttrs[ATTR_KEY]]}
                </span>
              ))}
            </p>
          </div>
          <ToggleButton isOpen={isOpen} setIsOpen={setIsOpen} />
        </div>
      )}
    >
      <div className="data-element-option__edit">
        <TextControl
          label={__('Choice label', Constants.TEXT_DOMAIN)}
          value={label}
          onChange={updateLabel}
        />
        <EditorLabelWrapper
          label={__('Choice values', Constants.TEXT_DOMAIN)}
          style={STYLE_FORM_LABEL}
        >
          {(id) => (
            <div id={id} tabIndex="0">
              {shapeValues?.map((valueAttrs) => {
                const dataKey = valueAttrs[ATTR_KEY];
                return (
                  <ShapeValueEditField
                    {...valueAttrs}
                    key={dataKey}
                    // Set default as empty string to prevent uncontrolled-->controlled errors
                    value={thisValue?.[dataKey] ?? ''}
                    onChange={updateThisValue}
                  />
                );
              })}
            </div>
          )}
        </EditorLabelWrapper>
      </div>
    </Collapsible>
  );
}
DataElementOption.propTypes = {
  label: PropTypes.string,
  thisValue: PropTypes.object,
  // IMPORTANT: shape is the an array of the ATTRIBUTES of the TEXT DATA ELEMENTS
  shapeValues: PropTypes.arrayOf(PropTypes.object),
  updateLabel: PropTypes.func.isRequired,
  updateThisValue: PropTypes.func.isRequired,
};
