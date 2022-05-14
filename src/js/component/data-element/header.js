import {
  Slot,
  TextControl,
  __experimentalUseSlot as useSlot,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { some } from 'lodash';
import PropTypes from 'prop-types';
import { SLOT_HEADER } from 'src/js/component/data-element/contents';
import * as Constants from 'src/js/constants';
import { buildAttrPropType, slotName } from 'src/js/utils/data-element';

export default function Header({ clientId, label }) {
  const headerMore = useSlot(SLOT_HEADER);
  const hasContent = some([label.shouldShow, headerMore?.fills?.length]);
  return (
    hasContent && (
      <div className="data-element__header">
        <Slot name={slotName(SLOT_HEADER, clientId)} />
        {label.shouldShow && (
          <TextControl
            className="data-element__control data-element__control--expand"
            label={__('Label', Constants.TEXT_DOMAIN)}
            placeholder={__('Enter question label...', Constants.TEXT_DOMAIN)}
            value={label.value}
            onChange={label.onChange}
            hideLabelFromVision
          />
        )}
      </div>
    )
  );
}
Header.propTypes = {
  clientId: PropTypes.string.isRequired,
  label: buildAttrPropType(PropTypes.string, true),
};
