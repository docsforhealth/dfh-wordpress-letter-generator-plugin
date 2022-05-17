import { TextareaControl, TextControl } from '@wordpress/components';
import PropTypes from 'prop-types';
import {
  TEXT_TYPE_DATE,
  TEXT_TYPE_LONG,
  TEXT_TYPE_PHONE_NUMBER,
  TEXT_TYPE_SHORT,
  TEXT_TYPE_VALUES,
} from 'src/js/block/helper/data-element-text';
import {
  ATTR_HELP_TEXT,
  ATTR_KEY,
  ATTR_LABEL,
  ATTR_PLACEHOLDER,
  ATTR_TYPE,
} from 'src/js/constants/data-element';

export default function ShapeValueEditField({
  [ATTR_KEY]: dataKey,
  [ATTR_TYPE]: textType,
  [ATTR_LABEL]: label,
  [ATTR_PLACEHOLDER]: placeholder,
  [ATTR_HELP_TEXT]: helpText,
  value,
  onChange,
}) {
  const renderProps = {
    label,
    placeholder,
    help: helpText,
    value,
    onChange: (newValue) => onChange(dataKey, newValue),
  };
  switch (textType) {
    case TEXT_TYPE_SHORT:
      return <TextControl {...renderProps} />;
    case TEXT_TYPE_LONG:
      return <TextareaControl {...renderProps} />;
    case TEXT_TYPE_DATE:
      return <TextControl {...renderProps} type="date" />;
    case TEXT_TYPE_PHONE_NUMBER:
      return <TextControl {...renderProps} type="tel" />;
    default:
      return null;
  }
}
ShapeValueEditField.propTypes = {
  [ATTR_KEY]: PropTypes.string.isRequired,
  [ATTR_TYPE]: PropTypes.oneOf(TEXT_TYPE_VALUES),
  [ATTR_LABEL]: PropTypes.string,
  [ATTR_PLACEHOLDER]: PropTypes.string,
  [ATTR_HELP_TEXT]: PropTypes.string,
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
};
