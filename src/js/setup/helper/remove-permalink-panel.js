import { dispatch, select } from '@wordpress/data';
import domReady from '@wordpress/dom-ready';
import * as Constants from 'src/js/constants';

// panel source: https://github.com/WordPress/gutenberg/blob/trunk/packages/edit-post/src/components/sidebar/post-link/index.js
const PANEL_PERMALINK = 'post-link';

domReady(function () {
  const isLinkEnabled = select(Constants.STORE_EDITOR_UI).isEditorPanelEnabled(
    PANEL_PERMALINK,
  );
  if (isLinkEnabled) {
    dispatch(Constants.STORE_EDITOR_UI).toggleEditorPanelEnabled(
      PANEL_PERMALINK,
    );
  }
});
