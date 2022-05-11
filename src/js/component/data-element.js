import { Slot, __experimentalUseSlot as useSlot } from '@wordpress/components';
import PropTypes from 'prop-types';
import Contents, { SLOT_OVERLAY } from 'src/js/component/data-element/contents';
import Controls from 'src/js/component/data-element/controls';
import Header from 'src/js/component/data-element/header';
import { slotName } from 'src/js/utils/data-element';

// NOTE: `SlotFillProvider` already included in default WP Block Editor's root
// see https://github.com/WordPress/gutenberg/tree/trunk/packages/components/src/slot-fill

export default function DataElement(props) {
  const { children, ...allPropsExceptChildren } = props,
    { clientId } = props;
  const overlay = useSlot(slotName(SLOT_OVERLAY, clientId)),
    hasOverlays = overlay?.fills?.length > 0;
  return (
    <div className="data-element">
      <Header {...allPropsExceptChildren} />
      <Controls {...allPropsExceptChildren} forceHide={hasOverlays} />
      <Contents {...allPropsExceptChildren} forceHide={hasOverlays}>
        {children}
      </Contents>
      <Slot name={slotName(SLOT_OVERLAY, clientId)} bubblesVirtually />
    </div>
  );
}
DataElement.propTypes = {
  clientId: PropTypes.string.isRequired,
};

// To ensure proper saving for certain WP components
DataElement.Content = function (props) {
  const { children, ...allPropsExceptChildren } = props;
  return (
    <>
      <Controls.Content {...allPropsExceptChildren} />
      {children}
    </>
  );
};
