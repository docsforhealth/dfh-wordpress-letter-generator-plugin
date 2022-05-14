import { TextControl } from '@wordpress/components';
import { forwardRef } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { filter, isEmpty, values } from 'lodash';
import PropTypes from 'prop-types';
import { ATTR_KEY, ATTR_LABEL } from 'src/js/block/shared/data-element';
import Collapsible, { ToggleButton } from 'src/js/component/collapsible';
import EditorLabelWrapper, {
  STYLE_FORM_LABEL,
} from 'src/js/component/editor-label-wrapper';
import ShapeValueEditField from 'src/js/component/shape-value-edit-field';
import * as Constants from 'src/js/constants';

const DataElementOption = forwardRef(
  (
    {
      label,
      thisValue,
      shapeValues,
      updateLabel,
      updateThisValue,
      className,
      ...otherProps
    },
    ref,
  ) => {
    const filteredValueAttrs = filter(values(thisValue)),
      hasValueAttrs = !isEmpty(filteredValueAttrs);
    return (
      <Collapsible
        {...otherProps}
        ref={ref}
        className={`data-element-option ${className ?? ''}`}
        startOpen={isEmpty(label) || !hasValueAttrs}
        display={(isOpen, setIsOpen) => (
          <div
            className={`data-element-option__view ${
              isOpen ? 'data-element-option__view--open' : ''
            }`}
          >
            <div className="data-element-option__label">
              <h3 className="data-element-option__label__title">
                {label
                  ? label
                  : __(
                      'Please fill out the label for this choice',
                      Constants.TEXT_DOMAIN,
                    )}
              </h3>
              <div className="data-element-option__values">
                {hasValueAttrs && shapeValues
                  ? shapeValues.map((valueAttrs) => (
                      <span
                        key={valueAttrs[ATTR_KEY]}
                        className={`data-element-option__values__value ${
                          thisValue?.[valueAttrs[ATTR_KEY]]
                            ? ''
                            : 'data-element-option__values__value--missing'
                        }`}
                      >
                        <span className="data-element-option__values__value__label">
                          {valueAttrs[ATTR_LABEL]}
                        </span>{' '}
                        {thisValue?.[valueAttrs[ATTR_KEY]]}
                      </span>
                    ))
                  : __(
                      'Please fill out values for this choice',
                      Constants.TEXT_DOMAIN,
                    )}
              </div>
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
  },
);
DataElementOption.propTypes = {
  label: PropTypes.string,
  thisValue: PropTypes.object,
  // IMPORTANT: shape is the an array of the ATTRIBUTES of the TEXT DATA ELEMENTS
  shapeValues: PropTypes.arrayOf(PropTypes.object),
  updateLabel: PropTypes.func.isRequired,
  updateThisValue: PropTypes.func.isRequired,
};

export default DataElementOption;
