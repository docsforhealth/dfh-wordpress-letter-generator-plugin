import { getBlockType } from '@wordpress/blocks';
import { Fill, Slot } from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { isEmpty } from 'lodash';
import PropTypes from 'prop-types';
import Collapsible from 'src/js/component/collapsible';
import { SLOT_INFO } from 'src/js/component/data-element/contents';
import StatusInfoDisplay from 'src/js/component/status-info-display';
import * as Constants from 'src/js/constants';
import { slotName } from 'src/js/utils/block';

export default function Info({ clientId, errors }) {
  const { name } = useSelect((select) =>
      select(Constants.STORE_BLOCK_EDITOR).getBlock(clientId),
    ),
    { icon, title } = getBlockType(name);
  return (
    <>
      <div className="data-element__info data-elements-counter-container__info">
        <span className="data-element__info__item">{title}</span>
        <Slot name={slotName(SLOT_INFO, clientId)} />
      </div>
      <Collapsible
        display={(isOpen, setIsOpen) =>
          !isEmpty(errors) && (
            <Fill name={slotName(SLOT_INFO, clientId)}>
              <button
                type="button"
                className="data-element__info__error-button"
                onClick={() => setIsOpen(!isOpen)}
              >
                {(isOpen
                  ? __('Hide', Constants.TEXT_DOMAIN)
                  : __('View', Constants.TEXT_DOMAIN)) +
                  ' ' +
                  errors.length +
                  ' ' +
                  (errors.length === 1
                    ? __('validation error', Constants.TEXT_DOMAIN)
                    : __('validation errors', Constants.TEXT_DOMAIN))}
              </button>
            </Fill>
          )
        }
      >
        <StatusInfoDisplay className="data-element__errors" errors={errors} />
      </Collapsible>
    </>
  );
}
Info.propTypes = {
  clientId: PropTypes.string.isRequired,
  errors: PropTypes.array,
};
